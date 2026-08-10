/**
 * Stored mineral images are the full `secure_url` returned by Cloudinary's
 * upload API. `<NuxtImg provider="cloudinary">` expects a path relative to
 * the configured baseURL, so strip the `/image/upload/` prefix before
 * passing the value as `src`.
 */
export function cloudinaryPath(url: string) {
  return url.split('/image/upload/')[1] ?? url
}
