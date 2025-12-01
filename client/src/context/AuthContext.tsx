import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BUYER' | 'SELLER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hydrate user on load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
    redirectUser(data.user.role);
  };

  const register = async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data.user);
    redirectUser(data.user.role);
  };

  const logout = async () => {
    await api.get('/auth/logout');
    setUser(null);
    navigate('/login');
  };

  const redirectUser = (role: string) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'SELLER') navigate('/seller');
    else navigate('/buyer');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
