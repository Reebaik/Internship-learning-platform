import { useEffect, useState } from "react";
import { fetchAdminAnalytics } from "../api/analytics";
import { fetchCourses } from "../api/courses";
import { fetchCourseAnalytics } from "../api/courseAnalytics";
import { useAuth } from "../auth/AuthContext";
import {
    fetchAllUsers,
    approveUser,
    deleteUser,
    changeUserRole
} from "../api/admin";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    approved: boolean;
}

interface Analytics {
    totalUsers: number;
    students: number;
    mentors: number;
    admins: number;
    pendingMentors: number;
    courseCount: number;
    completions: number;
}

interface CourseAnalytics {
    course: { id: string; title: string; total_chapters: number };
    students: Array<{
        student_id: string;
        student_name: string;
        student_email: string;
        completedChapters: number;
        totalChapters: number;
        percent: number;
    }>;
}

export default function AdminDashboard() {
    const { auth } = useAuth();
    const token = auth.token!;
    const [users, setUsers] = useState<User[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            setUsers(await fetchAllUsers(token));
            setAnalytics(await fetchAdminAnalytics(token));
            setCourses(await fetchCourses());
        } catch (err: any) {
            setError(err.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, []);

    async function handleCourseSelect(courseId: string) {
        setSelectedCourse(courseId);
        setCourseAnalytics(null);
        if (!courseId) return;
        try {
            const data = await fetchCourseAnalytics(courseId, token);
            setCourseAnalytics(data);
        } catch (err: any) {
            setCourseAnalytics(null);
            setActionMsg(err.message || "Failed to load course analytics");
        }
    }

    async function handleApprove(id: string) {
        try {
            await approveUser(id, token);
            setActionMsg("User approved");
            load();
        } catch (err: any) {
            setActionMsg(err.message);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Delete this user?")) return;
        try {
            await deleteUser(id, token);
            setActionMsg("User deleted");
            load();
        } catch (err: any) {
            setActionMsg(err.message);
        }
    }

    async function handleRoleChange(id: string, role: string) {
        try {
            await changeUserRole(id, role, token);
            setActionMsg("Role updated");
            load();
        } catch (err: any) {
            setActionMsg(err.message);
        }
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100vw', maxWidth: 1400, margin: '0 auto', background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)', border: '1px solid #333', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)', padding: 48, color: '#f4f4f5', position: 'relative', overflow: 'hidden' }}>
                <h1 style={{ color: '#e11d48', fontSize: 36, fontWeight: 700, marginBottom: 40 }}>Admin Dashboard</h1>
                {actionMsg && <div style={{ color: actionMsg.includes('fail') ? '#e11d48' : '#22c55e', marginBottom: 18, fontWeight: 600 }}>{actionMsg}</div>}
                {loading ? (
                    <div style={{ color: '#f4f4f5', textAlign: 'center' }}>Loading users...</div>
                ) : error ? (
                    <div style={{ color: '#e11d48', textAlign: 'center', marginBottom: 16 }}>{error}</div>
                ) : (
                    <>
                        {analytics && (
                            <div style={{ marginBottom: 32, background: 'rgba(24,24,27,0.95)', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(225,29,72,0.10)' }}>
                                <h2 style={{ color: '#e11d48', fontSize: 26, marginBottom: 18 }}>Platform Analytics</h2>
                                <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', fontSize: 18 }}>
                                    <div><strong>Total Users:</strong> {analytics.totalUsers}</div>
                                    <div><strong>Students:</strong> {analytics.students}</div>
                                    <div><strong>Mentors:</strong> {analytics.mentors}</div>
                                    <div><strong>Admins:</strong> {analytics.admins}</div>
                                    <div><strong>Pending Mentors:</strong> {analytics.pendingMentors}</div>
                                    <div><strong>Courses:</strong> {analytics.courseCount}</div>
                                    <div><strong>Completions:</strong> {analytics.completions}</div>
                                </div>
                            </div>
                        )}

                        {/* Course Analytics Section */}
                        <div style={{ marginBottom: 40, background: 'rgba(24,24,27,0.95)', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(225,29,72,0.10)' }}>
                            <h2 style={{ color: '#e11d48', fontSize: 26, marginBottom: 18 }}>Course Analytics</h2>
                            <label style={{ fontSize: 17, color: '#f4f4f5', fontWeight: 600 }}>
                                Select Course:
                                <select
                                    value={selectedCourse}
                                    onChange={e => handleCourseSelect(e.target.value)}
                                    style={{ marginLeft: 12, padding: 8, borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 16 }}
                                >
                                    <option value="">-- Select a course --</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </label>
                            {courseAnalytics && (
                                <div style={{ marginTop: 24 }}>
                                    <h3 style={{ color: '#fbbf24', fontSize: 20 }}>{courseAnalytics.course.title} (Total Chapters: {courseAnalytics.course.total_chapters})</h3>
                                    {courseAnalytics.students.length === 0 ? (
                                        <div style={{ color: '#a1a1aa', marginTop: 12 }}>No students enrolled in this course.</div>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, background: 'transparent' }}>
                                            <thead>
                                                <tr style={{ background: '#232326', color: '#e11d48' }}>
                                                    <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Name</th>
                                                    <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Email</th>
                                                    <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Chapters Completed</th>
                                                    <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Progress (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courseAnalytics.students.map(s => (
                                                    <tr key={s.student_id} style={{ background: '#18181b', color: '#f4f4f5' }}>
                                                        <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{s.student_name}</td>
                                                        <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{s.student_email}</td>
                                                        <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{s.completedChapters} / {s.totalChapters}</td>
                                                        <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{s.percent}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(24,24,27,0.95)', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px 0 rgba(225,29,72,0.10)' }}>
                            <h2 style={{ color: '#e11d48', fontSize: 26, marginBottom: 18 }}>All Users</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                                <thead>
                                    <tr style={{ background: '#232326', color: '#e11d48' }}>
                                        <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Email</th>
                                        <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Role</th>
                                        <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Approved</th>
                                        <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id} style={{ background: u.role === 'mentor' && !u.approved ? 'rgba(251,191,36,0.10)' : '#18181b', color: '#f4f4f5' }}>
                                            <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{u.name}</td>
                                            <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{u.email}</td>
                                            <td style={{ padding: 12, borderBottom: '1px solid #333' }}>
                                                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} style={{ background: '#232326', color: '#f4f4f5', border: '1px solid #333', borderRadius: 6, padding: 6, fontSize: 15 }}>
                                                    <option value="student">student</option>
                                                    <option value="mentor">mentor</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: 12, borderBottom: '1px solid #333' }}>{u.approved ? '✅' : '❌'}</td>
                                            <td style={{ padding: 12, borderBottom: '1px solid #333' }}>
                                                {!u.approved && u.role === 'mentor' && (
                                                    <button onClick={() => handleApprove(u.id)} style={{ marginRight: 8, background: 'none', border: 'none', color: '#fbbf24', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                                                )}
                                                <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
