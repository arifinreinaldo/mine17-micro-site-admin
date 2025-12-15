export type MessageStatus = 'pending' | 'contacted' | 'resolved' | 'closed';

export interface Message {
  $id?: string;
  petId: string;
  petName: string;
  finderName: string;
  finderPhone: string;
  message: string;
  status: MessageStatus;
  reportedAt: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface MessageWithOwner extends Message {
  petOwner: {
    userId: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  petDetails: {
    breed: string;
    petType: string;
    imageUrl?: string;
  } | null;
}
