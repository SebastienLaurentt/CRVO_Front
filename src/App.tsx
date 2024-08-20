import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./lib/auth";
import AdminCompleted from "./pages/Admin/AdminCompleted";
import AdminOngoing from "./pages/Admin/AdminOngoing";
import Users from "./pages/Admin/Users";
import Login from "./pages/Login";
import MemberCompleted from "./pages/Members/MemberCompleted";
import MemberOngoing from "./pages/Members/MemberOngoing";

const App = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {role === "admin" && <AdminOngoing />}
                {role === "member" && <MemberOngoing />}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {role === "admin" && <AdminCompleted />}
                {role === "member" && <MemberCompleted />}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <AdminRoute>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </AdminRoute>
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
