const PREFIX = import.meta.env.VITE_STORAGE_PREFIX;

interface StoredAuth {
  token: string;
  refreshToken?: string;  // optional, add required if always present
}

export function getStoredAuth(): StoredAuth | null {
  const auth = localStorage.getItem(`${PREFIX}auth`);
  if (!auth) return null;

  try {
    const parsed = JSON.parse(auth);
    // Basic validation
    if (typeof parsed.token === "string") {
      return parsed;
    }
  } catch {
    // JSON parse error or invalid shape
  }
  return null;
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(`${PREFIX}auth`, JSON.stringify(auth));
}

export function removeStoredAuth(): void {
  localStorage.removeItem(`${PREFIX}auth`);
}
