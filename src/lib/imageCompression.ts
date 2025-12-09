import imageCompression from 'browser-image-compression';

/**
 * Compression options for pet images
 * Max file size: 500KB
 * Max dimensions: 1920x1920px
 * Quality: 0.8 (80%)
 */
const compressionOptions = {
  maxSizeMB: 0.5,              // 500KB
  maxWidthOrHeight: 1920,       // Max dimension
  useWebWorker: true,           // Use web worker for better performance
  fileType: 'image/jpeg',       // Convert to JPEG for smaller size
};

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns boolean - True if valid image
 */
function isValidImageFile(file: File): boolean {
  if (!file || !(file instanceof File)) {
    console.error('Invalid file object:', file);
    return false;
  }

  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    console.error('File is not an image:', file.type);
    return false;
  }

  // Check file size (max 10MB before compression)
  const maxSizeBeforeCompression = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBeforeCompression) {
    console.error('File too large (max 10MB):', file.size);
    return false;
  }

  return true;
}

/**
 * Compresses an image file to reduce storage usage
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // Validate file
    if (!isValidImageFile(file)) {
      throw new Error(`Invalid image file: ${file?.name || 'unknown'}`);
    }

    const originalSizeMB = file.size / 1024 / 1024;
    console.log(`Original file: ${file.name}, size: ${originalSizeMB.toFixed(2)} MB`);

    // If file is already small enough, return it as-is
    if (file.size <= 500 * 1024) { // 500KB
      console.log('File already under 500KB, skipping compression');
      return file;
    }

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    console.log(`Compressed file size: ${compressedSizeMB.toFixed(2)} MB`);
    console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error(`Failed to compress image "${file?.name || 'unknown'}". Please try a different image.`);
  }
}

/**
 * Compresses multiple image files
 * @param files - Array of image files to compress
 * @returns Promise<File[]> - Array of compressed image files
 */
export async function compressImages(files: File[]): Promise<File[]> {
  // Filter out invalid files first
  const validFiles = files.filter((file) => {
    if (!file || !(file instanceof File)) {
      console.warn('Skipping invalid file:', file);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) {
    throw new Error('No valid image files selected');
  }

  const compressedFiles: File[] = [];

  for (const file of validFiles) {
    try {
      const compressed = await compressImage(file);
      compressedFiles.push(compressed);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // If compression fails, try to use original file if it's under 500KB
      if (file.size <= 500 * 1024) {
        console.log(`Using original file ${file.name} (under 500KB)`);
        compressedFiles.push(file);
      } else {
        // Re-throw error for files that are too large and couldn't be compressed
        throw error;
      }
    }
  }

  return compressedFiles;
}
