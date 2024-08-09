import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from './authService';


interface AuthContextType {
  isLogged: boolean;
  role: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(authService.isLoggedIn());
  const [role, setRole] = useState<string | null>(authService.getUserRole());

  useEffect(() => {
    if (isLogged) {
      setRole(authService.getUserRole());
    } else {
      setRole(null);
    }
  }, [isLogged]);

  const login = () => {
    setIsLogged(true);
    setRole(authService.getUserRole());
  };

  const logout = () => {
    authService.logout();
    setIsLogged(false);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLogged, role, login, logout }}>
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
