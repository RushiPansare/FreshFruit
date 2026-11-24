import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access'));
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const { data } = await api.get('cart/');
      setCartCount(data.length);
    } catch (e) {}
  };

  const login = (access) => {
    localStorage.setItem('access', access);
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem('access');
    setToken(null);
    setUser(null);
    setCartCount(0);
  };

  useEffect(() => {
    if (token) {
      api.get('auth/profile/').then((r) => setUser(r.data)).catch(() => logout());
      refreshCart();
    }
  }, [token]);

  return (
       <Ctx.Provider value={{ token, user, setUser, cartCount, refreshCart, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}