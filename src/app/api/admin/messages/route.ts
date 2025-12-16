import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { DATABASE_ID, MESSAGES_COLLECTION_ID, PETS_COLLECTION_ID } from '@/lib/appwrite';
import { MessageWithOwner } from '@/types/message';
import { Pet } from '@/types/pet';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin privileges
    const user = await verifyAdminSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if API key is configured
    if (!process.env.APPWRITE_API_KEY_READ_ONLY) {
      console.error('APPWRITE_API_KEY_READ_ONLY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { databases, users } = createAdminClient();
    
    // 1. Fetch all messages ordered by reportedAt DESC
    const messagesResponse = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [Query.orderDesc('reportedAt'), Query.limit(100)]
    );

    if (messagesResponse.documents.length === 0) {
      return NextResponse.json({ messages: [], total: 0 });
    }

    // 2. Extract unique petIds
    const petIds = [...new Set(messagesResponse.documents.map((m: any) => m.petId))];
    
    // 3. Batch fetch pets
    const petsResponse = await databases.listDocuments(
      DATABASE_ID,
      PETS_COLLECTION_ID,
      [Query.equal('$id', petIds)]
    );
    
    // 4. Extract unique userIds from pets
    const userIds = [...new Set(petsResponse.documents.map((p: any) => p.userId))];
    
    // 5. Batch fetch users
    const usersResponse = await users.list([
      Query.equal('$id', userIds),
      Query.limit(100)
    ]);
    
    // 6. Create lookup maps for O(1) access
    const petMap = new Map(
      petsResponse.documents.map((p: any) => [p.$id, p as Pet])
    );
    const userMap = new Map(
      usersResponse.users.map((u: any) => [u.$id, u])
    );
    
    // 7. Combine data
    const enrichedMessages: MessageWithOwner[] = messagesResponse.documents.map((msg: any) => {
      const pet = petMap.get(msg.petId);
      const owner = pet ? userMap.get(pet.userId) : null;
      
      return {
        $id: msg.$id,
        petId: msg.petId,
        petName: msg.petName,
        finderName: msg.finderName,
        finderPhone: msg.finderPhone,
        message: msg.message,
        status: msg.status,
        reportedAt: msg.reportedAt,
        $createdAt: msg.$createdAt,
        $updatedAt: msg.$updatedAt,
        petDetails: pet ? {
          breed: pet.breed,
          petType: pet.petType,
          imageUrl: pet.imageUrls?.[0]
        } : null,
        petOwner: owner ? {
          userId: owner.$id,
          name: owner.name || 'N/A',
          email: owner.email,
          phone: owner.phone || 'N/A'
        } : null
      };
    });

    return NextResponse.json({
      messages: enrichedMessages,
      total: messagesResponse.total
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin privileges
    const user = await verifyAdminSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json(
        { error: 'messageId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'contacted', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const { databases } = createAdminClient();
    
    const updatedMessage = await databases.updateDocument(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      messageId,
      { status }
    );

    return NextResponse.json({ message: updatedMessage });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}
