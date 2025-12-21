export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
    url: string,
    token: string,
    options: RequestInit = {}
) {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    if (!res.ok) {
        throw new Error("API error");
    }

    return res.json();
}
