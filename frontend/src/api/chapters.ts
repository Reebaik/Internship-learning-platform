const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type Chapter = {
    id: string;
    title: string;
    video_url?: string;
    image_url?: string;
    content?: string;
    order: number;
};

export async function fetchChapters(courseId: string): Promise<Chapter[]> {
    const res = await fetch(`${API_BASE}/chapters/${courseId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) throw new Error("Failed to load chapters");
    return res.json();
}

export async function createChapter(
    courseId: string,
    data: { title: string; video_url?: string; image_url?: string; content?: string; sequence_order: number }
) {
    const res = await fetch(`${API_BASE}/chapters/${courseId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to create chapter");
}

export async function updateChapter(
    chapterId: string,
    data: { title: string; video_url?: string; order: number }
) {
    const res = await fetch(`${API_BASE}/chapters/edit/${chapterId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update chapter");
}

export async function deleteChapter(chapterId: string) {
    const res = await fetch(`${API_BASE}/chapters/${chapterId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!res.ok) throw new Error("Failed to delete chapter");
}