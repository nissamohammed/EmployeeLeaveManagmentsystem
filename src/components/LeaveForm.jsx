import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faExclamationCircle, faCheck } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { applyLeaveApi } from "../services/allApi";

const LEAVE_TYPES = ["Sick Leave", "LOP", "Casual Leave", "Earned Leave", "Annual Leave"];

const LeaveForm = ({ show, onClose, onSuccess }) => {
    const [form, setForm] = useState({ fromDate: "", toDate: "", leaveType: "", description: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
//validation
    const validateFromDate = (date) => { 
        if (!date) return "From date is required";
        const selected = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) return "From date cannot be in the past";
        return "";
    };

    const validateToDate = (toDate, fromDate) => {
        if (!toDate) return "To date is required";
        if (fromDate && new Date(toDate) < new Date(fromDate)) {
            return "To date cannot be before from date";
        }
        if (fromDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            const days = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
            if (days > 10) return "Leave days cannot exceed 10 days";
        }
        return "";
    };

    const validateField = (field, value) => {
        switch (field) {
            case "fromDate": return validateFromDate(value);
            case "toDate": return validateToDate(value, form.fromDate);
            case "leaveType": return value ? "" : "Leave type is required";
            case "description":
                if (!value.trim()) return "Description is required";
                if (value.trim().length < 10) return "Description must be at least 10 characters";
                return "";
            default: return "";
        }
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => ({ ...prev, [field]: true }));
        const newErrors = { ...errors, [field]: validateField(field, value) };
        if (field === "fromDate" && form.toDate) {
            newErrors.toDate = validateToDate(form.toDate, value);
        }
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors = {
            fromDate: validateFromDate(form.fromDate),
            toDate: validateToDate(form.toDate, form.fromDate),
            leaveType: form.leaveType ? "" : "Leave type is required",
            description: validateField("description", form.description)
        };
        setErrors(newErrors);
        setTouched({ fromDate: true, toDate: true, leaveType: true, description: true });
        return !Object.values(newErrors).some((e) => e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix all validation errors");
            return;
        }

        setSubmitting(true);
        const result = await applyLeaveApi(form);
        setSubmitting(false);

        if (result.status >= 200 && result.status < 300) {
            toast.success("Leave applied successfully!");
            setForm({ fromDate: "", toDate: "", leaveType: "", description: "" });
            setErrors({});
            setTouched({});
            onSuccess();
            onClose();
        } else {
            toast.error(result.data?.error || "Failed to apply leave");
        }
    };

    const handleClose = () => {
        setForm({ fromDate: "", toDate: "", leaveType: "", description: "" });
        setErrors({});
        setTouched({});
        onClose();
    };

    const renderField = (field, label, type = "text", options = null) => (
        <div className="mb-3" key={field}>
            <label className="form-label fw-bold">{label} <span className="text-danger">*</span></label>
            {options ? (
                <select
                    className={`form-select ${touched[field] && errors[field] ? "is-invalid" : ""}`}
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    style={{ borderRadius: "10px", padding: "12px" }}
                >
                    <option value="">Select Leave Type</option>
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === "textarea" ? (
                <textarea
                    className={`form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`}
                    rows={3}
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder="Enter leave description (min 10 characters)"
                    style={{ borderRadius: "10px", padding: "12px" }}
                />
            ) : (
                <input
                    type={type}
                    className={`form-control ${touched[field] && errors[field] ? "is-invalid" : ""}`}
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    style={{ borderRadius: "10px", padding: "12px" }}
                />
            )}
            {touched[field] && errors[field] && (
                <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
                    <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
                    {errors[field]}
                </div>
            )}
            {touched[field] && !errors[field] && form[field] && field !== "leaveType" && (
                <div className="text-success mt-1" style={{ fontSize: "13px" }}>
                    <FontAwesomeIcon icon={faCheck} className="me-1" /> Valid
                </div>
            )}
        </div>
    );

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Modal.Title><FontAwesomeIcon icon={faUserPlus} className="me-2" />Apply for Leave</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#f8f9fa", padding: "25px" }}>
                <form onSubmit={handleSubmit}>
                    <div className="row g-2">
                        <div className="col-6">{renderField("fromDate", "From Date", "date")}</div>
                        <div className="col-6">{renderField("toDate", "To Date", "date")}</div>
                    </div>
                    {renderField("leaveType", "Leave Type", "select", LEAVE_TYPES)}
                    {renderField("description", "Description", "textarea")}
                </form>
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: "#f8f9fa" }}>
                <Button variant="light" onClick={handleClose} style={{ borderRadius: "50px" }}>Cancel</Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || Object.values(errors).some((e) => e)}
                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "50px" }}
                >
                    {submitting ? "Applying..." : "Apply Leave"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LeaveForm;
