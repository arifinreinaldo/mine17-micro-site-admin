import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAdminApiKey } from '@/lib/appwrite-server';
import { Client, Databases, Query } from 'node-appwrite';
import { DATABASE_ID, MESSAGES_COLLECTION_ID, PETS_COLLECTION_ID } from '@/lib/appwrite';
import { MessageWithOwner } from '@/types/message';
import { Pet } from '@/types/pet';
import { verifyAdminSession } from '@/lib/admin-auth';

const createSessionDatabases = (sessionValue?: string | null, jwtValue?: string | null) => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

  if (sessionValue) {
    client.setSession(sessionValue);
  } else if (jwtValue) {
    client.setJWT(jwtValue);
  } else {
    return null;
  }

  return new Databases(client);
};

const isScopeError = (error: any) =>
  error?.message?.toLowerCase?.().includes('missing scopes');

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin privileges
    const auth = await verifyAdminSession(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const { sessionValue, jwtValue } = auth;

    // Check if API key is configured
    const apiKey = getAdminApiKey();
    if (!apiKey) {
      console.error('APPWRITE_API_KEY_READ_ONLY or APPWRITE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: missing APPWRITE_API_KEY_READ_ONLY with users.read/documents.read scopes' },
        { status: 500 }
      );
    }

    const { databases, users } = createAdminClient();
    const sessionDatabases = createSessionDatabases(sessionValue, jwtValue);
    
    // 1. Fetch all messages ordered by reportedAt DESC
    let messagesResponse;
    try {
      messagesResponse = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.orderDesc('reportedAt'), Query.limit(100)]
      );
    } catch (err: any) {
      if (isScopeError(err) && sessionDatabases) {
        messagesResponse = await sessionDatabases.listDocuments(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          [Query.orderDesc('reportedAt'), Query.limit(100)]
        );
      } else {
        throw err;
      }
    }

    if (messagesResponse.documents.length === 0) {
      return NextResponse.json({ messages: [], total: 0 });
    }

    // 2. Extract unique petIds
    const petIds = [...new Set(messagesResponse.documents.map((m: any) => m.petId))];
    
    // 3. Batch fetch pets
    let petsResponse;
    try {
      petsResponse = await databases.listDocuments(
        DATABASE_ID,
        PETS_COLLECTION_ID,
        [Query.equal('$id', petIds)]
      );
    } catch (err: any) {
      if (isScopeError(err) && sessionDatabases) {
        petsResponse = await sessionDatabases.listDocuments(
          DATABASE_ID,
          PETS_COLLECTION_ID,
          [Query.equal('$id', petIds)]
        );
      } else {
        throw err;
      }
    }
    
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

    // 8. Filter out closed messages not updated in 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const filteredMessages = enrichedMessages.filter((msg) => {
      if (msg.status !== 'closed') return true;
      const updatedAt = new Date(msg.$updatedAt || msg.reportedAt).getTime();
      return now - updatedAt < THIRTY_DAYS_MS;
    });

    return NextResponse.json({
      messages: filteredMessages,
      total: filteredMessages.length
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    if (error?.message?.toLowerCase?.().includes('missing scopes')) {
      return NextResponse.json(
        { error: 'Server API key is missing required scope (documents.read/users.read). Update APPWRITE_API_KEY_READ_ONLY or APPWRITE_API_KEY.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin privileges
    const auth = await verifyAdminSession(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const { sessionValue, jwtValue } = auth;

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

    const apiKey = getAdminApiKey();
    if (!apiKey) {
      console.error('APPWRITE_API_KEY_READ_ONLY or APPWRITE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: missing APPWRITE_API_KEY_READ_ONLY with documents.read scope' },
        { status: 500 }
      );
    }

    const { databases } = createAdminClient();
    const sessionDatabases = createSessionDatabases(sessionValue, jwtValue);
    
    let updatedMessage;
    try {
      updatedMessage = await databases.updateDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        messageId,
        { status }
      );
    } catch (err: any) {
      if (isScopeError(err) && sessionDatabases) {
        updatedMessage = await sessionDatabases.updateDocument(
          DATABASE_ID,
          MESSAGES_COLLECTION_ID,
          messageId,
          { status }
        );
      } else {
        throw err;
      }
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error: any) {
    console.error('Error updating message:', error);
    if (error?.message?.toLowerCase?.().includes('missing scopes')) {
      return NextResponse.json(
        { error: 'Server API key is missing required scope (documents.read/users.read). Update APPWRITE_API_KEY_READ_ONLY or APPWRITE_API_KEY.' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}
