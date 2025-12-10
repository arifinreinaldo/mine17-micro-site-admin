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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking pet limit...</p>
        </div>
      </div>
    );
  }

  const canAddPet = petCount < MAX_PETS;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Add New Pet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the details to add a new pet to your collection
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {petCount} of {MAX_PETS} pets added
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pb-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-5">
                  {/* Pet Name */}
                  <div>
                    <label htmlFor="petName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Pet Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="petName"
                      id="petName"
                      required
                      value={formData.petName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter pet name"
                    />
                  </div>

                  {/* Pet Type */}
                  <div>
                    <label htmlFor="petType" className="block text-sm font-semibold text-gray-700 mb-2">
                      Pet Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="petType"
                      id="petType"
                      required
                      value={formData.petType}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Breed */}
                  <div>
                    <label htmlFor="breed" className="block text-sm font-semibold text-gray-700 mb-2">
                      Breed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="breed"
                      id="breed"
                      required
                      value={formData.breed}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter breed"
                    />
                  </div>

                  {/* Age and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        name="age"
                        id="age"
                        min="0"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="e.g., 2"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <input
                        type="text"
                        name="gender"
                        id="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="e.g., Male"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Color and Weight */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="color" className="block text-sm font-semibold text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        id="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="e.g., Brown"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        name="weight"
                        id="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        placeholder="e.g., 10 kg"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Tell us about your pet..."
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Identification Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification</h3>
                <div>
                  <label htmlFor="microchip" className="block text-sm font-semibold text-gray-700 mb-2">
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    name="microchip"
                    id="microchip"
                    value={formData.microchip}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="e.g., 123456789"
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Pet Photos Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pet Photos</h3>

                {/* Image Preview */}
                {imageFiles.length > 0 && (
                  <div className="mb-6">
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

                <div>
                  <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-2">
                    Add Images
                  </label>
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
                      <span className="font-medium">{imageFiles.length} file(s) selected and compressed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Personality Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personality Traits</h3>
                <div className="space-y-3">
                  {personalityTraits.map((trait, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={trait}
                        onChange={(e) => updatePersonalityTrait(index, e.target.value)}
                        disabled={isLoading}
                        placeholder="e.g., Friendly"
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => removePersonalityTrait(index)}
                        disabled={isLoading}
                        className="px-4 py-3 border-2 border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPersonalityTrait}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-3 border-2 border-indigo-300 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Personality Trait
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Health Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
                <div>
                  <label htmlFor="medicalInfo" className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Information
                  </label>
                  <textarea
                    name="medicalInfo"
                    id="medicalInfo"
                    rows={3}
                    value={formData.medicalInfo}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Enter any medical information, allergies, medications..."
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/pets')}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !canAddPet || compressingImages}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  title={!canAddPet ? `Maximum ${MAX_PETS} pets allowed` : ''}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding Pet...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Pet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
