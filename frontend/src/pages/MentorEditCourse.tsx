import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMyCourses, updateCourse } from "../api/courses";

type Course = {
    id: string;
    title: string;
    description: string;
    total_chapters: number;
};

export default function MentorEditCourse() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [totalChapters, setTotalChapters] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const courses: Course[] = await fetchMyCourses();
                const course = courses.find((c: Course) => c.id === courseId);

                if (!course) {
                    setError("Course not found");
                    return;
                }

                setTitle(course.title);
                setDescription(course.description);
                setTotalChapters(course.total_chapters);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [courseId]);

    async function save(e: React.FormEvent) {
        e.preventDefault();

        await updateCourse(courseId!, {
            title,
            description,
            total_chapters: totalChapters
        });

        navigate("/mentor");
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 520,
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
                <button
                    onClick={() => navigate('/mentor')}
                    style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back to Dashboard
                </button>
                <h2 style={{ color: '#e11d48', marginBottom: 24, textAlign: 'center' }}>✏️ Edit Course</h2>
                <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Course Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15, minHeight: 60 }}
                    />
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Total Chapters</label>
                    <input
                        type="number"
                        min={1}
                        value={totalChapters}
                        onChange={(e) => setTotalChapters(Number(e.target.value))}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>Save</button>
                </form>
            </div>
        </div>
    );
}
