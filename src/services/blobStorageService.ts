import { MediaItem, MediaType } from '../types';

/**
 * Uploads an audio, video, or image blob/file to Vercel Blob storage (or returns local blob URL)
 */
export async function uploadMediaToBlob(
  blob: Blob,
  filename: string,
  type: MediaType,
  duration?: number
): Promise<MediaItem> {
  const fileId = 'media-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const cleanName = filename || `${type}-${Date.now()}`;

  try {
    // If backend proxy endpoint is available or Vercel Blob client token is provided
    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      headers: {
        'Content-Type': blob.type || 'application/octet-stream',
        'x-filename': encodeURIComponent(cleanName),
        'x-media-type': type,
      },
      body: blob,
    }).catch(() => null);

    if (response && response.ok) {
      const data = await response.json();
      return {
        id: fileId,
        name: cleanName,
        type,
        url: data.url,
        blobData: blob,
        size: blob.size,
        duration,
        createdAt: Date.now(),
      };
    }
  } catch (err) {
    console.warn('Vercel Blob upload endpoint not active, storing locally in IndexedDB.', err);
  }

  // Graceful offline/local fallback
  const localUrl = URL.createObjectURL(blob);
  return {
    id: fileId,
    name: cleanName,
    type,
    url: localUrl,
    blobData: blob,
    size: blob.size,
    duration,
    createdAt: Date.now(),
  };
}

/**
 * Helper to delete a blob from storage
 */
export async function deleteBlobFromStorage(url: string): Promise<boolean> {
  try {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      return true;
    }

    await fetch('/api/blob/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).catch(() => null);

    return true;
  } catch (err) {
    console.warn('Could not delete from Vercel blob:', err);
    return false;
  }
}
