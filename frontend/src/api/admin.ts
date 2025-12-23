import { API_BASE } from "./client";

export async function fetchAllUsers(token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function approveUser(id: string, token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/users/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to approve user");
  return res.json();
}

export async function deleteUser(id: string, token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

export async function changeUserRole(id: string, role: string, token: string) {
  const res = await fetch(`${API_BASE}/auth/admin/users/${id}/role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error("Failed to change user role");
  return res.json();
}
