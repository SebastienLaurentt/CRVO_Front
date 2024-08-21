import { useAuth } from "@/lib/auth";
import { ArrowRightToLine, BookText, LoaderCircle, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Nav = () => {
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <nav className="px-4 2xl:px-12 w-[240px] 2xl:w-[360px] flex flex-col h-[600px] justify-between">
      <div>
        <img src={CRVOLogo} alt="Logo CRVO" className="w-full mb-12" />
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-slate-700 font-semibold mb-1">Véhicules</span>
            <div className="space-y-1">
              <NavLink
                to="/"
                aria-label="Revenir à l'accueil"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold  p-2 rounded-md hover:bg-slate-950 hover:text-slate-50 ${
                    isActive ? "bg-slate-900 text-slate-50" : ""
                  }`
                }
              >
                <LoaderCircle size={24} />
                <span>Véhicules En Cours</span>
              </NavLink>

              <NavLink
                to="/completed"
                aria-label="Terminé"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold p-2  rounded-md hover:bg-slate-950 hover:text-slate-50 ${
                    isActive ? "bg-slate-900 text-slate-50" : ""
                  }`
                }
              >
                <ArrowRightToLine size={24} />
                <span>Véhicules Terminés</span>
              </NavLink>
            </div>
          </div>
          {role === "admin" && (
            <>
              <span className="text-slate-700 font-semibold mb-1">Clients</span>
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
              <span className="text-slate-700 font-semibold mb-1">Documents</span>
              <Button className="space-x-[5px]" asChild>
                <Link to="https://facturation.crvo.fr/" target="_blank">
                  <BookText size={20} />
                  <span>Factures</span>
                </Link>
              </Button>
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
