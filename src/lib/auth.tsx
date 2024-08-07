
import { createContext, useContext, useState } from 'react';
import { ReactNode } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isLogged: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(Cookies.get('isLogged') === 'true');

  const login = () => {
    setIsLogged(true);
    Cookies.set('isLogged', 'true', { expires: 1/24 });
  };

  const logout = () => {
    setIsLogged(false);
    Cookies.remove('isLogged');
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{ isLogged, login, logout }}>
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

