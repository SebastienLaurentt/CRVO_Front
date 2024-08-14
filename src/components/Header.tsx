import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Header = () => {
  const { role, logout } = useAuth(); // Assurez-vous que useAuth retourne user avec le rôle

  const handleLogout = async () => {
    logout();
  };

  return (
    <header className="max-w-7xl px-4 mx-auto w-full flex justify-between items-center py-4">
      <img src={CRVOLogo} alt="Logo CRVO" className="w-40" />
      <div className="flex items-center gap-4">
        {role === "admin" && (
          <Button asChild>
            <Link to="/" aria-label="Revenir à l'accueil">
              Tableau de Bord
            </Link>
          </Button>
        )}
        <Button asChild onClick={handleLogout} variant="destructive">
          <Link to="/" aria-label="Se déconnecter de l'espace administrateur">
            Déconnexion
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
