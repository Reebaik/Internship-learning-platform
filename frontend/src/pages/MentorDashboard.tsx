import { useEffect, useState } from "react";
import {
  fetchMyCourses,
  createCourse,
  deleteCourse
} from "../api/courses";
import { useNavigate } from "react-router-dom";

type Course = {
  id: string;
  title: string;
  description: string;
  total_chapters: number;
};

export default function MentorMyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalChapters, setTotalChapters] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setCourses(await fetchMyCourses());
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await createCourse({
      title,
      description,
      total_chapters: totalChapters
    });

    setTitle("");
    setDescription("");
    setTotalChapters(1);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this course?")) return;
    await deleteCourse(id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', padding: 0, margin: 0 }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>
        {/* Back Button to Home */}
        <button
          onClick={() => navigate("/")}
          style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back to Home
        </button>

        <h1 style={{ textAlign: 'left', color: '#e11d48', marginBottom: 32, fontSize: 36 }}>🧑‍🏫 Mentor Dashboard</h1>

        {/* CREATE COURSE - as a tile */}
        <section style={{
          marginBottom: 40,
          border: '1px solid #333',
          borderRadius: 24,
          padding: 36,
          background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)',
          boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)',
          maxWidth: 750,
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.2s',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'radial-gradient(circle, #e11d48 0%, transparent 70%)', opacity: 0.12, zIndex: 0 }} />
          <h2 style={{ marginTop: 0, textAlign: 'left', color: '#f4f4f5', zIndex: 1, position: 'relative' }}>➕ Create Course</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, zIndex: 1, position: 'relative' }}>
            <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Course Title</label>
            <input
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
            />

            <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Course Description</label>
            <textarea
              placeholder="Enter course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15, minHeight: 60 }}
            />

            <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Total Chapters</label>
            <input
              type="number"
              min={1}
              value={totalChapters}
              onChange={(e) => setTotalChapters(Number(e.target.value))}
              required
              style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
            />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
          <button
            className="btn btn-primary"
            style={{ width: '100%', zIndex: 1, position: 'relative' }}
            onClick={() => navigate("/mentor/progress")}
          >
            📊 View Student Progress
          </button>
        </section>

        {/* LIST COURSES */}
        <section style={{ marginTop: 60 }}>
          <h2 style={{ textAlign: 'left', color: '#f4f4f5' }}>My Courses</h2>
          {courses.length === 0 && <p style={{ textAlign: 'left', color: '#a1a1aa' }}>No courses yet.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32, marginTop: 24 }}>
            {courses.map((c) => (
              <div key={c.id} style={{ border: "1px solid #333", padding: 18, borderRadius: 12, background: '#232326', color: '#f4f4f5', boxShadow: '0 2px 12px 0 rgba(225,29,72,0.08)' }}>
                <strong style={{ fontSize: 18 }}>{c.title}</strong>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => navigate(`/mentor/course/${c.id}/edit`)} style={{ marginRight: 8 }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => navigate(`/mentor/course/${c.id}/chapters`)} style={{ marginRight: 8 }}>
                    📚 Manage Chapters
                  </button>
                  <button onClick={() => navigate(`/mentor/assign/${c.id}`)} style={{ marginRight: 8 }}>
                    👥 Assign Students
                  </button>
                  <button onClick={() => remove(c.id)} style={{ color: "#e11d48" }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
    // removed unreachable duplicate code after main return