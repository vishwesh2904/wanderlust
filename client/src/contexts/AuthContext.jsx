import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.auth
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    setUser(data.user);
    return data;
  };

  const signup = async (credentials) => {
    const data = await api.auth.signup(credentials);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const upgradeToHost = async () => {
    const data = await api.auth.upgradeToHost();
    setUser((prev) => ({ ...prev, role: 'host' }));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, upgradeToHost }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
