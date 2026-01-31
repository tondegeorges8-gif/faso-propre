import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profilePhoto?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateProfilePhoto: (photoUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('faso_propre_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulated authentication - in production, this would call an API
    const savedUsers = JSON.parse(localStorage.getItem('faso_propre_users') || '[]');
    const foundUser = savedUsers.find((u: User & { password: string }) => 
      u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('faso_propre_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('faso_propre_users') || '[]');
    
    // Check if email already exists
    if (savedUsers.some((u: User) => u.email === userData.email)) {
      return false;
    }

    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    savedUsers.push(newUser);
    localStorage.setItem('faso_propre_users', JSON.stringify(savedUsers));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('faso_propre_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('faso_propre_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('faso_propre_user', JSON.stringify(updatedUser));
      
      // Also update in users list
      const savedUsers = JSON.parse(localStorage.getItem('faso_propre_users') || '[]');
      const userIndex = savedUsers.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        savedUsers[userIndex] = { ...savedUsers[userIndex], ...updates };
        localStorage.setItem('faso_propre_users', JSON.stringify(savedUsers));
      }
    }
  };

  const updateProfilePhoto = (photoUrl: string) => {
    updateProfile({ profilePhoto: photoUrl });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      updateProfilePhoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
