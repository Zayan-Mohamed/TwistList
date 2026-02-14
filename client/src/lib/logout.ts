import { clearAuthToken } from "./auth";
import { apiClient } from "./api";

export async function logout() {
  try {
    // Call backend logout endpoint to clear httpOnly cookie
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear client-side cookie as fallback
    clearAuthToken();
    
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
}
