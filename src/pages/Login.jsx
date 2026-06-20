import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSignInAlt, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { loginApi } from "../services/allApi";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fix validation errors");
            return;
        }

        setLoading(true);
        const result = await loginApi({ email, password });
        setLoading(false);

        if (result.status >= 200 && result.status < 300) {
            login(result.data.user, result.data.token);
            toast.success("Login successful!");
            navigate(result.data.user.role === "Manager" ? "/manager" : "/employee");
        } else {
            toast.error(result.data?.error || "Login failed");
        }
    };

    return (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div className="card shadow-lg" style={{ width: "100%", maxWidth: "450px", borderRadius: "20px", border: "none" }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faBuilding} style={{ fontSize: "48px", color: "#667eea" }} />
                        <h2 className="fw-bold mt-3" style={{ color: "#2c3e50" }}>Leave Management</h2>
                        <p className="text-muted">Sign in to your account</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <div className="input-group">
                                <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ padding: "12px" }}
                                />
                            </div>
                            {errors.email && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.email}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Password</label>
                            <div className="input-group">
                                <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ padding: "12px" }}
                                />
                            </div>
                            {errors.password && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.password}</div>}
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-3 fw-bold"
                            disabled={loading}
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "50px" }}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                    <p className="text-center mt-4 mb-0 text-muted">
                        Don't have an account? <Link to="/register" style={{ color: "#667eea", fontWeight: "600" }}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
