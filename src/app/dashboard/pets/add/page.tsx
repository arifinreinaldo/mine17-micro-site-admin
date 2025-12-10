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
  const [isDragging, setIsDragging] = useState(false);
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

  const processFiles = async (files: File[]) => {
    const totalImages = imageFiles.length + files.length;

    if (totalImages > 3) {
      setError(`Maximum 3 images allowed. You have ${imageFiles.length} image(s) ready to upload. You can add ${Math.max(0, 3 - imageFiles.length)} more.`);
      return;
    }

    try {
      setCompressingImages(true);
      setError('');

      // Compress images before storing
      const compressedFiles = await compressImages(files);
      setImageFiles((prev) => [...prev, ...compressedFiles]);

      console.log('Images compressed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to compress images');
    } finally {
      setCompressingImages(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await processFiles(files);
    } else {
      setError('Please drop only image files');
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

                {/* Pet Images Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Images (Max 3)
                  </label>

                  {/* Image Preview */}
                  {imageFiles.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Images ({imageFiles.length}) - Ready to Upload
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Pet image ${index + 1}`}
                              className="h-32 w-full object-cover rounded-lg transition-all group-hover:shadow-lg border-2 border-green-200"
                            />
                            <button
                              type="button"
                              onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
                              title="Remove image"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>Upload images</span>
                          <input
                            type="file"
                            name="images"
                            id="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={compressingImages || isLoading}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>

                  {/* Image Count Info */}
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Selected: {imageFiles.length} image(s)</span>
                      {' • '}
                      <span className="font-medium">Can add: {Math.max(0, 3 - imageFiles.length)} more</span>
                      {' • '}
                      <span className="text-gray-500">Max: 3 total</span>
                    </p>
                  </div>

                  {/* Compression Loading */}
                  {compressingImages && (
                    <div className="mt-3 flex items-center text-indigo-600">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Compressing images...</span>
                    </div>
                  )}

                  {/* Files Selected Success */}
                  {!compressingImages && imageFiles.length > 0 && (
                    <div className="mt-3 text-sm text-green-600 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{imageFiles.length} image(s) compressed and ready to upload</span>
                    </div>
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
