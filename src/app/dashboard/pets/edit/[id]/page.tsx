'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases, storage, DATABASE_ID, PETS_COLLECTION_ID, STORAGE_BUCKET_ID } from '@/lib/appwrite';
import { Pet, PetFormData } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { ID } from 'appwrite';
import { compressImages } from '@/lib/imageCompression';

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compressingImages, setCompressingImages] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
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
        age: pet.age ? pet.age.toString() : '',
        gender: pet.gender || '',
        color: pet.color || '',
        weight: pet.weight || '',
        description: pet.description || '',
        personality: '',
        medicalInfo: pet.medicalInfo || '',
        petType: pet.petType,
        microchip: pet.microchip || '',
      });

      if (pet.personality) {
        setPersonalityTraits(pet.personality);
      }

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + files.length;

      if (totalImages > 3) {
        setError(`Maximum 3 images allowed. You have ${existingImages.length} existing image(s). You can add ${3 - existingImages.length} more.`);
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

      // Process image deletions first
      if (deletedImages.length > 0) {
        await processImageDeletions();
      }

      // Upload new images if any
      let imageUrls = [...existingImages];
      if (imageFiles.length > 0) {
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Convert age to number if provided
      const ageValue = formData.age && formData.age.trim() !== '' ? parseInt(formData.age, 10) : undefined;

      // Filter out empty personality traits
      const personalityArray = personalityTraits.filter(trait => trait.trim() !== '');

      // Update pet document
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
        imageUrls: imageUrls.length > 0 ? imageUrls : [],
        microchip: formData.microchip || undefined,
      };

      console.log('Updating pet with data:', petData);
      console.log('Image URLs being saved:', petData.imageUrls);

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

  const extractFileIdFromUrl = (url: string): string | null => {
    try {
      // URL format: .../storage/buckets/{bucketId}/files/{fileId}/view?project=...
      const match = url.match(/\/files\/([^\/]+)\/view/);
      return match ? match[1] : null;
    } catch (err) {
      console.error('Error extracting file ID:', err);
      return null;
    }
  };

  const removeExistingImage = (index: number) => {
    const imageUrl = existingImages[index];

    // Just mark for deletion, don't delete from storage yet
    setDeletedImages([...deletedImages, imageUrl]);
    setExistingImages(existingImages.filter((_, i) => i !== index));

    console.log('Marked image for deletion:', imageUrl);
  };

  const processImageDeletions = async () => {
    console.log('Processing deletions for', deletedImages.length, 'images');

    for (const imageUrl of deletedImages) {
      const fileId = extractFileIdFromUrl(imageUrl);

      if (!fileId) {
        console.log('Could not extract file ID from URL:', imageUrl);
        continue;
      }

      try {
        // First check if file exists
        await storage.getFile(STORAGE_BUCKET_ID, fileId);

        // File exists, delete it
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        console.log('✓ Deleted file from storage:', fileId);
      } catch (err: any) {
        // File doesn't exist or other error - just log and continue
        if (err.code === 404 || err.message.includes('not found')) {
          console.log('✓ File already deleted, skipping:', fileId);
        } else {
          console.log('⚠ Error deleting file (continuing anyway):', fileId, err.message);
        }
      }
    }

    console.log('Deletion processing complete');
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
                    Add More Images (Max 3 total)
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
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {existingImages.length} image(s), Can add: {3 - existingImages.length} more
                  </p>
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
                      {imageFiles.length} new file(s) selected and compressed
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
