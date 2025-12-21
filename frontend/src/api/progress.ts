const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getMyProgress(token: string) {
    const res = await fetch(`${API_BASE}/progress/my`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch progress");
    }

    return res.json();
}

export async function completeChapter(
    token: string,
    chapterId: number
) {
    const res = await fetch(
        `${API_BASE}/progress/${chapterId}/complete`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
    }

    return res.json();
}
