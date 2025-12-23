import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/CourseDetail.css";

interface CourseDetail {
    id: string;
    title: string;
    description: string;
    total_chapters: number;
    mentor_name: string;
}

interface Chapter {
    id: string; // uuid
    title: string;
    video_url?: string;
    image_url?: string;
    content?: string;
    sequence_order: number;
}

interface ProgressData {
    completedChapters: number[];
    totalChapters: number;
    percentage: number;
}

export default function CourseDetail() {
    // Add state for active chapter modal
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const { courseId } = useParams<{ courseId: string }>();
    const { auth } = useAuth();
    const token = auth.token!;

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingChapter, setCompletingChapter] = useState(false);

    async function loadData() {
        setLoading(true);
        try {
            // Fetch course details (public endpoint)
            const courseRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/courses/${courseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!courseRes.ok) {
                throw new Error("Failed to fetch course");
            }
            const courseData = await courseRes.json();
            setCourse(courseData);

            // Fetch chapters (sequential, only if enrolled)
            const chaptersRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/courses/${courseId}/chapters`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!chaptersRes.ok) {
                throw new Error("Failed to fetch chapters");
            }
            const chaptersData = await chaptersRes.json();
            setChapters(chaptersData);

            // Fetch progress
            const progressRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/progress/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (!progressRes.ok) {
                throw new Error("Failed to fetch progress");
            }
            const progressData = await progressRes.json();
            setProgress(progressData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, [courseId]);

    const handleCompleteChapter = async (chapterId: string) => {
        if (completingChapter) return;

        setCompletingChapter(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/progress/${chapterId}/complete`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to complete chapter");
            }

            await loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCompletingChapter(false);
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/certificates/${courseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Certificate not available yet");
            }

            // In a real app, this would download the certificate
            const data = await res.json();
            alert("Certificate generated! " + JSON.stringify(data));
        } catch (err: any) {
            alert(err.message);
        }
    };


    if (loading) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)', border: '1px solid #333', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)', padding: 48, color: '#f4f4f5', minWidth: 400, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p className="loading">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)', border: '1px solid #333', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)', padding: 48, color: '#f4f4f5', minWidth: 400, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p className="error">❌ {error}</p>
                    <Link to="/student" className="btn btn-primary" style={{ marginTop: 24 }}>
                        Back to My Courses
                    </Link>
                </div>
            </div>
        );
    }

    if (!course || !progress) {
        return (
            <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)', border: '1px solid #333', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)', padding: 48, color: '#f4f4f5', minWidth: 400, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p className="error">Course data not found</p>
                </div>
            </div>
        );
    }

    // Use mentor-set total_chapters for intended progress, but also show actual chapters
    const intendedTotalChapters = course.total_chapters;
    const actualTotalChapters = chapters.length;
    // Defensive: ensure completedChapters is always an array of string IDs
    const completedChaptersArr = Array.isArray(progress?.completedChapters)
        ? progress.completedChapters.map(String)
        : [];
    const completedChapters = new Set<string>(completedChaptersArr);
    const completedCount = completedChaptersArr.length;
    // Progress percent by intended total
    const progressPercent = intendedTotalChapters > 0 ? Math.round((completedCount / intendedTotalChapters) * 100) : 0;
    // Progress percent by actual chapters
    const progressPercentActual = actualTotalChapters > 0 ? Math.round((completedCount / actualTotalChapters) * 100) : 0;
    const activeChapter = chapters.find((c) => c.id === activeChapterId);

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100vw', maxWidth: 1400, margin: '0 auto', background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)', border: '1px solid #333', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)', padding: 48, color: '#f4f4f5', position: 'relative', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
                        <h1 style={{ color: '#e11d48', fontSize: 32, fontWeight: 700, margin: 0 }}>{course.title}</h1>
                        <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 18 }}>👨‍🏫 {course.mentor_name}</span>
                    </div>
                    <p style={{ color: '#a1a1aa', fontSize: 18, margin: '18px 0 0 0' }}>{course.description}</p>
                </header>
                {/* Progress Info */}
                <section style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 20, color: '#e11d48', fontWeight: 600 }}>Progress: {progressPercent}%</div>
                        <div style={{ fontSize: 18, color: '#f4f4f5' }}>Completed: {completedChaptersArr.length}/{intendedTotalChapters}</div>
                        {actualTotalChapters !== intendedTotalChapters && (
                            <div style={{ color: '#888', fontSize: 16 }}>
                                (of {actualTotalChapters} added: {progressPercentActual}%)
                            </div>
                        )}
                    </div>
                    <div style={{ background: '#333', borderRadius: 10, height: 24, marginTop: 18, width: '100%', maxWidth: 600 }}>
                        <div style={{ background: 'linear-gradient(90deg, #e11d48 0%, #fbbf24 100%)', height: '100%', borderRadius: 10, width: `${progressPercent}%`, transition: 'width 0.5s' }} />
                    </div>
                    {intendedTotalChapters > 0 && completedChaptersArr.length === intendedTotalChapters ? (
                        <div style={{ background: 'rgba(34,197,94,0.12)', borderLeft: '4px solid #22c55e', color: '#22c55e', padding: 15, borderRadius: 8, fontWeight: 600, marginTop: 24 }}>
                            🎉 Congratulations! You have completed this course!
                        </div>
                    ) : null}
                </section>
                {/* Chapters Section */}
                <section style={{ marginBottom: 40 }}>
                    <div style={{ background: 'rgba(24,24,27,0.95)', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px 0 rgba(225,29,72,0.10)' }}>
                        <h2 style={{ color: '#e11d48', fontSize: 26, marginBottom: 24 }}>Course Chapters</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {chapters.map((chapter, idx) => {
                                const isCompleted = completedChapters.has(chapter.id);
                                const isNext = completedChaptersArr.length === idx && !isCompleted;
                                const isLocked = idx > completedChaptersArr.length;
                                return (
                                    <div
                                        key={chapter.id}
                                        style={{
                                            border: isCompleted ? '2px solid #22c55e' : isLocked ? '2px solid #333' : '2px solid #e11d48',
                                            borderRadius: 10,
                                            padding: 20,
                                            background: isCompleted ? 'rgba(34,197,94,0.08)' : isLocked ? 'rgba(51,51,51,0.10)' : 'rgba(225,29,72,0.04)',
                                            color: '#f4f4f5',
                                            marginBottom: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            transition: 'border 0.2s, background 0.2s',
                                        }}
                                        onClick={() => {
                                            if (!isLocked) setActiveChapterId(chapter.id);
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: isCompleted ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : isLocked ? '#333' : 'linear-gradient(135deg, #e11d48 0%, #fbbf24 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
                                                {isCompleted ? '✓' : isLocked ? '🔒' : idx + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 18, fontWeight: 600, color: '#f4f4f5' }}>{chapter.title || `Chapter ${idx + 1}`}</div>
                                                {isCompleted && <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 14, marginLeft: 8 }}>Completed</span>}
                                                {isLocked && <span style={{ color: '#a1a1aa', fontWeight: 600, fontSize: 14, marginLeft: 8 }}>Locked</span>}
                                            </div>
                                        </div>
                                        {isNext && (
                                            <button
                                                className="btn btn-enroll"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleCompleteChapter(chapter.id);
                                                }}
                                                disabled={completingChapter}
                                            >
                                                {completingChapter ? 'Completing...' : 'Complete Chapter'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Show chapter content if selected and unlocked */}
                            {activeChapter && (
                                <div style={{ background: '#232326', borderRadius: 12, padding: 28, marginTop: 18, color: '#f4f4f5', boxShadow: '0 2px 12px 0 rgba(225,29,72,0.08)' }}>
                                    <h3 style={{ color: '#e11d48', fontSize: 22 }}>{activeChapter.title}</h3>
                                    {activeChapter.video_url && (
                                        <div style={{ margin: '12px 0' }}>
                                            <strong>Video URL:</strong> <a href={activeChapter.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24' }}>{activeChapter.video_url}</a>
                                        </div>
                                    )}
                                    {activeChapter.image_url && (
                                        <div style={{ margin: '12px 0' }}>
                                            <img src={activeChapter.image_url} alt="Chapter visual" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
                                        </div>
                                    )}
                                    {activeChapter.content && (
                                        <div style={{ margin: '12px 0', fontSize: 15, color: '#f4f4f5' }}>
                                            <strong>Content:</strong>
                                            <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: activeChapter.content }} />
                                        </div>
                                    )}
                                    <button className="btn btn-secondary" onClick={() => setActiveChapterId(null)} style={{ marginTop: 18 }}>
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {/* Certificate Section */}
                {completedChaptersArr.length === intendedTotalChapters && intendedTotalChapters > 0 && (
                    <section style={{ marginBottom: 0 }}>
                        <div style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.10), rgba(255, 165, 0, 0.10))', border: '2px solid rgba(255, 215, 0, 0.3)', borderRadius: 15, padding: 40, textAlign: 'center', boxShadow: '0 10px 40px rgba(255, 215, 0, 0.15)' }}>
                            <h2 style={{ color: '#fbbf24', margin: '0 0 15px 0', fontSize: 28 }}>🏆 Certificate of Completion</h2>
                            <p style={{ color: '#fbbf24', fontSize: 18, marginBottom: 20, lineHeight: 1.6 }}>
                                You have successfully completed this course! Download your certificate as proof of completion.
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={handleDownloadCertificate}
                            >
                                📥 Download Certificate
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
