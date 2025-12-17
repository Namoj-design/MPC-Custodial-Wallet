const API_BASE = "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getClientDashboard() {
  const res = await fetch(`${API_BASE}/api/client/dashboard`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}