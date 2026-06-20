import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./hooks/useAuth";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
            />
        </AuthProvider>
    );
}

export default App;
