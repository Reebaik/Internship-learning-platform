import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

interface StudentProgress {
    studentId: string;
    courseId: string;
    completedChapters: number;
    totalChapters: number;
    percentage: number;
}

export default function MentorStudentProgress() {
    const { auth } = useAuth();
    const token = auth.token!;
    const [progress, setProgress] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProgress() {
            setLoading(true);
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/mentor/progress`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch progress");
                setProgress(await res.json());
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchProgress();
    }, [token]);

    return (
        <div style={{ maxWidth: 800, margin: "40px auto" }}>
            <h1>📊 Student Progress Analytics</h1>
            <Link to="/mentor" className="btn btn-secondary">Back to Dashboard</Link>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && (
                progress.length === 0 ? (
                    <p>No student progress analytics available yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Course ID</th>
                                <th>Completed Chapters</th>
                                <th>Total Chapters</th>
                                <th>Progress (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progress.map((row) => (
                                <tr key={row.studentId + row.courseId}>
                                    <td>{row.studentId}</td>
                                    <td>{row.courseId}</td>
                                    <td>{row.completedChapters}</td>
                                    <td>{row.totalChapters}</td>
                                    <td>{row.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
        </div>
    );
}
