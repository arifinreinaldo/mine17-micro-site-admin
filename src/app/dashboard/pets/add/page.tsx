'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, DATABASE_ID, PETS_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { PetFormData, PetType } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { ID, Query } from 'appwrite';
import { compressImages } from '@/lib/imageCompression';

export default function AddPetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [compressingImages, setCompressingImages] = useState(false);
  const [error, setError] = useState('');
  const [petCount, setPetCount] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [formData, setFormData] = useState<PetFormData>({
    petName: '',
    breed: '',
    age: '',
    gender: '',
    color: '',
    weight: '',
    description: '',
    personality: '',
    medicalInfo: '',
    petType: 'dog',
    microchip: '',
  });

  const MAX_PETS = 3;

  useEffect(() => {
    const checkPetLimit = async () => {
      if (!user) {
        setCheckingLimit(false);
        return;
      }

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          PETS_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );

        setPetCount(response.total);

        if (response.total >= MAX_PETS) {
          setError(`You have reached the maximum limit of ${MAX_PETS} pets. Please delete a pet before adding a new one.`);
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/pets');
          }, 3000);
        }
      } catch (err) {
        console.error('Error checking pet limit:', err);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkPetLimit();
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 3) {
        setError('Maximum 3 images allowed');
        e.target.value = '';
        return;
      }

      try {
        setCompressingImages(true);
        setError('');

        // Compress images before storing
        const compressedFiles = await compressImages(files);
        setImageFiles(compressedFiles);

        console.log('Images compressed successfully');
      } catch (err: any) {
        setError(err.message || 'Failed to compress images');
        e.target.value = '';
      } finally {
        setCompressingImages(false);
      }
    }
  };

  const addPersonalityTrait = () => {
    setPersonalityTraits([...personalityTraits, '']);
  };

  const removePersonalityTrait = (index: number) => {
    setPersonalityTraits(personalityTraits.filter((_, i) => i !== index));
  };

  const updatePersonalityTrait = (index: number, value: string) => {
    const updated = [...personalityTraits];
    updated[index] = value;
    setPersonalityTraits(updated);
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      try {
        // Generate unique filename using timestamp and unique ID
        const timestamp = Date.now();
        const uniqueId = ID.unique();
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${timestamp}_${uniqueId}.${fileExtension}`;

        const response = await storage.createFile(STORAGE_BUCKET_ID, uniqueId, file);
        const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${STORAGE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        imageUrls.push(fileUrl);
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    return imageUrls;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Double-check pet limit before creating
      if (petCount >= MAX_PETS) {
        throw new Error(`You have reached the maximum limit of ${MAX_PETS} pets. Please delete a pet before adding a new one.`);
      }

      // Upload images first
      const imageUrls = await uploadImages();

      // Convert age to number if provided
      const ageValue = formData.age && formData.age.trim() !== '' ? parseInt(formData.age, 10) : undefined;

      // Filter out empty personality traits
      const personalityArray = personalityTraits.filter(trait => trait.trim() !== '');

      // Create pet document
      const petData = {
        petName: formData.petName,
        breed: formData.breed,
        age: ageValue,
        gender: formData.gender || undefined,
        color: formData.color || undefined,
        weight: formData.weight || undefined,
        description: formData.description || undefined,
        personality: personalityArray.length > 0 ? personalityArray : undefined,
        medicalInfo: formData.medicalInfo || undefined,
        petType: formData.petType,
        userId: user.$id,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        microchip: formData.microchip || undefined,
      };

      await databases.createDocument(
        DATABASE_ID,
        PETS_COLLECTION_ID,
        ID.unique(),
        petData
      );

      router.push('/dashboard/pets');
    } catch (err: any) {
      setError(err.message || 'Failed to add pet');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const canAddPet = petCount < MAX_PETS;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Add New Pet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details to add a new pet to your collection.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              {petCount} of {MAX_PETS} pets added
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-gray-700">
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="petName"
                    id="petName"
                    required
                    value={formData.petName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="petType" className="block text-sm font-medium text-gray-700">
                    Pet Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="petType"
                    id="petType"
                    required
                    value={formData.petType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="breed"
                    id="breed"
                    required
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      name="age"
                      id="age"
                      min="0"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 2"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <input
                      type="text"
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      placeholder="e.g., Male"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      id="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., Brown"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <input
                      type="text"
                      name="weight"
                      id="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 10 kg"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="microchip" className="block text-sm font-medium text-gray-700">
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    name="microchip"
                    id="microchip"
                    value={formData.microchip}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personality Traits
                  </label>
                  <div className="space-y-2">
                    {personalityTraits.map((trait, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={trait}
                          onChange={(e) => updatePersonalityTrait(index, e.target.value)}
                          placeholder="e.g., Friendly"
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => removePersonalityTrait(index)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPersonalityTrait}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Add Personality Trait
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700">
                    Medical Information
                  </label>
                  <textarea
                    name="medicalInfo"
                    id="medicalInfo"
                    rows={2}
                    value={formData.medicalInfo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                    Pet Images (Max 3)
                  </label>
                  <input
                    type="file"
                    name="images"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={compressingImages}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {compressingImages && (
                    <p className="mt-2 text-sm text-indigo-600 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Compressing images...
                    </p>
                  )}
                  {!compressingImages && imageFiles.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {imageFiles.length} file(s) selected and compressed (max 3)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/pets')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !canAddPet}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canAddPet ? `Maximum ${MAX_PETS} pets allowed` : ''}
                >
                  {isLoading ? 'Adding Pet...' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
