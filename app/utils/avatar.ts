const DICEBEAR_STYLE = 'avataaars'

/**
 * Deterministic avatar for a given seed (use the Firebase Auth uid), via
 * DiceBear's hosted SVG API — no dependency, no storage needed.
 */
export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`
}
