import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath = user.role === "Manager" ? "/manager" : "/employee";
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
