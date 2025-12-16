import { Client, Users, Databases } from 'node-appwrite';

// Server-side Appwrite client with API key authentication
// This should only be used in API routes, never in client components
export function getAdminApiKey() {
  return process.env.APPWRITE_API_KEY_READ_ONLY || process.env.APPWRITE_API_KEY || '';
}

export function createAdminClient() {
  const client = new Client();
  const apiKey = getAdminApiKey();

  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY_READ_ONLY (or APPWRITE_API_KEY) is required and must include users.read and documents.read scopes');
  }

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(apiKey); // API Key for server-side operations (needs users.read, documents.read)

  return {
    get users() {
      return new Users(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}
