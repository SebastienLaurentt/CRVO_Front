import { Route, Routes, useLocation } from "react-router-dom";

import Admin from "./pages/Admin";
import Login from "./pages/Login";

const App = () => {
  const location = useLocation();

  const hideHeaderAndFooter = location.pathname === '/login';

  return (
    <>
      {!hideHeaderAndFooter && (
        <header className="max-w-7xl px-4 mx-auto w-full flex justify-between items-center bg-white py-4 border-b border-b-[#e6ebf4]">
          CRVO
        </header>
      )}

      <main className=" px-2  w-full bg-[#f9fafe] min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {!hideHeaderAndFooter && (
        <footer className="flex flex-col gap-y-2 items-center w-full bg-white sm:px-8 px-4 py-4 border-t border-b-[#e6ebf4]">
          CRVO
        </footer>
      )}
    </>
  );
};

export default App;
