import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faCalendarCheck, 
    faClock, 
    faCheckCircle, 
    faTimesCircle,
    faArrowRight,
    faChartLine,
    faUserPlus,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { getLeavesApi } from '../services/allApi';

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const result = await getLeavesApi();
            if (result.status >= 200 && result.status < 300) {
                const leaves = result.data || [];
                
                // Calculate statistics
                const total = leaves.length;
                const pending = leaves.filter(l => l.status === 'Pending').length;
                const approved = leaves.filter(l => l.status === 'Approved').length;
                const rejected = leaves.filter(l => l.status === 'Rejected').length;
                
                setStats({ total, pending, approved, rejected });
                
                // Get recent 5 leaves
                const recent = leaves.slice(0, 5);
                setRecentLeaves(recent);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, color, bgColor, onClick }) => (
        <div 
            className="col-md-3 col-sm-6 mb-3"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="card shadow-sm h-100" style={{
                border: 'none',
                borderRadius: '15px',
                background: 'white',
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: onClick ? 'pointer' : 'default'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
            }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 className="text-muted mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>{title}</h6>
                            <h3 className="mb-0" style={{ fontWeight: 'bold', color: '#2c3e50' }}>{value}</h3>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: bgColor,
                            color: color,
                            fontSize: '20px'
                        }}>
                            <FontAwesomeIcon icon={icon} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved': 
                return { color: '#28a745', bg: '#d4edda', icon: faCheckCircle };
            case 'Rejected': 
                return { color: '#dc3545', bg: '#f8d7da', icon: faTimesCircle };
            default: 
                return { color: '#ffc107', bg: '#fff3cd', icon: faClock };
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="container-fluid py-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-5 fw-bold" style={{ color: '#2c3e50' }}>
                            <FontAwesomeIcon icon={faBuilding} className="me-3" style={{ color: '#3498db' }} />
                            Leave Management Dashboard
                        </h1>
                        <p className="text-muted">Track and manage all employee leave applications</p>
                    </div>
                    <button 
                        className="btn btn-primary btn-lg shadow"
                        onClick={() => navigate('/leaves')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '12px 30px',
                            fontWeight: '600'
                        }}
                    >
                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                        View All Leaves
                        <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="row g-3 mb-4">
                    <StatCard 
                        icon={faCalendarCheck}
                        title="Total Leaves"
                        value={stats.total}
                        color="#3498db"
                        bgColor="#d6eaf8"
                    />
                    <StatCard 
                        icon={faClock}
                        title="Pending"
                        value={stats.pending}
                        color="#f39c12"
                        bgColor="#fdebd0"
                        onClick={() => navigate('/leaves')}
                    />
                    <StatCard 
                        icon={faCheckCircle}
                        title="Approved"
                        value={stats.approved}
                        color="#27ae60"
                        bgColor="#d5f5e3"
                        onClick={() => navigate('/leaves')}
                    />
                    <StatCard 
                        icon={faTimesCircle}
                        title="Rejected"
                        value={stats.rejected}
                        color="#e74c3c"
                        bgColor="#fadbd8"
                        onClick={() => navigate('/leaves')}
                    />
                </div>

                {/* Chart and Recent Activity */}
                <div className="row g-4">
                    {/* Recent Leaves */}
                    <div className="col-md-8">
                        <div className="card shadow-sm" style={{
                            borderRadius: '15px',
                            border: 'none',
                            background: 'white'
                        }}>
                            <div className="card-header bg-white" style={{
                                borderBottom: '2px solid #f0f0f0',
                                borderRadius: '15px 15px 0 0',
                                padding: '20px 25px'
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                                        <FontAwesomeIcon icon={faChartLine} className="me-2" style={{ color: '#3498db' }} />
                                        Recent Leave Applications
                                    </h5>
                                    <button 
                                        className="btn btn-link text-decoration-none"
                                        onClick={() => navigate('/leaves')}
                                        style={{ color: '#3498db' }}
                                    >
                                        View All <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : recentLeaves.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ padding: '15px 20px' }}>Employee</th>
                                                    <th>Leave Type</th>
                                                    <th>Duration</th>
                                                    <th>Status</th>
                                                    <th>Applied</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentLeaves.map((leave, index) => {
                                                    const status = getStatusBadge(leave.status);
                                                    const days = Math.ceil(
                                                        (new Date(leave.toDate) - new Date(leave.fromDate)) / 
                                                        (1000 * 60 * 60 * 24)
                                                    ) + 1;
                                                    
                                                    return (
                                                        <tr key={index}>
                                                            <td style={{ padding: '15px 20px' }}>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="rounded-circle me-2" style={{
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        backgroundColor: '#3498db',
                                                                        color: 'white',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '14px',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {leave.employeeName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold">{leave.employeeName}</div>
                                                                        <small className="text-muted">{leave._id}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="badge" style={{
                                                                    backgroundColor: '#e8f0fe',
                                                                    color: '#1967d2',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '20px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {leave.leaveType}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <span className="fw-bold me-1">{days}</span>
                                                                    <span className="text-muted" style={{ fontSize: '12px' }}>days</span>
                                                                </div>
                                                                <small className="text-muted" style={{ fontSize: '11px' }}>
                                                                    {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <span className="badge" style={{
                                                                    backgroundColor: status.bg,
                                                                    color: status.color,
                                                                    padding: '6px 15px',
                                                                    borderRadius: '20px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    <FontAwesomeIcon icon={status.icon} className="me-1" />
                                                                    {leave.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontSize: '13px', color: '#6c757d' }}>
                                                                {new Date(leave.appliedDate).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <p className="text-muted">No leave applications yet</p>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigate('/leaves')}
                                        >
                                            Apply for Leave
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="col-md-4">
                        <div className="card shadow-sm" style={{
                            borderRadius: '15px',
                            border: 'none',
                            background: 'white'
                        }}>
                            <div className="card-header bg-white" style={{
                                borderBottom: '2px solid #f0f0f0',
                                borderRadius: '15px 15px 0 0',
                                padding: '20px 25px'
                            }}>
                                <h5 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                                    <FontAwesomeIcon icon={faUsers} className="me-2" style={{ color: '#3498db' }} />
                                    Summary
                                </h5>
                            </div>
                            <div className="card-body p-3">
                                <div className="d-grid gap-3">
                                    <button 
                                        className="btn btn-primary d-flex align-items-center justify-content-between p-3"
                                        onClick={() => navigate('/leaves')}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '12px'
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                            Apply for Leave
                                        </span>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                    <button 
                                        className="btn btn-outline-primary d-flex align-items-center justify-content-between p-3"
                                        onClick={() => navigate('/leaves')}
                                        style={{
                                            border: '2px solid #3498db',
                                            borderRadius: '12px',
                                            color: '#2c3e50'
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon={faClock} className="me-2" />
                                            View Pending Leaves
                                        </span>
                                        <span className="badge" style={{ backgroundColor: '#f39c12', color: 'white' }}>
                                            {stats.pending}
                                        </span>
                                    </button>
                                    <button 
                                        className="btn btn-outline-success d-flex align-items-center justify-content-between p-3"
                                        onClick={() => navigate('/leaves')}
                                        style={{
                                            border: '2px solid #27ae60',
                                            borderRadius: '12px',
                                            color: '#2c3e50'
                                        }}
                                    >
                                        <span>
                                            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                            View Approved Leaves
                                        </span>
                                        <span className="badge" style={{ backgroundColor: '#27ae60', color: 'white' }}>
                                            {stats.approved}
                                        </span>
                                    </button>
                                    <div className="card bg-light" style={{ borderRadius: '12px', border: 'none' }}>
                                        <div className="card-body p-3">
                                            <h6 className="fw-bold mb-2">Quick Stats</h6>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <small className="text-muted">Pending</small>
                                                    <p className="h5 mb-0" style={{ color: '#f39c12' }}>{stats.pending}</p>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Approved</small>
                                                    <p className="h5 mb-0" style={{ color: '#27ae60' }}>{stats.approved}</p>
                                                </div>
                                                <div>
                                                    <small className="text-muted">Rejected</small>
                                                    <p className="h5 mb-0" style={{ color: '#e74c3c' }}>{stats.rejected}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;