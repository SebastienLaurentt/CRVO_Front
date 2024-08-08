
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';

import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isLogged } = useAuth();

  if (!isLogged) {

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
