import { API_BASE } from "./client";

export async function fetchCourseAnalytics(courseId: string, token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/course/${courseId}/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch course analytics");
  return res.json();
}
