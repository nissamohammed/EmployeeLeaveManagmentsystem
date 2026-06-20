import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle, faTimesCircle, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

const StatsCards = ({ stats }) => {
    const cards = [
        { title: "Total Requests", value: stats.total, icon: faCalendarCheck, color: "#3498db", bg: "#d6eaf8" },
        { title: "Pending", value: stats.pending, icon: faClock, color: "#f39c12", bg: "#fdebd0" },
        { title: "Approved", value: stats.approved, icon: faCheckCircle, color: "#27ae60", bg: "#d5f5e3" },
        { title: "Rejected", value: stats.rejected, icon: faTimesCircle, color: "#e74c3c", bg: "#fadbd8" }
    ];

    return (
        <div className="row g-3 mb-4">
            {cards.map((card) => (
                <div className="col-md-3 col-sm-6" key={card.title}>
                    <div className="card shadow-sm h-100" style={{ border: "none", borderRadius: "15px" }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="text-muted mb-2" style={{ fontSize: "14px", fontWeight: "600" }}>{card.title}</h6>
                                    <h3 className="mb-0 fw-bold" style={{ color: "#2c3e50" }}>{card.value}</h3>
                                </div>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "50px", height: "50px", backgroundColor: card.bg, color: card.color, fontSize: "20px" }}
                                >
                                    <FontAwesomeIcon icon={card.icon} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
