// Check if user is authenticated (client-side heuristic)
// Note: Since we use httpOnly cookies, we cannot reliably check this on the client without an API call.
// This function is now deprecated and should not be used for critical logic.
export function isAuthenticated(): boolean {
  return true; // Assume authenticated, let API return 401 if not.
}

// Clear auth cookie (best effort)
export function clearAuthToken(): void {
  // We can't clear httpOnly cookies via JS, but we can try to expire a visible one if it existed.
  if (typeof window !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  }
}
