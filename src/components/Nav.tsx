import { useAuth } from "@/lib/auth";
import { ArrowRightToLine, LoaderCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Nav = () => {
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <nav className="px-4 h-[600px] w-[300px] flex flex-col justify-between">
      <div>
        <img src={CRVOLogo} alt="Logo CRVO" className="w-full mb-8" />
        <div className="flex flex-col">
          {role === "admin" && (
            <>
              <div className="mb-4">
                <span className="text-slate-700 font-semibold mb-1">
                  Véhicules
                </span>

                <NavLink
                  to="/"
                  aria-label="Revenir à l'accueil"
                  className={({ isActive }) =>
                    `flex flex-row gap-x-2 items-center font-bold p-2 rounded-md hover:bg-primary ${
                      isActive ? "bg-primary" : ""
                    }`
                  }
                >
                  <LoaderCircle size={24} />
                  <span>En Cours</span>
                </NavLink>

                <NavLink
                  to="/completed"
                  aria-label="Terminé"
                  className={({ isActive }) =>
                    `flex flex-row gap-x-2 items-center font-bold p-2 rounded-md hover:bg-primary ${
                      isActive ? "bg-primary" : ""
                    }`
                  }
                >
                  <ArrowRightToLine size={24} />
                  <span>Terminé</span>
                </NavLink>
              </div>
              <span className="text-slate-700 font-semibold mb-1">
                Clients
              </span>
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  `flex flex-row gap-x-2 items-center font-bold p-2 rounded-md hover:bg-primary ${
                    isActive ? "bg-primary" : ""
                  }`
                }
              >
                <User size={24} strokeWidth={2} />
                <span>Infos</span>
              </NavLink>
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
