"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { User, ActiveContext } from "./types";
import { users } from "./data";
import { getDefaultContext } from "./permissions";

interface UserContextType {
  currentUser: User | null;
  activeContext: ActiveContext | null;
  selectUser: (userId: string) => void;
  setActiveContext: (context: ActiveContext) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  activeContext: null,
  selectUser: () => {},
  setActiveContext: () => {},
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

  const [activeContext, setActiveContextState] = useState<ActiveContext | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("impact360_context");
      if (saved) {
        try {
          return JSON.parse(saved) as ActiveContext;
        } catch {
          // ignore
        }
      }
      // Compute default from saved persona
      const personaId = localStorage.getItem("impact360_persona");
      if (personaId) {
        const found = users.find((u) => u.id === personaId);
        if (found) return getDefaultContext(found);
      }
    }
    return null;
  });

  const setActiveContext = useCallback((context: ActiveContext) => {
    setActiveContextState(context);
    localStorage.setItem("impact360_context", JSON.stringify(context));
  }, []);

  const selectUser = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("impact360_persona", userId);
      // Reset context to user's default
      const defaultCtx = getDefaultContext(user);
      setActiveContextState(defaultCtx);
      localStorage.setItem("impact360_context", JSON.stringify(defaultCtx));
    }
  }, []);

  const clearUser = useCallback(() => {
    setCurrentUser(null);
    setActiveContextState(null);
    localStorage.removeItem("impact360_persona");
    localStorage.removeItem("impact360_context");
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, activeContext, selectUser, setActiveContext, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
