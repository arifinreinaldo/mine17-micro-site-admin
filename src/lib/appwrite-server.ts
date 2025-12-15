import { Client, Users, Databases } from 'node-appwrite';

// Server-side Appwrite client with API key authentication
// This should only be used in API routes, never in client components
export function createAdminClient() {
  const client = new Client();

  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY_READ_ONLY || ''); // Read-only API Key for server-side operations

  return {
    get users() {
      return new Users(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}
