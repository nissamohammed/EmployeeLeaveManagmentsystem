import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { updateLeaveApi } from '../services/allApi';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function EditLeave({ leave, refreshLeaveList }) {
    const [show, setShow] = useState(false);
    const [leaveDetails, setLeaveDetails] = useState({
        id: leave?._id,
        status: leave?.status || 'Pending'
    });

    // Update leave status
    const handleUpdate = async (e) => {
        e.preventDefault();
        const { id, status } = leaveDetails;
        
        if (!status) {
            alert('Please select a status');
            return;
        }

        try {
            const reqBody = { status }; // Send as JSON object
            const result = await updateLeaveApi(id, reqBody);
            console.log('Update leave response:', result);
            
            if (result.status === 200) {
                alert('Leave status updated successfully! ✅');
                refreshLeaveList(); // Refresh the list
                handleClose(); // Close modal
            } else {
                alert('Something went wrong: ' + (result.data?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating leave:', error);
            alert('Failed to update leave status');
        }
    }

    const handleShow = () => setShow(true);
    const handleClose = () => {
        setShow(false);
        setLeaveDetails({
            id: leave?._id,
            status: leave?.status || 'Pending'
        });
    }

    // Get status badge color for display
    const getStatusColor = (status) => {
        switch(status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            default: return 'warning';
        }
    }

    return (
        <>
            <FontAwesomeIcon 
                icon={faEdit} 
                className="text-success cursor-pointer" 
                style={{ cursor: 'pointer', fontSize: '18px' }}
                onClick={handleShow} 
                title="Update Leave Status"
            />
            
            <Modal show={show} onHide={handleClose} size="md" centered>
                <Modal.Header
                    closeButton
                    style={{
                        background: "linear-gradient(to right, #4caf50, #8bc34a)",
                        color: "white",
                        borderBottom: "none",
                    }}
                >
                    <Modal.Title className="fw-bold">
                        Update Leave Status <FontAwesomeIcon icon={faEdit} className="ms-2" />
                    </Modal.Title>
                </Modal.Header>
                
                <Modal.Body style={{
                    backgroundColor: "#f9f9f9",
                    padding: "25px",
                }}>
                    <div className="d-flex flex-column gap-3">
                        {/* Leave Information Display */}
                        <div className="alert alert-info" style={{ backgroundColor: "#e3f2fd", borderColor: "#90caf9" }}>
                            <h6 className="mb-2"><strong>Leave Application Details:</strong></h6>
                            <div className="row">
                                <div className="col-6">
                                    <strong>Employee:</strong> {leave?.employeeName}
                                </div>
                                <div className="col-6">
                                    <strong>Leave Type:</strong> {leave?.leaveType}
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-6">
                                    <strong>From:</strong> {leave?.fromDate ? new Date(leave.fromDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="col-6">
                                    <strong>To:</strong> {leave?.toDate ? new Date(leave.toDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-12">
                                    <strong>Description:</strong> {leave?.description}
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col-12">
                                    <strong>Current Status:</strong> 
                                    <span className={`badge bg-${getStatusColor(leave?.status)} ms-2`}>
                                        {leave?.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Update Dropdown */}
                        <div>
                            <label className="form-label fw-bold">Change Status:</label>
                            <select
                                value={leaveDetails?.status}
                                className="form-select shadow-sm"
                                onChange={(e) =>
                                    setLeaveDetails({ ...leaveDetails, status: e.target.value })
                                }
                                style={{
                                    borderRadius: "5px",
                                    border: "1px solid #dcdcdc",
                                    padding: "10px"
                                }}
                            >
                                <option value="">Select Status</option>
                                <option value="Pending">⏳ Pending</option>
                                <option value="Approved">✅ Approved</option>
                                <option value="Rejected">❌ Rejected</option>
                            </select>
                        </div>

                        {/* Status Change Warning */}
                        {leaveDetails?.status !== leave?.status && (
                            <div className="alert alert-warning" style={{ padding: "8px 12px", marginBottom: 0 }}>
                                <small>⚠️ You are changing status from <strong>{leave?.status}</strong> to <strong>{leaveDetails?.status}</strong></small>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                
                <Modal.Footer style={{
                    backgroundColor: "#f9f9f9",
                    borderTop: "none",
                }}>
                    <Button
                        variant="light"
                        onClick={handleClose}
                        style={{
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #dcdcdc",
                            padding: "8px 20px",
                            borderRadius: "5px"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleUpdate}
                        style={{
                            background: "linear-gradient(to right, #43a047, #66bb6a)",
                            color: "#fff",
                            border: "none",
                            padding: "8px 25px",
                            fontWeight: "bold",
                            borderRadius: "5px"
                        }}
                        disabled={leaveDetails?.status === leave?.status}
                    >
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default EditLeave;