'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, DATABASE_ID, PETS_COLLECTION_ID, STORAGE_BUCKET_ID, EXTERNAL_URL } from '@/lib/appwrite';
import { Pet } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { Query } from 'appwrite';
import QRCode from 'react-qr-code';

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        PETS_COLLECTION_ID,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt')
        ]
      );
      setPets(response.documents as unknown as Pet[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pets');
    } finally {
      setLoading(false);
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

  const deleteImagesFromStorage = async (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) {
      return;
    }

    console.log(`Deleting ${imageUrls.length} image(s) from storage...`);

    for (const imageUrl of imageUrls) {
      const fileId = extractFileIdFromUrl(imageUrl);

      if (!fileId) {
        console.log('Could not extract file ID from URL:', imageUrl);
        continue;
      }

      try {
        // Check if file exists before deleting
        await storage.getFile(STORAGE_BUCKET_ID, fileId);
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        console.log('✓ Deleted image from storage:', fileId);
      } catch (err: any) {
        // File doesn't exist or other error - just log and continue
        if (err.code === 404 || err.message.includes('not found')) {
          console.log('✓ Image already deleted, skipping:', fileId);
        } else {
          console.log('⚠ Error deleting image (continuing anyway):', fileId, err.message);
        }
      }
    }
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This will also delete all associated images.')) {
      return;
    }

    try {
      setDeleteLoading(petId);

      // Find the pet to get its imageUrls
      const pet = pets.find((p) => p.$id === petId);

      // Delete images from storage first
      if (pet?.imageUrls && pet.imageUrls.length > 0) {
        await deleteImagesFromStorage(pet.imageUrls);
      }

      // Then delete the pet document
      await databases.deleteDocument(DATABASE_ID, PETS_COLLECTION_ID, petId);
      setPets(pets.filter((pet) => pet.$id !== petId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete pet');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleShareLink = (petId: string) => {
    setSelectedPetId(petId);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedPetId(null);
  };

  const getPetTypeIcon = (petType: string) => {
    switch (petType) {
      case 'cat':
        return '🐱';
      case 'dog':
        return '🐶';
      case 'bird':
        return '🐦';
      default:
        return '🐾';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const MAX_PETS = 3;
  const canAddMorePets = pets.length < MAX_PETS;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pets Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pets.length} of {MAX_PETS} pets added
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/pets/add')}
          disabled={!canAddMorePets}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
          title={!canAddMorePets ? 'Maximum 3 pets allowed' : 'Add a new pet'}
        >
          Add New Pet
        </button>
      </div>

      {!canAddMorePets && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Maximum pets reached</h3>
              <p className="mt-1 text-sm text-yellow-700">
                You have reached the maximum limit of {MAX_PETS} pets. Please delete a pet to add a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {pets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No pets found. Add your first pet!</p>
          <button
            onClick={() => router.push('/dashboard/pets/add')}
            disabled={!canAddMorePets}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add New Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div
              key={pet.$id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{getPetTypeIcon(pet.petType)}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {pet.petName}
                      </h3>
                      <p className="text-sm text-gray-500">{pet.breed}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {pet.age && (
                    <div className="flex justify-between">
                      <span className="font-medium">Age:</span>
                      <span>{pet.age}</span>
                    </div>
                  )}
                  {pet.gender && (
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span>{pet.gender}</span>
                    </div>
                  )}
                  {pet.color && (
                    <div className="flex justify-between">
                      <span className="font-medium">Color:</span>
                      <span>{pet.color}</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex justify-between">
                      <span className="font-medium">Weight:</span>
                      <span>{pet.weight}</span>
                    </div>
                  )}
                  {pet.microchip && (
                    <div className="flex justify-between">
                      <span className="font-medium">Microchip:</span>
                      <span className="text-xs">{pet.microchip}</span>
                    </div>
                  )}
                </div>

                {pet.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {pet.description}
                  </p>
                )}

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/pets/edit/${pet.$id}`)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleShareLink(pet.$id!)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Share Link
                  </button>
                  <button
                    onClick={() => handleDelete(pet.$id!)}
                    disabled={deleteLoading === pet.$id}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === pet.$id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedPetId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl p-8 m-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Share Pet QR Code</h3>
              <button
                onClick={closeQRModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCode
                  value={`${EXTERNAL_URL}${selectedPetId}`}
                  size={256}
                  level="H"
                />
              </div>

              <div className="w-full bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Share Link:</p>
                <p className="text-sm text-gray-900 font-mono break-all bg-white p-2 rounded border border-gray-200">
                  {`${EXTERNAL_URL}${selectedPetId}`}
                </p>
              </div>

              <button
                onClick={closeQRModal}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
