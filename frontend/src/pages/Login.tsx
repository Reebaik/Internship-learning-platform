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
            navigate("/")
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto" }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={{ marginTop: 10 }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <p style={{ color: "red", marginTop: 10 }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: 15 }}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
