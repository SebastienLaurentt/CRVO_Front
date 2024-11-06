import { useAuth } from "@/lib/auth";
import { BookText, ChartNoAxesCombined, Drill, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Nav = () => {
  const { role, logout, downloadUrl } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <nav className="flex h-[600px] w-[240px] flex-col justify-between px-4 2xl:w-[360px] 2xl:px-12">
      <div>
        <img src={CRVOLogo} alt="Logo CRVO" className="mb-12 w-full" />
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="mb-1 font-semibold text-slate-700">
              Rénovations
            </span>
            <div className="space-y-1">
              <NavLink
                to="/"
                aria-label="Revenir à la liste des rénovations"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold p-2 rounded-md hover:bg-slate-950 hover:text-slate-50 ${
                    isActive ? "bg-slate-900 text-slate-50" : ""
                  }`
                }
              >
                <Drill size={24} />
                <span>Liste Rénovations</span>
              </NavLink>
            </div>
          </div>
          {role === "admin" && (
            <div className="mb-6">
              <span className="mb-1 font-semibold text-slate-700">Data</span>
              <NavLink
                to="/data"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold  p-2 rounded-md hover:bg-slate-950 hover:text-slate-50 ${
                    isActive ? "bg-slate-900 text-slate-50" : ""
                  }`
                }
              >
                <ChartNoAxesCombined size={24} />
                <span>Graphiques</span>
              </NavLink>
            </div>
          )}
          {role === "admin" && (
            <>
              <span className="mb-1 font-semibold text-slate-700">Clients</span>
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold  p-2 rounded-md hover:bg-slate-950 hover:text-slate-50 ${
                    isActive ? "bg-slate-900 text-slate-50" : ""
                  }`
                }
              >
                <User size={24} strokeWidth={2} />
                <span>Informations</span>
              </NavLink>
            </>
          )}
          {role === "member" && (
            <>
              <span className="mb-1 font-semibold text-slate-700">
                Documents
              </span>
              <div className="flex flex-col gap-y-1">
                <Button className="space-x-[5px]" asChild>
                  <Link to="https://facturation.crvo.fr/" target="_blank">
                    <BookText size={20} />
                    <span>Factures</span>
                  </Link>
                </Button>
                <Button className="space-x-[5px]" asChild>
                  <a href={downloadUrl || ""} download target="_blank">
                    <BookText size={20} />
                    <span>Graphiques</span>
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Button asChild onClick={handleLogout} variant="destructive">
        <NavLink to="/" aria-label="Se déconnecter de l'espace administrateur">
          Déconnexion
        </NavLink>
      </Button>
    </nav>
  );
};

export default Nav;
