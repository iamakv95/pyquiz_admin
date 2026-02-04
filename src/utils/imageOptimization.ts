/**
 * Image optimization utilities for resizing, compressing, and converting images
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Resize and compress an image file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(file: File, quality: number = 0.85): Promise<Blob> {
  return optimizeImage(file, { format: 'webp', quality });
}

/**
 * Create a thumbnail from an image
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
  });
}

/**
 * Get image dimensions without loading the full image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return Promise.resolve({
      valid: false,
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    });
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return Promise.resolve({
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    });
  }

  // Check dimensions if specified
  if (options.minWidth || options.minHeight || options.maxWidth || options.maxHeight) {
    return getImageDimensions(file).then(({ width, height }) => {
      if (options.minWidth && width < options.minWidth) {
        return {
          valid: false,
          error: `Image width must be at least ${options.minWidth}px`,
        };
      }

      if (options.minHeight && height < options.minHeight) {
        return {
          valid: false,
          error: `Image height must be at least ${options.minHeight}px`,
        };
      }

      if (options.maxWidth && width > options.maxWidth) {
        return {
          valid: false,
          error: `Image width must be at most ${options.maxWidth}px`,
        };
      }

      if (options.maxHeight && height > options.maxHeight) {
        return {
          valid: false,
          error: `Image height must be at most ${options.maxHeight}px`,
        };
      }

      return { valid: true };
    });
  }

  return Promise.resolve({ valid: true });
}

/**
 * Generate a data URL from a file
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Download an image from a URL as a file
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);

    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw error;
  }
}

/**
 * Crop an image to a specific aspect ratio
 */
export async function cropImage(
  file: File,
  aspectRatio: number, // width / height
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const imgAspectRatio = img.width / img.height;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (imgAspectRatio > aspectRatio) {
          // Image is wider than target aspect ratio
          sourceWidth = img.height * aspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (imgAspectRatio < aspectRatio) {
          // Image is taller than target aspect ratio
          sourceHeight = img.width / aspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          sourceWidth,
          sourceHeight
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
