export function isAuthenticated(): boolean {
  return true; // Assume authenticated, let API return 401 if not.
}

// Clear auth cookie (best effort)
export function clearAuthToken(): void {

  if (typeof window !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=None";
  }
}
