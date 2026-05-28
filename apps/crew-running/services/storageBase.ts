// Shared guard for localStorage availability. Some browsers (Safari private,
// embedded webviews) block window.localStorage access entirely.
export const canUseStorage = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
};
