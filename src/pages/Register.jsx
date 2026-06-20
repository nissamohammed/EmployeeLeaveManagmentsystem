import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faUserPlus, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { registerApi } from "../services/allApi";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
        if (!form.password) newErrors.password = "Password is required";
        else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
        const result = await registerApi(form);
        setLoading(false);

        if (result.status >= 200 && result.status < 300) {
            login(result.data.user, result.data.token);
            toast.success("Registration successful!");
            navigate(result.data.user.role === "Manager" ? "/manager" : "/employee");
        } else {
            toast.error(result.data?.error || "Registration failed");
        }
    };

    return (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div className="card shadow-lg" style={{ width: "100%", maxWidth: "450px", borderRadius: "20px", border: "none" }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <FontAwesomeIcon icon={faBuilding} style={{ fontSize: "48px", color: "#667eea" }} />
                        <h2 className="fw-bold mt-3" style={{ color: "#2c3e50" }}>Create Account</h2>
                        <p className="text-muted">Register for leave management</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Full Name</label>
                            <div className="input-group">
                                <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                                <input type="text" className={`form-control ${errors.name ? "is-invalid" : ""}`} placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: "12px" }} />
                            </div>
                            {errors.name && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.name}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <div className="input-group">
                                <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
                                <input type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: "12px" }} />
                            </div>
                            {errors.email && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.email}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Password</label>
                            <div className="input-group">
                                <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                                <input type="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ padding: "12px" }} />
                            </div>
                            {errors.password && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>{errors.password}</div>}
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Role</label>
                            <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: "12px" }}>
                                <option value="Employee">Employee</option>
                                <option value="Manager">Manager</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" disabled={loading} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "50px" }}>
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>
                    <p className="text-center mt-4 mb-0 text-muted">
                        Already have an account? <Link to="/login" style={{ color: "#667eea", fontWeight: "600" }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
