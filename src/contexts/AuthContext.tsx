'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  lastSync: number;
  sync: () => void;
}

const AuthContext = createContext<AuthContextType>({
  lastSync: 0,
  sync: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [lastSync, setLastSync] = useState(0);

  const sync = useCallback(() => {
    setLastSync((prev) => prev + 1);
  }, []);

  return (
    <AuthContext.Provider value={{ lastSync, sync }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

export function useAuth() {
  return useContext(AuthContext);
}
