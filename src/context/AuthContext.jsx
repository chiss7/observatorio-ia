import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, roles }
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      // Validar token llamando a /api/me (recomendado)
      api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setUser(res.data); // { username, roles }
        })
        .catch(() => {
          logout(); // Token inválido → logout
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);

      // Obtener datos del usuario inmediatamente
      const meRes = await api.get('/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(meRes.data);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (credentials) => {
    try {
      await api.post('/auth/register', credentials);
      return true;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated, 
      isAdmin, 
      login, 
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};