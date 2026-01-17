/**
 * File Download Utility
 * Feature: 017-document-generation
 *
 * Utilities for triggering browser file downloads from Blob data.
 */

/**
 * Triggers browser download of a file blob
 *
 * @param blob - File content as Blob
 * @param filename - Download filename (will be sanitized)
 *
 * Creates temporary URL, triggers download via anchor click, cleans up
 */
export function downloadFile(blob: Blob, filename: string): void {
  const sanitized = sanitizeFilename(filename);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitized;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes a string for use as filename
 *
 * @param name - Raw filename string
 * @returns Sanitized filename safe for all platforms
 *
 * Removes: < > : " / \ | ? *
 * Replaces spaces with hyphens
 * Collapses multiple hyphens
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid chars
    .replace(/\s+/g, '-') // Replace spaces
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Processes uploaded logo file for document embedding
 *
 * @param file - Uploaded File object
 * @returns Promise resolving to base64 data URL
 * @throws Error if file is invalid type or too large
 *
 * Validates: PNG/JPG only, max 2MB
 */
export async function processLogoFile(file: File): Promise<string> {
  // Validate file type
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    throw new Error('Invalid file type. Please upload PNG or JPG.');
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 2MB.');
  }

  // Convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
