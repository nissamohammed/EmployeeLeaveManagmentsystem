import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";

const AppRoutes = () => {
    const { isAuthenticated, user } = useAuth();

    const getDefaultRoute = () => {
        if (!isAuthenticated) return "/login";
        return user.role === "Manager" ? "/manager" : "/employee";
    };

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />} />
            <Route path="/employee" element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                    <EmployeeDashboard />
                </ProtectedRoute>
            } />
            <Route path="/manager" element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                    <ManagerDashboard />
                </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
    );
};

export default AppRoutes;
