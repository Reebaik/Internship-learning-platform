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

export async function createCourse(payload: {
    title: string;
    description: string;
    total_chapters: number;
}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to create course");
    }
}
export async function fetchMyCourses() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/courses/my`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch your courses");
    }

    return res.json();
}

export async function deleteCourse(courseId: string) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to delete course");
    }
}

export async function updateCourse(
    id: string,
    payload: {
        title: string;
        description: string;
        total_chapters: number;
    }
) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to update course");
    }

    return res.json();
}
