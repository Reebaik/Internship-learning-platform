import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await loginApi(email, password);
            // store auth
            login(data.token, data.role);
            // redirect by role
            // Example: navigate to dashboard or home
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 420,
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
                <h2 style={{ color: '#e11d48', marginBottom: 24, textAlign: 'center' }}>Login</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />

                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />

                    {error && (
                        <p style={{ color: 'red', marginTop: 8 }}>{error}</p>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 10 }}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <span style={{ color: '#f4f4f5', fontSize: 15 }}>Not registered?{' '}
                        <a href="/register" style={{ color: '#e11d48', textDecoration: 'underline', cursor: 'pointer' }}>Register</a>
                    </span>
                </div>
            </div>
        </div>
    );
}
