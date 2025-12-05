'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, PETS_COLLECTION_ID } from '@/lib/appwrite';
import { Pet } from '@/types/pet';
import { useAuth } from '@/context/AuthContext';
import { Query } from 'appwrite';

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      setDeleteLoading(petId);
      await databases.deleteDocument(DATABASE_ID, PETS_COLLECTION_ID, petId);
      setPets(pets.filter((pet) => pet.$id !== petId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete pet');
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pets Management</h1>
        <button
          onClick={() => router.push('/dashboard/pets/add')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Pet
        </button>
      </div>

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
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => router.push(`/dashboard/pets/edit/${pet.$id}`)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
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
    </div>
  );
}
