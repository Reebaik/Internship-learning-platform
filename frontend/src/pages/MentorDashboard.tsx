import { useEffect, useState } from "react";
import { fetchCourses } from "../api/courses";
import { addChapter } from "../api/chapters";
import type { Course } from "../api/courses";

export default function MentorDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [chapterTitle, setChapterTitle] = useState("");

    useEffect(() => {
        fetchCourses().then(setCourses);
    }, []);

    async function submitChapter(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedCourse) return;

        const order = (selectedCourse.total_chapters ?? 0) + 1;

        await addChapter(selectedCourse.id, {
            title: chapterTitle,
            order
        });

        alert("Chapter added");
        setChapterTitle("");
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>📚 Your Courses</h2>

            {courses.map((course) => (
                <div key={course.id} style={{ marginBottom: 10 }}>
                    <strong>{course.title}</strong>{" "}
                    <button onClick={() => setSelectedCourse(course)}>
                        Manage Chapters
                    </button>
                </div>
            ))}

            {selectedCourse && (
                <>
                    <h3>Add chapter to: {selectedCourse.title}</h3>

                    <form onSubmit={submitChapter}>
                        <input
                            placeholder="Chapter title"
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                            required
                        />
                        <button>Add Chapter</button>
                    </form>
                </>
            )}
        </div>
    );
}
