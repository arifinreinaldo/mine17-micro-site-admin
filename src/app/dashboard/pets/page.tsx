'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage, DATABASE_ID, PETS_COLLECTION_ID, STORAGE_BUCKET_ID, EXTERNAL_URL } from '@/lib/appwrite';
import { Pet } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { Query } from 'appwrite';
import QRCode from 'react-qr-code';
import PawIcon from '@/public/paw.svg';

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [copyNotification, setCopyNotification] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchPets = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user, fetchPets]);

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

  const openDeleteModal = (pet: Pet) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPetToDelete(null);
  };

  const confirmDelete = async () => {
    if (!petToDelete || !petToDelete.$id) return;

    try {
      setDeleteLoading(petToDelete.$id);

      // Delete images from storage first
      if (petToDelete.imageUrls && petToDelete.imageUrls.length > 0) {
        await deleteImagesFromStorage(petToDelete.imageUrls);
      }

      // Then delete the pet document
      await databases.deleteDocument(DATABASE_ID, PETS_COLLECTION_ID, petToDelete.$id);
      setPets(pets.filter((pet) => pet.$id !== petToDelete.$id));
      
      closeDeleteModal();
    } catch (err: any) {
      setError(err.message || 'Failed to delete pet');
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

  const copyToClipboard = async (petId: string) => {
    const shareUrl = `${EXTERNAL_URL}${petId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyNotification(true);
      setTimeout(() => setCopyNotification(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

  const MAX_PETS = 1;
  const canAddMorePets = pets.length < MAX_PETS;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <PawIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Pets Management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {pets.length} of {MAX_PETS} pet{MAX_PETS > 1 ? 's' : ''} added
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 pb-8 pt-6">
            {/* Add Pet Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/dashboard/pets/add')}
                disabled={!canAddMorePets}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                title={!canAddMorePets ? 'Maximum 1 pet allowed' : 'Add a new pet'}
              >
                {!canAddMorePets ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Maximum Pet Limit Reached
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Pet
                  </>
                )}
              </button>
            </div>

            {/* Warning Message */}
            {!canAddMorePets && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Maximum pet limit reached</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      You have reached the maximum limit of {MAX_PETS} pet. Please delete your pet to add a new one.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
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

            {/* Pet List or Empty State */}
            {pets.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets found</h3>
                <p className="text-gray-500 mb-6">Add your first pet to get started!</p>
                <button
                  onClick={() => router.push('/dashboard/pets/add')}
                  disabled={!canAddMorePets}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Pet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pets.map((pet, index) => (
                  <div key={pet.$id}>
                    {index > 0 && <div className="border-t border-gray-200 my-4"></div>}
                    <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                              <span className="text-4xl">{getPetTypeIcon(pet.petType)}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {pet.petName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{pet.breed}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {pet.age && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Age</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{pet.age} years</p>
                          </div>
                        )}
                        {pet.gender && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{pet.gender}</p>
                          </div>
                        )}
                        {pet.color && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{pet.color}</p>
                          </div>
                        )}
                        {pet.weight && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{pet.weight}</p>
                          </div>
                        )}
                      </div>

                      {pet.microchip && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Microchip ID</p>
                          <p className="text-sm font-mono text-gray-900 mt-1">{pet.microchip}</p>
                        </div>
                      )}

                      {pet.description && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                          <p className="text-sm text-gray-700">{pet.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => router.push(`/dashboard/pets/edit/${pet.$id}`)}
                          className="flex justify-center items-center gap-2 px-4 py-2.5 border-2 border-indigo-300 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Pet
                        </button>
                        <button
                          onClick={() => handleShareLink(pet.$id!)}
                          className="flex justify-center items-center gap-2 px-4 py-2.5 border-2 border-green-300 text-green-700 font-medium rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Share QR
                        </button>
                        <button
                          onClick={() => openDeleteModal(pet)}
                          disabled={deleteLoading === pet.$id}
                          className="flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent text-white font-medium rounded-lg bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {deleteLoading === pet.$id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete Pet
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && petToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 m-4 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Pet?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{petToDelete.petName}</span>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800 font-medium">
                  ⚠️ This action cannot be undone. All associated images will also be permanently deleted.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading === petToDelete.$id}
                className="flex justify-center items-center gap-2 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading === petToDelete.$id}
                className="flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {deleteLoading === petToDelete.$id ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Pet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Notification Toast */}
      {copyNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedPetId && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 m-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Pet QR Code</h3>
              <button
                onClick={closeQRModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors rounded-lg p-1 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-5">
              <a
                href={`${EXTERNAL_URL}${selectedPetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                title="Click to open pet page"
              >
                <QRCode
                  value={`${EXTERNAL_URL}${selectedPetId}`}
                  size={256}
                  level="H"
                />
              </a>

              <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Share Link:</p>
                <button
                  onClick={() => copyToClipboard(selectedPetId)}
                  className="w-full text-left text-xs text-gray-900 font-mono break-all bg-white p-3 rounded border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group relative"
                  title="Click to copy"
                >
                  {`${EXTERNAL_URL}${selectedPetId}`}
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded text-indigo-600 font-semibold text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Click to Copy
                  </span>
                </button>
              </div>

              <button
                onClick={closeQRModal}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
