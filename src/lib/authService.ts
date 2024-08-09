import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';

const getToken = () => {
  return Cookies.get('token');
};

const getUserRole = () => {
  const token = getToken();
  if (token) {
    const payload = jwtDecode<{ role: string }>(token);
    return payload.role;
  }
  return null;
};

const isLoggedIn = () => {
  const token = getToken();
  if (token) {
    const payload = jwtDecode<{ exp: number }>(token);
    return Date.now() < payload.exp * 1000;
  }
  return false;
};

const logout = () => {
  Cookies.remove('token');
};

export const authService = {
  getToken,
  getUserRole,
  isLoggedIn,
  logout,
};
