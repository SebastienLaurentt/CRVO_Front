import { Route, Routes, useLocation } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AdminRoute from "./components/AdminRoute";

const App = () => {
  const location = useLocation();
  const hideHeaderAndFooter = location.pathname === "/login";

  return (
    <>
      {!hideHeaderAndFooter && <Header />}

      <main className="w-full min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
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
      </main>

      {!hideHeaderAndFooter && <Footer />}
    </>
  );
};

export default App;
