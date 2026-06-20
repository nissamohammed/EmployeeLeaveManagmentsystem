import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faPlus, faSignOutAlt, faSearch, faFilter, faClock, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { getMyLeavesApi, getStatsApi } from "../services/allApi";
import StatsCards from "../components/StatsCards";
import LeaveForm from "../components/LeaveForm";
import Pagination from "../components/Pagination";

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const limit = 5;

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit });
        if (filterStatus) params.append("status", filterStatus);
        if (search) params.append("search", search);

        const [leavesResult, statsResult] = await Promise.all([
            getMyLeavesApi(`?${params.toString()}`),
            getStatsApi()
        ]);

        if (leavesResult.status >= 200 && leavesResult.status < 300) {
            setLeaves(leavesResult.data.leaves || []);
            setPagination(leavesResult.data.pagination || { totalPages: 1, total: 0 });
        }
        if (statsResult.status >= 200 && statsResult.status < 300) {
            setStats(statsResult.data);
        }
        setLoading(false);
    }, [page, filterStatus, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = () => {
        logout();
        toast.info("Logged out successfully");
    };

    const getStatusBadge = (status) => {
        const map = {
            Approved: { bg: "#d5f5e3", color: "#27ae60", icon: faCheckCircle },
            Rejected: { bg: "#fadbd8", color: "#e74c3c", icon: faTimesCircle },
            Pending: { bg: "#fdebd0", color: "#f39c12", icon: faClock }
        };
        return map[status] || map.Pending;
    };

    const calculateDays = (from, to) => {
        return Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh", padding: "20px" }}>
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-6 fw-bold" style={{ color: "#2c3e50" }}>
                            <FontAwesomeIcon icon={faCalendarCheck} className="me-3" style={{ color: "#3498db" }} />
                            Employee Dashboard
                        </h1>
                        <p className="text-muted">Welcome, <strong>{user?.name}</strong></p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "50px", padding: "10px 25px" }}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />Apply Leave
                        </button>
                        <button className="btn btn-outline-danger" onClick={handleLogout} style={{ borderRadius: "50px", padding: "10px 25px" }}>
                            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Logout
                        </button>
                    </div>
                </div>

                <StatsCards stats={stats} />

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="input-group shadow-sm" style={{ borderRadius: "50px", overflow: "hidden" }}>
                            <span className="input-group-text bg-white border-0"><FontAwesomeIcon icon={faSearch} /></span>
                            <input type="text" className="form-control border-0 py-3" placeholder="Search by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group shadow-sm" style={{ borderRadius: "50px", overflow: "hidden" }}>
                            <span className="input-group-text bg-white border-0"><FontAwesomeIcon icon={faFilter} /></span>
                            <select className="form-select border-0 py-3" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                                <option value="">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm" style={{ borderRadius: "15px", border: "none" }}>
                    <div className="card-header bg-white py-3" style={{ borderRadius: "15px 15px 0 0" }}>
                        <h5 className="mb-0 fw-bold">My Leave History</h5>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                        ) : leaves.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                                        <tr>
                                            <th style={{ padding: "15px 20px" }}>Leave Type</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Days</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Applied</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaves.map((leave) => {
                                            const badge = getStatusBadge(leave.status);
                                            return (
                                                <tr key={leave._id}>
                                                    <td style={{ padding: "15px 20px" }}><span className="badge bg-light text-dark">{leave.leaveType}</span></td>
                                                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                                                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                                                    <td>{calculateDays(leave.fromDate, leave.toDate)}</td>
                                                    <td style={{ maxWidth: "200px" }}><small>{leave.description}</small></td>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, padding: "6px 12px" }}>
                                                            <FontAwesomeIcon icon={badge.icon} className="me-1" />{leave.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(leave.appliedDate).toLocaleDateString()}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">No leave applications found</p>
                                <button className="btn btn-primary" onClick={() => setShowForm(true)}>Apply for Leave</button>
                            </div>
                        )}
                    </div>
                </div>

                <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>

            <LeaveForm show={showForm} onClose={() => setShowForm(false)} onSuccess={fetchData} />
        </div>
    );
};

export default EmployeeDashboard;
