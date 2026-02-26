"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { User } from "./types";
import { users } from "./data";

interface UserContextType {
  currentUser: User | null;
  selectUser: (userId: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  selectUser: () => {},
  clearUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("impact360_persona");
      if (saved) {
        const found = users.find((u) => u.id === saved);
        if (found) return found;
      }
    }
    return null;
  });

  const selectUser = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("impact360_persona", userId);
    }
  }, []);

  const clearUser = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("impact360_persona");
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, selectUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
