import { Route, Routes, useLocation } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminRoute from "./components/AdminRoute";
import { Toaster } from "./components/ui/toaster";
import CompletedDashboard from "./pages/CompletedDashboard";
import Login from "./pages/Login";
import { default as OngoingDashboard } from "./pages/OngoingDashboard";
import Users from "./pages/Users";

const App = () => {
  const location = useLocation();
  const hideHeaderAndFooter = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderAndFooter && <Header />}

      <main className="w-full flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OngoingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed"
            element={
              <ProtectedRoute>
                <CompletedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
        </Routes>
        <Toaster />
      </main>

      {!hideHeaderAndFooter && <Footer />}
    </div>
  );
};

export default App;
