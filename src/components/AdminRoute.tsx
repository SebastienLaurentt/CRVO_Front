import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLogged, role } = useAuth();
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (role !== "admin") {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
};

export default AdminRoute;
