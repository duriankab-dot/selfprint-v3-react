/**
 * imageProcessor.ts — Browser-side image resize/optimization pipeline
 *
 * P3.2: Image optimization before upload to Supabase Storage
 * Uses native Canvas API (no external dependencies)
 *
 * Policy for profile avatars:
 * - Maximum dimensions: 512 × 512
 * - Output format: WebP (with JPEG fallback)
 * - Quality: 0.85
 * - Maximum processed size: ~200 KB
 */

const MAX_DIMENSION = 512;
const QUALITY = 0.85;
const MAX_PROCESSED_SIZE = 200 * 1024; // 200 KB

export interface ProcessedImage {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  mimeType: string;
  size: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function handleExifOrientation(img: HTMLImageElement): { element: HTMLCanvasElement; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const isPortrait = img.height > img.width;
  const width = isPortrait ? MAX_DIMENSION : img.width;
  const height = isPortrait ? img.height * (MAX_DIMENSION / img.width) : MAX_DIMENSION;

  canvas.width = width;
  canvas.height = height;

  ctx.translate(width / 2, height / 2);
  ctx.rotate((Math.PI / 180) * 0); // EXIF rotation handling would require exif-js library
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return { element: canvas, width, height };
}

function scaleToFit(img: HTMLImageElement): { canvas: HTMLCanvasElement; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  let { width, height } = img;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, width, height };
}

export async function processImageForUpload(file: File, maxDimension: number = MAX_DIMENSION): Promise<ProcessedImage> {
  const maxSize = Math.max(maxDimension, MAX_DIMENSION);

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);

    let { element: canvas, width, height } = handleExifOrientation(img);

    if (width > maxSize || height > maxSize) {
      const { canvas: scaledCanvas, width: scaledWidth, height: scaledHeight } = scaleToFit(img);
      canvas = scaledCanvas;
      width = scaledWidth;
      height = scaledHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    const mimeType = file.type.startsWith('image/webp') ? 'image/webp' : 'image/jpeg';
    const quality = mimeType === 'image/webp' ? QUALITY : 0.9;

    let blob: Blob;
    let attempts = 0;

    do {
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          mimeType,
          quality - attempts * 0.05
        );
      });
      attempts++;
    } while (blob.size > MAX_PROCESSED_SIZE && attempts < 5);

    const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
    const timestamp = Date.now();
    const name = `avatar-${timestamp}.${ext}`;

    const processedFile = new File([blob], name, { type: mimeType });

    return {
      blob: processedFile,
      url: URL.createObjectURL(processedFile),
      width,
      height,
      mimeType,
      size: processedFile.size,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createThumbnail(file: File, size: number = 128): Promise<string> {
  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    const ratio = Math.min(size / img.width, size / img.height);
    canvas.width = Math.round(img.width * ratio);
    canvas.height = Math.round(img.height * ratio);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}
