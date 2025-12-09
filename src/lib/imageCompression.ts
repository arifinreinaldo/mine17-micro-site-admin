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
 * Compresses an image file to reduce storage usage
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(file: File): Promise<File> {
  try {
    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image. Please try again.');
  }
}

/**
 * Compresses multiple image files
 * @param files - Array of image files to compress
 * @returns Promise<File[]> - Array of compressed image files
 */
export async function compressImages(files: File[]): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (const file of files) {
    try {
      const compressed = await compressImage(file);
      compressedFiles.push(compressed);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // If compression fails, use original file
      compressedFiles.push(file);
    }
  }

  return compressedFiles;
}
