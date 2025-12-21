import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCourses } from "../api/courses";
import { useAuth } from "../auth/AuthContext";
import type { Course } from "../api/courses";

export default function Home() {
    const { auth } = useAuth(); // ✅ FIX
    const role = auth.role;     // ✅ FIX

    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses()
            .then(setCourses)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>🎓 Available Courses</h1>

            {/* Mentor-only button */}
            {role === "mentor" && (
                <button
                    onClick={() => navigate("/mentor")}
                    style={{ marginBottom: 20 }}
                >
                    ➕ Add Course
                </button>
            )}

            {/* Guest links */}
            {!role && (
                <>
                    <Link to="/login">Login</Link> |{" "}
                    <Link to="/register">Register</Link>
                </>
            )}

            <hr />

            {loading && <p>Loading courses...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {courses.map((course) => (
                <div
                    key={course.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 15,
                        marginBottom: 10
                    }}
                >
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p>Mentor: {course.mentor_name ?? "TBD"}</p>
                    <p>Chapters: {course.total_chapters ?? 0}</p>

                    {role === "student" ? (
                        <button>View Course</button>
                    ) : (
                        <p style={{ fontStyle: "italic" }}>
                            Login as student to enroll
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
