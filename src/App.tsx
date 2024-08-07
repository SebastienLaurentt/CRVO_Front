
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { BrowserRouter, Route, Routes } from "react-router-dom";


const App = () => (
  <>
    <BrowserRouter>
      <header className="max-w-7xl px-4 mx-auto w-full flex justify-between items-center bg-white  py-4 border-b border-b-[#e6ebf4]">
        CRVO
      </header>
      <main className="sm:p-8 px-2 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <footer className="flex flex-col gap-y-2 items-center w-full bg-white sm:px-8 px-4 py-4 border-t border-b-[#e6ebf4]">
        CRVO
      </footer>
    </BrowserRouter>
  </>
);

export default App;
