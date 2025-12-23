import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/StudentDashboard.css";

type Course = {
    enrollmentId: string;
    id: string;
    title: string;
    description: string;
    total_chapters: number;
    mentor_name?: string;
};

export default function StudentDashboard() {
    const { auth, logout } = useAuth();
    const token = auth.token!;
    const navigate = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    useEffect(() => {
        async function loadCourses() {
            setLoading(true);
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/courses/student/my-courses`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch courses");
                setCourses(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadCourses();
    }, [token]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#f4f4f5', fontSize: 22 }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 900,
                width: '100%',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)',
                border: '1px solid #333',
                borderRadius: 24,
                boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)',
                padding: 36,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ color: '#e11d48', margin: 0 }}>🎓 Student Dashboard</h1>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <h2 style={{ color: '#f4f4f5', marginBottom: 16 }}>My Courses</h2>
                    {courses.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-text">
                                You haven't enrolled in any courses yet.
                            </p>
                            <Link to="/" className="btn btn-primary">
                                Explore Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="courses-list">
                            {courses.map((course) => (
                                <div key={course.enrollmentId} className="course-item">
                                    <div className="course-info">
                                        <h3>{course.title}</h3>
                                        <p className="course-desc">{course.description}</p>
                                        <p className="course-mentor">
                                            👨‍🏫 {course.mentor_name ?? "TBD"}
                                        </p>
                                        <span className="chapter-info">
                                            📖 {course.total_chapters} chapters
                                        </span>
                                    </div>
                                    <div className="course-actions">
                                        <Link
                                            to={`/student/course/${course.id}`}
                                            className="btn btn-primary"
                                        >
                                            View Progress
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
