
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

export default function MentorAssignStudents() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch mentor's courses
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        setCourses(await res.json());
      } catch (err: any) {
        setMessage(err.message || "Error loading courses");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Fetch students when page loads
  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!res.ok) throw new Error("Failed to fetch students");
        setStudents(await res.json());
      } catch (err: any) {
        setMessage(err.message || "Error loading students");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const handleAssign = async () => {
    if (!selectedCourse || selected.length === 0) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/courses/${selectedCourse}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ studentIds: selected })
      });
      if (!res.ok) throw new Error("Failed to assign students");
      setMessage("Students assigned successfully!");
    } catch (err: any) {
      setMessage(err.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => window.location.assign('/mentor')}
          style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back to Dashboard
        </button>
        <h2 style={{ color: '#e11d48', marginBottom: 24, textAlign: 'center' }}>Assign Students to Course</h2>
        {message && <div style={{ color: message.includes("success") ? "#22c55e" : "#e11d48", marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{message}</div>}
        {loading && <p style={{ color: '#f4f4f5', textAlign: 'center' }}>Loading...</p>}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4, display: 'block' }}>Select Course</label>
          <select
            value={selectedCourse}
            onChange={e => {
              setSelectedCourse(e.target.value);
              setSelected([]); // reset selected students when course changes
            }}
            style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15, width: '100%' }}
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 18 }}>
              {students.map((s) => (
                <li key={s.id} style={{ marginBottom: 8 }}>
                  <label style={{ color: '#f4f4f5', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={e => {
                        setSelected(sel => e.target.checked ? [...sel, s.id] : sel.filter(id => id !== s.id));
                      }}
                      style={{ marginRight: 8 }}
                    />
                    {s.name} ({s.email})
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handleAssign} disabled={loading || selected.length === 0} style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#e11d48', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: loading || selected.length === 0 ? 'not-allowed' : 'pointer', marginTop: 8 }}>
              Assign Selected Students
            </button>
          </>
        )}
      </div>
    </div>
  );
}
