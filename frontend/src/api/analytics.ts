import { API_BASE } from "./client";

export async function fetchAdminAnalytics(token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
