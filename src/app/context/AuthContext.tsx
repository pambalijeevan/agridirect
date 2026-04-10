import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
  location: string;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
  location: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'agridirect_users';
const PASSWORDS_STORAGE_KEY = 'agridirect_passwords';
const SESSION_STORAGE_KEY = 'agridirect_user';

// Default users database (simulating hashed passwords)
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'John Farmer',
    email: 'farmer@agridirect.com',
    phone: '+91 98765 43210',
    role: 'farmer',
    location: 'Punjab',
    active: true,
  },
  {
    id: '2',
    name: 'Sarah Buyer',
    email: 'buyer@agridirect.com',
    phone: '+91 91234 56789',
    companyName: 'Sarah Agro Foods',
    role: 'buyer',
    location: 'Delhi',
    active: true,
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@agridirect.com',
    phone: '+91 90000 00000',
    role: 'admin',
    location: 'Mumbai',
    active: true,
  },
];

// Default passwords (in real app, these would be hashed)
const defaultPasswords: Record<string, string> = {
  'farmer@agridirect.com': 'farmer123',
  'buyer@agridirect.com': 'buyer123',
  'admin@agridirect.com': 'admin123',
};

function loadUsers(): User[] {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return defaultUsers;
  try {
    const parsed = JSON.parse(stored) as User[];
    return parsed.map((user) => {
      const matchingDefault = defaultUsers.find((entry) => entry.id === user.id);
      return matchingDefault ? { ...matchingDefault, ...user } : user;
    });
  } catch {
    return defaultUsers;
  }
}

function loadPasswords(): Record<string, string> {
  const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
  if (!stored) return defaultPasswords;
  try {
    return JSON.parse(stored) as Record<string, string>;
  } catch {
    return defaultPasswords;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [passwords, setPasswords] = useState<Record<string, string>>(defaultPasswords);

  useEffect(() => {
    setUsers(loadUsers());
    setPasswords(loadPasswords());

    // Check for stored user session
    const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      const mergedUser = loadUsers().find((entry) => entry.id === parsedUser.id) || parsedUser;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mergedUser));
      setUser(mergedUser);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('agridirect-users-changed'));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  }, [passwords]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate password verification (in real app, would hash and compare)
    const storedPassword = passwords[email];
    
    if (!storedPassword) {
      return { success: false, error: 'User not found' };
    }

    if (storedPassword !== password) {
      return { success: false, error: 'Invalid password' };
    }

    const foundUser = users.find(u => u.email === email);
    
    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }

    if (!foundUser.active) {
      return { success: false, error: 'Account is deactivated. Please contact admin.' };
    }

    // Store user session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(foundUser));
    setUser(foundUser);
    
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: User = {
      id: String(users.length + 1),
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.role === 'buyer' ? data.companyName || data.name : undefined,
      role: data.role,
      location: data.location,
      active: true,
    };

    // Add to local database
    setUsers((prev) => [...prev, newUser]);
    setPasswords((prev) => ({ ...prev, [data.email]: data.password }));

    // Auto-login after registration
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
