import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import CRVOLogo from "/public/images/CRVOLogo.png";

const Header = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <header className="max-w-7xl px-4 mx-auto w-full flex justify-between items-center bg-white py-4 border-b border-b-[#e6ebf4]">
      <img src={CRVOLogo} alt="Logo CRVO" className="w-24 text-white" />
      <Button asChild onClick={handleLogout} variant="destructive">
        <Link to="/" aria-label="Se déconnecter de l'espace administrateur">
          Déconnexion
        </Link>
      </Button>
    </header>
  );
};

export default Header;
