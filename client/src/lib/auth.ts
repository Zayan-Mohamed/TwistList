// Check if user has a valid auth cookie
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  // Check if auth_token cookie exists
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith("auth_token="));
}

// Clear auth cookie
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  }
}
