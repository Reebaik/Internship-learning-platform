const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchMentorAnalytics(token: string) {
  const res = await fetch(`${API_BASE}/mentor/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch analytics");
  }
  return res.json();
}
