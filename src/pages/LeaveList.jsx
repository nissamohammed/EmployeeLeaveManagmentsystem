import React from 'react';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { applyLeaveApi, getLeavesApi, deleteLeaveApi } from '../services/allApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCalendarCheck, 
    faTrash, 
    faPlus, 
    faClock, 
    faSearch,
    faFilter,
    faTimesCircle,
    faCheckCircle,
    faHourglassHalf,
    faCalendarAlt,
    faInfoCircle,
    faArrowLeft,
    faExclamationCircle,
    faCheck,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import EditLeave from './EditLeave';
import { useNavigate } from 'react-router-dom';

function LeaveList() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [leaveList, setLeaveList] = useState([]);
    const [leaveDetails, setLeaveDetails] = useState({
        employeeName: "",
        fromDate: "",
        toDate: "",
        leaveType: "",
        description: ""
    });
    const [searchEmployee, setSearchEmployee] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Validation states
    const [errors, setErrors] = useState({
        employeeName: "",
        fromDate: "",
        toDate: "",
        leaveType: "",
        description: ""
    });
    const [touched, setTouched] = useState({
        employeeName: false,
        fromDate: false,
        toDate: false,
        leaveType: false,
        description: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateEmployeeName = (name) => {
        if (!name || name.trim() === '') {
            return 'Employee name is required';
        }
        if (name.trim().length < 2) {
            return 'Employee name must be at least 2 characters';
        }
        if (name.trim().length > 50) {
            return 'Employee name must be less than 50 characters';
        }
        if (!/^[a-zA-Z\s\-'.]+$/.test(name.trim())) {
            return 'Employee name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        return '';
    };

    const validateDate = (date, fieldName) => {
        if (!date) {
            return `${fieldName} is required`;
        }
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return `${fieldName} cannot be in the past`;
        }
        return '';
    };

    const validateFromDate = (date) => {
        return validateDate(date, 'From date');
    };

    const validateToDate = (date, fromDate) => {
        const toError = validateDate(date, 'To date');
        if (toError) return toError;
        
        if (fromDate && new Date(date) < new Date(fromDate)) {
            return 'To date cannot be before from date';
        }
        
        if (fromDate) {
            const from = new Date(fromDate);
            const to = new Date(date);
            const diffTime = Math.abs(to - from);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 30) {
                return 'Leave duration cannot exceed 30 days';
            }
        }
        return '';
    };

    const validateLeaveType = (type) => {
        if (!type) {
            return 'Leave type is required';
        }
        const validTypes = ['Sick Leave', 'LOP', 'Casual Leave', 'Earned Leave', 'Annual Leave'];
        if (!validTypes.includes(type)) {
            return 'Please select a valid leave type';
        }
        return '';
    };

    const validateDescription = (desc) => {
        if (!desc || desc.trim() === '') {
            return 'Description is required';
        }
        if (desc.trim().length < 10) {
            return 'Description must be at least 10 characters';
        }
        if (desc.trim().length > 500) {
            return 'Description must be less than 500 characters';
        }
        return '';
    };

    // Individual field validation handlers
    const validateField = (field, value) => {
        switch(field) {
            case 'employeeName':
                return validateEmployeeName(value);
            case 'fromDate':
                return validateFromDate(value);
            case 'toDate':
                return validateToDate(value, leaveDetails.fromDate);
            case 'leaveType':
                return validateLeaveType(value);
            case 'description':
                return validateDescription(value);
            default:
                return '';
        }
    };

    // Handle field change with validation
    const handleFieldChange = (field, value) => {
        // Update the value
        setLeaveDetails(prev => ({ ...prev, [field]: value }));
        
        // Mark field as touched
        setTouched(prev => ({ ...prev, [field]: true }));
        
        // Validate field
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
        
        // For toDate, also re-validate if fromDate changes
        if (field === 'fromDate' && leaveDetails.toDate) {
            const toDateError = validateToDate(leaveDetails.toDate, value);
            setErrors(prev => ({ ...prev, toDate: toDateError }));
        }
    };

    // Handle blur event
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, leaveDetails[field]);
        setErrors(prev => ({ ...prev, [field]: error }));
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {
            employeeName: validateEmployeeName(leaveDetails.employeeName),
            fromDate: validateFromDate(leaveDetails.fromDate),
            toDate: validateToDate(leaveDetails.toDate, leaveDetails.fromDate),
            leaveType: validateLeaveType(leaveDetails.leaveType),
            description: validateDescription(leaveDetails.description)
        };
        
        setErrors(newErrors);
        
        const allTouched = {
            employeeName: true,
            fromDate: true,
            toDate: true,
            leaveType: true,
            description: true
        };
        setTouched(allTouched);
        
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Apply Leave
    const handleApply = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('Please fix all errors before submitting');
            return;
        }
        
        setIsSubmitting(true);
        setLoading(true);
        
        try {
            const result = await applyLeaveApi(leaveDetails);
            if (result.status >= 200 && result.status < 300) {
                alert('✅ Leave applied successfully!');
                getLeaveList();
                handleClose();
            } else {
                alert('❌ Failed to apply leave: ' + (result.data?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error applying leave:', error);
            alert('❌ Failed to apply leave');
        }
        
        setIsSubmitting(false);
        setLoading(false);
    };

    // Get All Leaves
    const getLeaveList = async () => {
        setLoading(true);
        try {
            const result = await getLeavesApi();
            if (result.status >= 200 && result.status < 300) {
                setLeaveList(result.data || []);
            } else {
                console.error('Failed to fetch leaves:', result);
                setLeaveList([]);
            }
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setLeaveList([]);
        }
        setLoading(false);
    };

    // Delete Leave
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leave application?')) {
            return;
        }
        
        try {
            const result = await deleteLeaveApi(id);
            if (result.status === 200) {
                alert('🗑️ Leave application deleted successfully!');
                setDeleteStatus(true);
            } else {
                alert('❌ Failed to delete leave application');
            }
        } catch (error) {
            console.error('Error deleting leave:', error);
            alert('❌ Failed to delete leave application');
        }
    };

    // Modal handlers
    const handleShow = () => {
        setShow(true);
        setErrors({
            employeeName: "",
            fromDate: "",
            toDate: "",
            leaveType: "",
            description: ""
        });
        setTouched({
            employeeName: false,
            fromDate: false,
            toDate: false,
            leaveType: false,
            description: false
        });
    };

    const handleClose = () => {
        setShow(false);
        setLeaveDetails({
            employeeName: "",
            fromDate: "",
            toDate: "",
            leaveType: "",
            description: ""
        });
        setErrors({
            employeeName: "",
            fromDate: "",
            toDate: "",
            leaveType: "",
            description: ""
        });
        setTouched({
            employeeName: false,
            fromDate: false,
            toDate: false,
            leaveType: false,
            description: false
        });
        setIsSubmitting(false);
    };

    useEffect(() => {
        getLeaveList();
        if (deleteStatus) {
            setDeleteStatus(false);
        }
    }, [deleteStatus]);

    // Filter logic
    const filteredList = leaveList
        .filter((item) =>
            searchEmployee ? item.employeeName && item.employeeName.toLowerCase().includes(searchEmployee.toLowerCase()) : true
        )
        .filter((item) =>
            filterStatus ? item.status === filterStatus : true
        );

    // Calculate leave duration
    const calculateDays = (fromDate, toDate) => {
        if (!fromDate || !toDate) return 0;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Status Badge
    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved': 
                return { 
                    bg: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    icon: faCheckCircle,
                    text: 'Approved'
                };
            case 'Rejected': 
                return { 
                    bg: 'linear-gradient(135deg, #dc3545, #e74c3c)',
                    color: 'white',
                    icon: faTimesCircle,
                    text: 'Rejected'
                };
            default: 
                return { 
                    bg: 'linear-gradient(135deg, #ffc107, #f39c12)',
                    color: '#000',
                    icon: faHourglassHalf,
                    text: 'Pending'
                };
        }
    };

    const getLeaveTypeColor = (type) => {
        const colors = {
            'Sick Leave': '#e74c3c',
            'Annual Leave': '#3498db',
            'Casual Leave': '#2ecc71',
            'Earned Leave': '#9b59b6',
            'LOP': '#e67e22'
        };
        return colors[type] || '#95a5a6';
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
                        <button 
                            className="btn btn-outline-secondary me-3"
                            onClick={() => navigate('/')}
                            style={{ borderRadius: '50px' }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Back to Dashboard
                        </button>
                        <h1 className="display-5 fw-bold d-inline-block" style={{ color: '#2c3e50' }}>
                            <FontAwesomeIcon icon={faCalendarCheck} className="me-3" style={{ color: '#3498db' }} />
                            Leave Management
                        </h1>
                        <p className="text-muted">Apply for leave and manage all applications</p>
                    </div>
                    <button
                        className="btn btn-primary btn-lg shadow"
                        onClick={handleShow}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '12px 30px',
                            fontWeight: '600'
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Apply Leave
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <div className="input-group shadow-sm" style={{ borderRadius: '50px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-0">
                                <FontAwesomeIcon icon={faSearch} style={{ color: '#6c757d' }} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 py-3"
                                placeholder="Search by Employee Name..."
                                value={searchEmployee}
                                onChange={(e) => setSearchEmployee(e.target.value)}
                                style={{ borderRadius: '0 50px 50px 0' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group shadow-sm" style={{ borderRadius: '50px', overflow: 'hidden' }}>
                            <span className="input-group-text bg-white border-0">
                                <FontAwesomeIcon icon={faFilter} style={{ color: '#6c757d' }} />
                            </span>
                            <select
                                className="form-select border-0 py-3"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ borderRadius: '0 50px 50px 0' }}
                            >
                                <option value="">All Status</option>
                                <option value="Pending"> Pending</option>
                                <option value="Approved"> Approved</option>
                                <option value="Rejected"> Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                            <div className="card-body text-center py-3">
                                <h6 className="text-muted mb-2">Total Applications</h6>
                                <h3 className="fw-bold mb-0" style={{ color: '#3498db' }}>{leaveList.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                            <div className="card-body text-center py-3">
                                <h6 className="text-muted mb-2">Pending</h6>
                                <h3 className="fw-bold mb-0" style={{ color: '#f39c12' }}>
                                    {leaveList.filter(l => l.status === 'Pending').length}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                            <div className="card-body text-center py-3">
                                <h6 className="text-muted mb-2">Approved</h6>
                                <h3 className="fw-bold mb-0" style={{ color: '#27ae60' }}>
                                    {leaveList.filter(l => l.status === 'Approved').length}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
                            <div className="card-body text-center py-3">
                                <h6 className="text-muted mb-2">Rejected</h6>
                                <h3 className="fw-bold mb-0" style={{ color: '#e74c3c' }}>
                                    {leaveList.filter(l => l.status === 'Rejected').length}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave Cards */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading leave applications...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredList && filteredList.length > 0 ? (
                            filteredList.map((item, index) => {
                                const status = getStatusBadge(item.status);
                                const days = calculateDays(item.fromDate, item.toDate);
                                const leaveTypeColor = getLeaveTypeColor(item.leaveType);
                                
                                return (
                                    <div className="col-xl-4 col-lg-6 col-md-6" key={index}>
                                        <div className="card shadow-sm h-100" style={{
                                            borderRadius: '15px',
                                            border: 'none',
                                            background: 'white',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                                        }}>
                                            {/* Status Bar */}
                                            <div style={{
                                                height: '5px',
                                                background: status.bg,
                                                borderRadius: '15px 15px 0 0'
                                            }}></div>
                                            
                                            <div className="card-body p-4">
                                                {/* Header */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle me-3" style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '20px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {item.employeeName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                                                                {item.employeeName}
                                                            </h5>
                                                            <small className="text-muted">ID: {item._id.slice(-6)}</small>
                                                        </div>
                                                    </div>
                                                    <span className="badge" style={{
                                                        background: status.bg,
                                                        color: status.color,
                                                        padding: '8px 15px',
                                                        borderRadius: '20px',
                                                        fontSize: '13px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <FontAwesomeIcon icon={status.icon} className="me-1" />
                                                        {status.text}
                                                    </span>
                                                </div>

                                                {/* Leave Details */}
                                                <div className="mb-3">
                                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                                        <span className="badge" style={{
                                                            backgroundColor: leaveTypeColor + '20',
                                                            color: leaveTypeColor,
                                                            padding: '6px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {item.leaveType}
                                                        </span>
                                                        <span className="badge bg-light text-dark" style={{
                                                            padding: '6px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                            fontWeight: '600'
                                                        }}>
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                                            {days} {days === 1 ? 'day' : 'days'}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                                        <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Dates */}
                                                <div className="d-flex justify-content-between align-items-center p-2" style={{
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    marginBottom: '15px'
                                                }}>
                                                    <div>
                                                        <small className="text-muted d-block">From</small>
                                                        <strong>{new Date(item.fromDate).toLocaleDateString()}</strong>
                                                    </div>
                                                    <FontAwesomeIcon icon={faArrowLeft} className="text-muted" />
                                                    <div>
                                                        <small className="text-muted d-block">To</small>
                                                        <strong>{new Date(item.toDate).toLocaleDateString()}</strong>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <small className="text-muted">
                                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                                            Applied: {new Date(item.appliedDate).toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <EditLeave leave={item} refreshLeaveList={getLeaveList} />
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDelete(item._id)}
                                                            style={{
                                                                borderRadius: '50%',
                                                                width: '35px',
                                                                height: '35px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-12">
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '60px', color: '#d1d5db' }}>
                                        <FontAwesomeIcon icon={faCalendarCheck} />
                                    </div>
                                    <h4 className="mt-3 text-muted">No leave applications found</h4>
                                    <p className="text-muted">Try adjusting your search or apply for a new leave</p>
                                    <button 
                                        className="btn btn-primary mt-2"
                                        onClick={handleShow}
                                        style={{
                                            borderRadius: '50px',
                                            padding: '10px 30px'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Apply for Leave
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Apply Leave Modal with Validation - FIXED VERSION */}
                <Modal show={show} onHide={handleClose} size="md" centered>
                    <Modal.Header
                        closeButton
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderBottom: 'none',
                            borderRadius: '10px 10px 0 0'
                        }}
                    >
                        <Modal.Title className="fw-bold">
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            Apply for Leave
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{
                        backgroundColor: '#f8f9fa',
                        padding: '25px',
                    }}>
                        <form noValidate>
                            {/* Employee Name - FIXED */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Employee Name <span className="text-danger ms-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control shadow-sm ${touched.employeeName && errors.employeeName ? 'is-invalid' : ''}`}
                                    style={{ 
                                        borderRadius: '10px', 
                                        padding: '12px',
                                        borderColor: touched.employeeName && errors.employeeName ? '#dc3545' : '#ced4da'
                                    }}
                                    placeholder="Enter employee name *"
                                    value={leaveDetails.employeeName}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setLeaveDetails(prev => ({ ...prev, employeeName: value }));
                                        setTouched(prev => ({ ...prev, employeeName: true }));
                                        const error = validateEmployeeName(value);
                                        setErrors(prev => ({ ...prev, employeeName: error }));
                                    }}
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, employeeName: true }));
                                        const error = validateEmployeeName(leaveDetails.employeeName);
                                        setErrors(prev => ({ ...prev, employeeName: error }));
                                    }}
                                />
                                {touched.employeeName && errors.employeeName && (
                                    <div className="invalid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px' }}>
                                        <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                                        {errors.employeeName}
                                    </div>
                                )}
                                {touched.employeeName && !errors.employeeName && leaveDetails.employeeName && (
                                    <div className="valid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px', color: '#28a745' }}>
                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                        Valid
                                    </div>
                                )}
                            </div>

                            {/* From Date and To Date - FIXED */}
                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            From Date <span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control shadow-sm ${touched.fromDate && errors.fromDate ? 'is-invalid' : ''}`}
                                            style={{ 
                                                borderRadius: '10px', 
                                                padding: '12px',
                                                borderColor: touched.fromDate && errors.fromDate ? '#dc3545' : '#ced4da'
                                            }}
                                            value={leaveDetails.fromDate}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setLeaveDetails(prev => ({ ...prev, fromDate: value }));
                                                setTouched(prev => ({ ...prev, fromDate: true }));
                                                const error = validateFromDate(value);
                                                setErrors(prev => ({ ...prev, fromDate: error }));
                                                // Re-validate toDate if it exists
                                                if (leaveDetails.toDate) {
                                                    const toError = validateToDate(leaveDetails.toDate, value);
                                                    setErrors(prev => ({ ...prev, toDate: toError }));
                                                }
                                            }}
                                            onBlur={() => {
                                                setTouched(prev => ({ ...prev, fromDate: true }));
                                                const error = validateFromDate(leaveDetails.fromDate);
                                                setErrors(prev => ({ ...prev, fromDate: error }));
                                            }}
                                        />
                                        {touched.fromDate && errors.fromDate && (
                                            <div className="invalid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px' }}>
                                                <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                                                {errors.fromDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">
                                            To Date <span className="text-danger ms-1">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control shadow-sm ${touched.toDate && errors.toDate ? 'is-invalid' : ''}`}
                                            style={{ 
                                                borderRadius: '10px', 
                                                padding: '12px',
                                                borderColor: touched.toDate && errors.toDate ? '#dc3545' : '#ced4da'
                                            }}
                                            value={leaveDetails.toDate}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setLeaveDetails(prev => ({ ...prev, toDate: value }));
                                                setTouched(prev => ({ ...prev, toDate: true }));
                                                const error = validateToDate(value, leaveDetails.fromDate);
                                                setErrors(prev => ({ ...prev, toDate: error }));
                                            }}
                                            onBlur={() => {
                                                setTouched(prev => ({ ...prev, toDate: true }));
                                                const error = validateToDate(leaveDetails.toDate, leaveDetails.fromDate);
                                                setErrors(prev => ({ ...prev, toDate: error }));
                                            }}
                                        />
                                        {touched.toDate && errors.toDate && (
                                            <div className="invalid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px' }}>
                                                <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                                                {errors.toDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Leave Type - FIXED */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Leave Type <span className="text-danger ms-1">*</span>
                                </label>
                                <select
                                    className={`form-select shadow-sm ${touched.leaveType && errors.leaveType ? 'is-invalid' : ''}`}
                                    style={{ 
                                        borderRadius: '10px', 
                                        padding: '12px',
                                        borderColor: touched.leaveType && errors.leaveType ? '#dc3545' : '#ced4da'
                                    }}
                                    value={leaveDetails.leaveType}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setLeaveDetails(prev => ({ ...prev, leaveType: value }));
                                        setTouched(prev => ({ ...prev, leaveType: true }));
                                        const error = validateLeaveType(value);
                                        setErrors(prev => ({ ...prev, leaveType: error }));
                                    }}
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, leaveType: true }));
                                        const error = validateLeaveType(leaveDetails.leaveType);
                                        setErrors(prev => ({ ...prev, leaveType: error }));
                                    }}
                                >
                                    <option value="">Select Leave Type *</option>
                                    <option value="Sick Leave">Sick</option>
                                    <option value="LOP">Loss of Pay (LOP)</option>
                                    <option value="Casual Leave">Casual Leave</option>
                                    <option value="Earned Leave"> Earned Leave</option>
                                    <option value="Annual Leave">Annual Leave</option>
                                </select>
                                {touched.leaveType && errors.leaveType && (
                                    <div className="invalid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px' }}>
                                        <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                                        {errors.leaveType}
                                    </div>
                                )}
                            </div>

                            {/* Description - FIXED */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Description <span className="text-danger ms-1">*</span>
                                </label>
                                <textarea
                                    className={`form-control shadow-sm ${touched.description && errors.description ? 'is-invalid' : ''}`}
                                    style={{ 
                                        borderRadius: '10px', 
                                        padding: '12px',
                                        borderColor: touched.description && errors.description ? '#dc3545' : '#ced4da'
                                    }}
                                    placeholder="Enter leave description (min 10 characters) *"
                                    rows={3}
                                    value={leaveDetails.description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setLeaveDetails(prev => ({ ...prev, description: value }));
                                        setTouched(prev => ({ ...prev, description: true }));
                                        const error = validateDescription(value);
                                        setErrors(prev => ({ ...prev, description: error }));
                                    }}
                                    onBlur={() => {
                                        setTouched(prev => ({ ...prev, description: true }));
                                        const error = validateDescription(leaveDetails.description);
                                        setErrors(prev => ({ ...prev, description: error }));
                                    }}
                                />
                                {touched.description && errors.description && (
                                    <div className="invalid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px' }}>
                                        <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                                        {errors.description}
                                    </div>
                                )}
                                {touched.description && !errors.description && leaveDetails.description && (
                                    <div className="valid-feedback d-block" style={{ fontSize: '13px', marginTop: '5px', color: '#28a745' }}>
                                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                                        Valid
                                    </div>
                                )}
                                {leaveDetails.description && (
                                    <div className="text-end mt-1" style={{ fontSize: '12px', color: '#6c757d' }}>
                                        {leaveDetails.description.length}/500 characters
                                        {leaveDetails.description.length < 10 && leaveDetails.description.length > 0 && (
                                            <span className="text-danger ms-1">
                                                (min 10 required)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Form Validation Summary */}
                            {Object.values(errors).some(error => error !== '') && (
                                <div className="alert alert-danger mt-3" style={{ borderRadius: '10px' }}>
                                    <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
                                    <strong>Please fix the following errors:</strong>
                                    <ul className="mb-0 mt-1" style={{ paddingLeft: '20px' }}>
                                        {Object.entries(errors).map(([field, error]) => 
                                            error && <li key={field}>{error}</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </form>
                    </Modal.Body>
                    <Modal.Footer style={{
                        backgroundColor: '#f8f9fa',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px'
                    }}>
                        <Button
                            variant="light"
                            onClick={handleClose}
                            style={{ borderRadius: '50px', padding: '8px 25px' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleApply}
                            disabled={loading || isSubmitting || Object.values(errors).some(error => error !== '')}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '8px 30px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Applying...
                                </>
                            ) : (
                                'Apply Leave'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
}

export default LeaveList;