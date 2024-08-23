import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from "./lib/auth";
import AdminCompleted from "./pages/Admin/AdminCompleted";
import AdminData from "./pages/Admin/AdminData";
import AdminOngoing from "./pages/Admin/AdminOngoing";
import Users from "./pages/Admin/Users";
import Login from "./pages/Login";
import MemberCompleted from "./pages/Members/MemberCompleted";
import MemberOngoing from "./pages/Members/MemberOngoing";
import CRVOLogo from "/public/images/CRVOLogo.png";

const App = () => {
  const { role } = useAuth();

  return (
    <>
      <div className="hidden min-h-screen flex-col bg-background xl:flex">
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
            path="/data"
            element={
              <AdminRoute>
                <DashboardLayout>
                  <AdminData />
                </DashboardLayout>
              </AdminRoute>
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
      <div className="flex min-h-screen flex-col items-center justify-center xl:hidden">
        <span className="text-center text-md md:text-lg">
          Pour une expérience optimale, <br /> veuillez utiliser votre
          ordinateur !
        </span>
        <img src={CRVOLogo} alt="Logo CRVO" className="mt-12 w-64 md:w-96" />
      </div>
    </>
  );
};

export default App;
