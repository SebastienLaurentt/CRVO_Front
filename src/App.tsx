import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import Users from "./pages/Admin/Users";
import CompletedDashboard from "./pages/CompletedDashboard";
import Login from "./pages/Login";
import OngoingDashboard from "./pages/OngoingDashboard";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OngoingDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CompletedDashboard />
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
