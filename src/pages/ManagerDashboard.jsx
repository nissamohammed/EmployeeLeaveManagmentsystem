import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSignOutAlt, faSearch, faFilter, faClock, faCheckCircle, faTimesCircle, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { getAllLeavesApi, getStatsApi, updateLeaveStatusApi } from "../services/allApi";
import StatsCards from "../components/StatsCards";
import Pagination from "../components/Pagination";

const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
    const [actionLoading, setActionLoading] = useState(null);
    const limit = 5;

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit });
        if (filterStatus) params.append("status", filterStatus);
        if (search) params.append("search", search);

        const [leavesResult, statsResult] = await Promise.all([
            getAllLeavesApi(`?${params.toString()}`),
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

    const handleStatusUpdate = async (leaveId, status) => {
        setActionLoading(leaveId + status);
        const result = await updateLeaveStatusApi(leaveId, { status });
        setActionLoading(null);

        if (result.status >= 200 && result.status < 300) {
            toast.success(`Leave ${status.toLowerCase()} successfully!`);
            fetchData();
        } else {
            toast.error(result.data?.error || `Failed to ${status.toLowerCase()} leave`);
        }
    };

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
                            <FontAwesomeIcon icon={faUsers} className="me-3" style={{ color: "#3498db" }} />
                            Manager Dashboard
                        </h1>
                        <p className="text-muted">Welcome, <strong>{user?.name}</strong> — Review and manage leave requests</p>
                    </div>
                    <button className="btn btn-outline-danger" onClick={handleLogout} style={{ borderRadius: "50px", padding: "10px 25px" }}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Logout
                    </button>
                </div>

                <StatsCards stats={stats} />

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="input-group shadow-sm" style={{ borderRadius: "50px", overflow: "hidden" }}>
                            <span className="input-group-text bg-white border-0"><FontAwesomeIcon icon={faSearch} /></span>
                            <input type="text" className="form-control border-0 py-3" placeholder="Search employees by name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
                        <h5 className="mb-0 fw-bold">All Leave Requests</h5>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                        ) : leaves.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                                        <tr>
                                            <th style={{ padding: "15px 20px" }}>Employee</th>
                                            <th>Leave Type</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Days</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaves.map((leave) => {
                                            const badge = getStatusBadge(leave.status);
                                            return (
                                                <tr key={leave._id}>
                                                    <td style={{ padding: "15px 20px" }}>
                                                        <div className="fw-bold">{leave.employeeName}</div>
                                                        <small className="text-muted">{new Date(leave.appliedDate).toLocaleDateString()}</small>
                                                    </td>
                                                    <td><span className="badge bg-light text-dark">{leave.leaveType}</span></td>
                                                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                                                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                                                    <td>{calculateDays(leave.fromDate, leave.toDate)}</td>
                                                    <td style={{ maxWidth: "180px" }}><small>{leave.description}</small></td>
                                                    <td>
                                                        <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, padding: "6px 12px" }}>
                                                            <FontAwesomeIcon icon={badge.icon} className="me-1" />{leave.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {leave.status === "Pending" ? (
                                                            <div className="d-flex gap-1">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    disabled={actionLoading === leave._id + "Approved"}
                                                                    onClick={() => handleStatusUpdate(leave._id, "Approved")}
                                                                    style={{ borderRadius: "20px" }}
                                                                >
                                                                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                    {actionLoading === leave._id + "Approved" ? "..." : "Approve"}
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    disabled={actionLoading === leave._id + "Rejected"}
                                                                    onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                                                                    style={{ borderRadius: "20px" }}
                                                                >
                                                                    <FontAwesomeIcon icon={faXmark} className="me-1" />
                                                                    {actionLoading === leave._id + "Rejected" ? "..." : "Reject"}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <small className="text-muted">—</small>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5"><p className="text-muted">No leave requests found</p></div>
                        )}
                    </div>
                </div>

                <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
};

export default ManagerDashboard;
