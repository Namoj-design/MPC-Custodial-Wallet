import { getAuth } from "firebase/auth";

export async function fetchWithAuth(url: string, options: any = {}) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  // Dynamically retrieves a fresh token or the cached still-valid one.
  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}
