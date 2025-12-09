import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * Generate a unique device fingerprint
 * This fingerprint can be used to track devices for security purposes
 */
export async function generateFingerprint(): Promise<string> {
  try {
    // Initialize the fingerprint agent
    const fp = await FingerprintJS.load();

    // Get the visitor identifier
    const result = await fp.get();

    // Return the unique visitor ID
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Return a fallback value if fingerprinting fails
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
