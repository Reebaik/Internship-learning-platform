import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getMyProgress, completeChapter } from "../api/progress"


export default function StudentDashboard() {
    const { auth, logout } = useAuth();
    const token = auth.token!;

    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadProgress() {
        setLoading(true);
        try {
            const data = await getMyProgress(token);
            setCompleted(data.completedChapters);
            setTotal(data.totalChapters);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProgress();
    }, []);

    async function handleCompleteNext() {
        try {
            await completeChapter(token, completed + 1);
            await loadProgress();
        } catch (err: any) {
            alert(err.message);
        }
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    const percentage = Math.floor((completed / total) * 100);

    return (
        <div style={{ padding: 20 }}>
            <h2>Student Dashboard</h2>

            <p>
                Progress: {completed} / {total} chapters
            </p>

            <div
                style={{
                    width: 300,
                    height: 20,
                    background: "#eee",
                    marginBottom: 10
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "green"
                    }}
                />
            </div>

            <p>{percentage}% completed</p>

            {completed < total && (
                <button onClick={handleCompleteNext}>
                    Complete Chapter {completed + 1}
                </button>
            )}

            {percentage === 100 && (
                <p style={{ color: "green" }}>
                    🎉 Course completed! Certificate available.
                </p>
            )}

            <br /><br />

            <button onClick={logout}>Logout</button>
        </div>
    );
}
