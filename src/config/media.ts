/**
 * Media resolver.
 *
 * Local dev / static hosting  → files live in /public/assets/**
 * CDN / object storage (R2…)  → set VITE_MEDIA_BASE_URL to the bucket root,
 *                               which must mirror the same folder layout
 *                               (images/, audio/, videos/, videos/wishes/).
 *
 * Components never hardcode a path — they call mediaUrl('videos/special.mp4').
 */
const CDN_BASE = (import.meta.env.VITE_MEDIA_BASE_URL ?? '').replace(/\/+$/, '')

export function mediaUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '')
  if (CDN_BASE) return `${CDN_BASE}/${clean}`
  // BASE_URL respects vite's `base`, so this survives subpath deploys.
  return `${import.meta.env.BASE_URL}assets/${clean}`
}

export const usingCdn = CDN_BASE.length > 0
