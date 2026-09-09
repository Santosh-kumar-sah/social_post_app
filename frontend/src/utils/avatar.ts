/**
 * Returns a high-resolution initials SVG avatar URL from DiceBear.
 * Used for deterministic, beautiful user avatars when no custom photo is provided.
 */
export const getDiceBearAvatar = (seed: string): string => {
  const cleanSeed = (seed || 'pulse').trim();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    cleanSeed
  )}&backgroundColor=FF5C5C`;
};

/**
 * Returns the uppercase initial character of a username, or fallback '?'
 */
export const getInitial = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return '?';
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
};
