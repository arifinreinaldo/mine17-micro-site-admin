'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases, storage, DATABASE_ID, PETS_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { Pet, PetFormData } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { ID } from 'appwrite';

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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

  useEffect(() => {
    if (params.id) {
      fetchPet(params.id as string);
    }
  }, [params.id]);

  const fetchPet = async (petId: string) => {
    try {
      setLoading(true);
      const response = await databases.getDocument(
        DATABASE_ID,
        PETS_COLLECTION_ID,
        petId
      );
      const pet = response as unknown as Pet;

      setFormData({
        petName: pet.petName,
        breed: pet.breed,
        age: pet.age || '',
        gender: pet.gender || '',
        color: pet.color || '',
        weight: pet.weight || '',
        description: pet.description || '',
        personality: pet.personality || '',
        medicalInfo: pet.medicalInfo || '',
        petType: pet.petType,
        microchip: pet.microchip || '',
      });

      if (pet.imageUrls) {
        setExistingImages(pet.imageUrls);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pet details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      try {
        const fileId = ID.unique();
        const response = await storage.createFile(STORAGE_BUCKET_ID, fileId, file);
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

      // Upload new images if any
      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Update pet document
      const petData = {
        petName: formData.petName,
        breed: formData.breed,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        color: formData.color || undefined,
        weight: formData.weight || undefined,
        description: formData.description || undefined,
        personality: formData.personality || undefined,
        medicalInfo: formData.medicalInfo || undefined,
        petType: formData.petType,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        microchip: formData.microchip || undefined,
      };

      await databases.updateDocument(
        DATABASE_ID,
        PETS_COLLECTION_ID,
        params.id as string,
        petData
      );

      router.push('/dashboard/pets');
    } catch (err: any) {
      setError(err.message || 'Failed to update pet');
    } finally {
      setIsLoading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit Pet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Update the pet information.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
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
                      Age
                    </label>
                    <input
                      type="text"
                      name="age"
                      id="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years"
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
                  <label htmlFor="personality" className="block text-sm font-medium text-gray-700">
                    Personality
                  </label>
                  <textarea
                    name="personality"
                    id="personality"
                    rows={2}
                    value={formData.personality}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  />
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

                {existingImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Images
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Pet image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 m-1 hover:bg-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                    Add More Images
                  </label>
                  <input
                    type="file"
                    name="images"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {imageFiles.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {imageFiles.length} new file(s) selected
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
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Updating Pet...' : 'Update Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
