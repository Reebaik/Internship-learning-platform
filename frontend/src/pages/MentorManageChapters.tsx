import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCourses } from "../api/courses";
import {
    fetchChapters,
    createChapter,
    deleteChapter
} from "../api/chapters";

type Chapter = {
    id: string;
    title: string;
    order: number;
    video_url?: string;
    image_url?: string;
    content?: string;
};

export default function MentorManageChapters() {
    const { courseId } = useParams<{ courseId: string }>();

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [title, setTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [sequenceOrder, setSequenceOrder] = useState(1);
    const [imageUrl, setImageUrl] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function load() {
        if (!courseId) return;
        const data = await fetchChapters(courseId);
        setChapters(data);
        setLoading(false);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!courseId) return;
        setErrorMsg(null);
        // Fetch course details to get total_chapters
        let totalChapters = 0;
        try {
            const allCourses = await fetchCourses();
            const thisCourse = allCourses.find((c) => c.id === courseId);
            totalChapters = thisCourse?.total_chapters ?? 0;
        } catch {
            setErrorMsg("Could not fetch course details.");
            return;
        }
        if (chapters.length >= totalChapters) {
            setErrorMsg(`Cannot add more than ${totalChapters} chapters to this course.`);
            return;
        }
        try {
            await createChapter(courseId, {
                title,
                ...(videoUrl ? { video_url: videoUrl } : {}),
                ...(imageUrl ? { image_url: imageUrl } : {}),
                ...(content ? { content } : {}),
                sequence_order: sequenceOrder
            });
            setTitle("");
            setVideoUrl("");
            setImageUrl("");
            setContent("");
            setSequenceOrder(sequenceOrder + 1);
            load();
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to add chapter.");
        }
    }

    async function remove(id: string) {
        if (!confirm("Delete this chapter?")) return;
        await deleteChapter(id);
        load();
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#f4f4f5', fontSize: 22 }}>Loading chapters…</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 600,
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
                    onClick={() => window.location.assign('/mentor')}
                    style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back to Dashboard
                </button>
                <h2 style={{ color: '#e11d48', marginBottom: 24, textAlign: 'center' }}>📘 Manage Chapters</h2>
                {/* Error Message */}
                {errorMsg && (
                    <div style={{ color: '#e11d48', marginBottom: 16, fontWeight: 600, textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}
                {/* ADD CHAPTER */}
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Chapter Title</label>
                    <input
                        placeholder="Chapter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Video URL (optional)</label>
                    <input
                        placeholder="Video URL (optional)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Content (optional, supports markdown/html)</label>
                    <textarea
                        placeholder="Content (optional, supports markdown/html)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Chapter Order</label>
                    <input
                        type="number"
                        min={1}
                        value={sequenceOrder}
                        onChange={(e) => setSequenceOrder(Number(e.target.value))}
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>➕ Add Chapter</button>
                </form>
                <hr style={{ border: '1px solid #333', margin: '24px 0' }} />
                {/* LIST CHAPTERS */}
                {chapters.length === 0 && <p style={{ color: '#a1a1aa', textAlign: 'center' }}>No chapters yet.</p>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {chapters.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                border: "1px solid #333",
                                padding: 18,
                                borderRadius: 12,
                                background: '#232326',
                                color: '#f4f4f5',
                                boxShadow: '0 2px 12px 0 rgba(225,29,72,0.08)'
                            }}
                        >
                            <strong style={{ fontSize: 17 }}>{c.order}. {c.title}</strong>
                            {c.video_url && (
                                <p style={{ fontSize: 13, color: "#fbbf24", margin: '6px 0 0 0' }}>
                                    🎥 {c.video_url}
                                </p>
                            )}
                            {c.image_url && (
                                <p style={{ fontSize: 13, color: "#fbbf24", margin: '6px 0 0 0' }}>
                                    🖼 <a href={c.image_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24' }}>{c.image_url}</a>
                                </p>
                            )}
                            {c.content && (
                                <div style={{ fontSize: 14, color: "#f4f4f5", marginTop: 6 }}>
                                    <strong>Content:</strong>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
                                </div>
                            )}
                            <button
                                onClick={() => remove(c.id)}
                                style={{ color: "#e11d48", marginTop: 10, background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                            >
                                🗑 Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
