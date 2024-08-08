import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/ui/Footer";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const App = () => {
  const location = useLocation();
  const hideHeaderAndFooter = location.pathname === "/login";

  return (
    <>
      {!hideHeaderAndFooter && <Header />}

      <main className="px-2 w-full bg-[#f9fafe] min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!hideHeaderAndFooter && <Footer />}
    </>
  );
};

export default App;
