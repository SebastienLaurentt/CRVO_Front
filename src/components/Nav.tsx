import { useAuth } from "@/lib/auth";
import { ArrowRightToLine, LoaderCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Nav = () => {
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <nav className="py-8 px-4 border rounded-lg shadow-2xl h-[600px] w-[300px] flex flex-col justify-between">
      <div>
        <img src={CRVOLogo} alt="Logo CRVO" className="w-full mb-8" />
        <div className="flex flex-col gap-4">
          {role === "admin" && (
            <div className="flex flex-col gap-4">
              <Button asChild className="space-x-[8px]">
                <Link to="/" aria-label="Revenir à l'accueil">
                  <LoaderCircle size={20} />
                  <span>En Cours</span>
                </Link>
              </Button>
              <Button asChild className="space-x-[8px]">
                <Link to="/completed" aria-label="Terminé">
                  <ArrowRightToLine size={20} />
                  <span>Terminé</span>
                </Link>
              </Button>
              <Button className="space-x-[8px]" asChild>
                <Link to="/clients">
                  <User size={20} />
                  <span>Infos Client</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <Button asChild onClick={handleLogout} variant="destructive">
        <Link to="/" aria-label="Se déconnecter de l'espace administrateur">
          Déconnexion
        </Link>
      </Button>
    </nav>
  );
};

export default Nav;