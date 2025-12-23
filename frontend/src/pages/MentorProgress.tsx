
import { useEffect, useState } from "react";
import { fetchMentorAnalytics } from "../api/mentor";
import { useAuth } from "../auth/AuthContext";

type AnalyticsRow = {
  course_id: string;
  course_name: string;
  student_id: string;
  student_name: string;
  percent: number;
  completedChapters?: number;
  totalChapters?: number;
};

export default function MentorProgress() {
  const { auth } = useAuth();
  const token = auth.token!;
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMentorAnalytics(token);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: 1000,
        margin: '0 auto',
        padding: 40,
        background: 'linear-gradient(135deg, #232326 80%, #27272a 100%)',
        border: '1px solid #333',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 rgba(225,29,72,0.18)',
        color: '#f4f4f5',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => window.location.assign('/mentor')}
          style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 18, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: 22, marginRight: 8 }}>←</span> Back to Dashboard
        </button>
        <h2 style={{ color: '#e11d48', marginBottom: 32, textAlign: 'center', fontSize: 32 }}>📊 Mentor Progress Analytics</h2>
        {loading ? (
          <div style={{ color: '#f4f4f5', textAlign: 'center' }}>Loading analytics...</div>
        ) : error ? (
          <div style={{ color: '#e11d48', textAlign: 'center', marginBottom: 16 }}>{error}</div>
        ) : analytics.length === 0 ? (
          <div style={{ color: '#a1a1aa', textAlign: 'center' }}>No student progress data found for your courses.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24, background: 'transparent', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '28%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#232326', color: '#e11d48' }}>
                  <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Course</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Student</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Progress</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e11d48', fontWeight: 700, fontSize: 16, textAlign: 'left' }}>Chapters Completed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((row, i) => (
                  <tr key={row.course_id + row.student_id} style={{ background: i % 2 ? '#232326' : '#18181b' }}>
                    <td style={{ padding: 12, borderBottom: '1px solid #333', textAlign: 'left', verticalAlign: 'middle' }}>{row.course_name}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #333', textAlign: 'left', verticalAlign: 'middle' }}>{row.student_name || row.student_id}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #333', textAlign: 'left', verticalAlign: 'middle' }}>
                      <div style={{ width: 120, background: '#333', borderRadius: 4, overflow: 'hidden', display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}>
                        <div style={{ width: `${row.percent}%`, background: '#e11d48', height: 16, transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ color: '#e11d48', fontWeight: 600, verticalAlign: 'middle' }}>{row.percent}%</span>
                    </td>
                    <td style={{ padding: 12, borderBottom: '1px solid #333', textAlign: 'left', verticalAlign: 'middle' }}>
                      {row.completedChapters ?? 0} / {row.totalChapters ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
