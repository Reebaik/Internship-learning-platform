import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCourses } from "../api/courses";
import { useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import type { Course } from "../api/courses";
import "../styles/Home.css";

export default function Home() {
    const { auth, logout } = useAuth();
    const role = auth.role;
    const token = auth.token;

    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollingId, setEnrollingId] = useState<string | null>(null);
    const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
    const [enrolledLoading, setEnrolledLoading] = useState(role === "student");

    // Fetch enrolled courses for student
    const fetchEnrolledCourses = useCallback(async () => {
        if (role !== "student" || !token) return;
        setEnrolledLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/student/my-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setEnrolledIds(data.map((c: any) => c.id));
        } catch {}
        setEnrolledLoading(false);
    }, [role, token]);

    useEffect(() => {
        fetchCourses()
            .then(setCourses)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchEnrolledCourses();
    }, [fetchEnrolledCourses]);

    const handleEnroll = async (courseId: string) => {
        if (!token) {
            navigate("/login");
            return;
        }
        setEnrollingId(courseId);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/courses/${courseId}/enroll`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message);
            }
            alert("Enrolled successfully!");
            await fetchEnrolledCourses();
        } catch (err: any) {
            alert(err.message || "Enrollment failed");
        } finally {
            setEnrollingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header className="home-header">
                <div className="header-left">
                    <h1>🎓 Learning Platform</h1>
                </div>
                <div className="header-right">
                    {role === "mentor" && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/mentor")}
                        >
                            🧑‍🏫 Mentor Dashboard
                        </button>
                    )}
                    {role === "admin" && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/admin")}
                        >
                            ⚙️ Admin Dashboard
                        </button>
                    )}
                    {role === "student" && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/student")}
                        >
                            📚 My Courses
                        </button>
                    )}
                    {token ? (
                        <button className="btn btn-logout" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-secondary">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content - full width, modern card */}
            <main style={{ flex: 1, width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0 }}>
                <div style={{
                    width: '100vw',
                    minHeight: 'calc(100vh - 100px)',
                    background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)',
                    border: 'none',
                    borderRadius: 0,
                    boxShadow: 'none',
                    padding: '64px 0 64px 0',
                    color: '#f4f4f5',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}>
                    <h2 style={{ color: '#e11d48', fontSize: 38, marginBottom: 48, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>Available Courses</h2>

                    {loading && <p className="loading">Loading courses...</p>}
                    {error && <p className="error">❌ {error}</p>}

                    {!loading && !error && courses.length === 0 && (
                        <p className="empty">No courses available yet.</p>
                    )}

                    <div className="courses-grid" style={{ width: '90vw', maxWidth: 1800, margin: '0 auto', gap: 48 }}>
                        {(role === "student" && enrolledLoading) ? (
                            <p className="loading">Loading enrollment status...</p>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="course-card">
                                    <div className="course-header">
                                        <h3>{course.title}</h3>
                                        <span className="chapter-badge">
                                            {course.total_chapters ?? 0} chapters
                                        </span>
                                    </div>
                                    <p className="course-desc">{course.description}</p>
                                    <p className="course-mentor">
                                        👨‍🏫 {course.mentor_name ?? "TBD"}
                                    </p>

                                    <div className="course-actions">
                                        {role === "student" ? (
                                            enrolledIds.includes(course.id) ? (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => navigate(`/student/course/${course.id}`)}
                                                >
                                                    View Course
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-enroll"
                                                    onClick={() => handleEnroll(course.id)}
                                                    disabled={enrollingId === course.id}
                                                >
                                                    {enrollingId === course.id
                                                        ? "Enrolling..."
                                                        : "Enroll Now"}
                                                </button>
                                            )
                                        ) : token ? (
                                            <p className="enrolled-note">
                                                Login as student to enroll
                                            </p>
                                        ) : (
                                            <Link to="/login" className="btn btn-enroll">
                                                Login to Enroll
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
