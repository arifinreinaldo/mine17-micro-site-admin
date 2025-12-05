export type PetType = 'cat' | 'dog' | 'bird' | 'other';

export interface Pet {
  $id?: string;
  petName: string;
  breed: string;
  age?: string;
  gender?: string;
  color?: string;
  weight?: string;
  description?: string;
  personality?: string;
  medicalInfo?: string;
  petType: PetType;
  userId: string;
  imageUrls?: string[];
  microchip?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface PetFormData {
  petName: string;
  breed: string;
  age: string;
  gender: string;
  color: string;
  weight: string;
  description: string;
  personality: string;
  medicalInfo: string;
  petType: PetType;
  microchip: string;
}
