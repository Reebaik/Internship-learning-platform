const API_BASE = import.meta.env.VITE_API_BASE_URL;

export type Course = {
    id: string;
    title: string;
    description: string;
    mentor_name?: string;
    total_chapters?: number;
};

export async function fetchCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);

    if (!res.ok) {
        throw new Error("Failed to fetch courses");
    }

    return res.json();
}

// ✅ ADD THIS
export async function createCourse(course: {
    title: string;
    description: string;
}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(course)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create course");
    }

    return res.json();
}