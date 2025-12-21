const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function addChapter(
    courseId: string,
    chapter: {
        title: string;
        video_url?: string;
        order: number;
    }
) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(chapter)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add chapter");
    }

    return res.json();
}
