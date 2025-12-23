import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

export default function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"student" | "mentor" | "admin">("student");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await registerUser({
                name,
                email,
                password,
                role
            });
            alert("Registered successfully. Please login.");
            navigate("/login");
        } catch (err: any) {
            // If error indicates already registered, redirect to login
            if (err.message && (err.message.toLowerCase().includes("already registered") || err.message.toLowerCase().includes("already exists"))) {
                alert("You are already registered. Please log in.");
                navigate("/login");
            } else {
                setError(err.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', width: '100vw', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 480,
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
                <div style={{
                    background: '#27272a',
                    color: '#fbbf24',
                    borderRadius: 8,
                    padding: '10px 16px',
                    marginBottom: 16,
                    fontSize: 14,
                    textAlign: 'center',
                    border: '1px solid #fbbf24',
                }}>
                    debug: admin is auto approved to simulate mentor approval progress. This will be removed in production.
                </div>
                <h2 style={{ color: '#e11d48', marginBottom: 24, textAlign: 'center' }}>Register</h2>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Name</label>
                    <input
                        placeholder="Enter your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />

                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Email</label>
                    <input
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />

                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Password</label>
                    <input
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}
                    />

                    <label style={{ color: '#e11d48', fontWeight: 600, marginBottom: 4 }}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as any)} required style={{ padding: '10px', borderRadius: 8, border: '1px solid #333', background: '#18181b', color: '#f4f4f5', fontSize: 15 }}>
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 10 }}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <span style={{ color: '#f4f4f5', fontSize: 15 }}>Already registered?{' '}
                        <a href="/login" style={{ color: '#e11d48', textDecoration: 'underline', cursor: 'pointer' }}>Log in</a>
                    </span>
                </div>
            </div>
        </div>
    );
}
