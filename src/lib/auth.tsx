import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from './authService';

interface AuthContextType {
  isLogged: boolean;
  role: string | null;
  downloadUrl: string | null; // Ajoutez cette ligne
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(authService.isLoggedIn());
  const [role, setRole] = useState<string | null>(authService.getUserRole());
  const [downloadUrl, setDownloadUrl] = useState<string | null>(authService.getDownloadUrl()); // Ajoutez cette ligne

  useEffect(() => {
    if (isLogged) {
      setRole(authService.getUserRole());
      setDownloadUrl(authService.getDownloadUrl()); 
    } else {
      setRole(null);
      setDownloadUrl(null); 
    }
  }, [isLogged]);

  const login = () => {
    setIsLogged(true);
    setRole(authService.getUserRole());
    setDownloadUrl(authService.getDownloadUrl()); 
  };

  const logout = () => {
    authService.logout();
    setIsLogged(false);
    setRole(null);
    setDownloadUrl(null); 
  };

  return (
    <AuthContext.Provider value={{ isLogged, role, downloadUrl, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
