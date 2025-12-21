import { API_BASE } from "./client";

export async function loginApi(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Invalid credentials");
    }

    return res.json();
}

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "mentor" | "admin";
}) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
    }

    return res.json();
}