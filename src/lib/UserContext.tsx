"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from "react";
import { User, ActiveContext } from "./types";
import { users } from "./data";
import { getDefaultContext } from "./permissions";

interface UserContextType {
  isHydrated: boolean;
  currentUser: User | null;
  activeContext: ActiveContext | null;
  selectUser: (userId: string) => void;
  setActiveContext: (context: ActiveContext) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType>({
  isHydrated: false,
  currentUser: null,
  activeContext: null,
  selectUser: () => {},
  setActiveContext: () => {},
  clearUser: () => {},
});

const SESSION_EVENT = "impact360-session-change";
let cachedSessionKey: string | null = null;
let cachedSessionSnapshot: Pick<UserContextType, "isHydrated" | "currentUser" | "activeContext"> | null = null;

function readSessionFromStorage(): Pick<UserContextType, "isHydrated" | "currentUser" | "activeContext"> {
  if (typeof window === "undefined") {
    return { isHydrated: false, currentUser: null, activeContext: null };
  }

  const savedPersonaId = localStorage.getItem("impact360_persona");
  const savedContext = localStorage.getItem("impact360_context");
  const currentUser = savedPersonaId ? users.find((user) => user.id === savedPersonaId) ?? null : null;

  let snapshot: Pick<UserContextType, "isHydrated" | "currentUser" | "activeContext">;

  if (savedContext) {
    try {
      snapshot = {
        isHydrated: true,
        currentUser,
        activeContext: JSON.parse(savedContext) as ActiveContext,
      };
    } catch {
      // ignore invalid stored context and fall back to the default
    }
  }

  snapshot ??= {
    isHydrated: true,
    currentUser,
    activeContext: currentUser ? getDefaultContext(currentUser) : null,
  };

  const nextKey = JSON.stringify({
    currentUserId: snapshot.currentUser?.id ?? null,
    activeContext: snapshot.activeContext,
    isHydrated: snapshot.isHydrated,
  });

  if (cachedSessionSnapshot && cachedSessionKey === nextKey) {
    return cachedSessionSnapshot;
  }

  cachedSessionKey = nextKey;
  cachedSessionSnapshot = snapshot;
  return snapshot;
}

function getServerSnapshot(): Pick<UserContextType, "isHydrated" | "currentUser" | "activeContext"> {
  return { isHydrated: false, currentUser: null, activeContext: null };
}

function subscribeToSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const notify = () => callback();
  window.addEventListener("storage", notify);
  window.addEventListener(SESSION_EVENT, notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(SESSION_EVENT, notify);
  };
}

function emitSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { isHydrated, currentUser, activeContext } = useSyncExternalStore(
    subscribeToSession,
    readSessionFromStorage,
    getServerSnapshot,
  );

  const setActiveContext = useCallback((context: ActiveContext) => {
    localStorage.setItem("impact360_context", JSON.stringify(context));
    emitSessionChange();
  }, []);

  const selectUser = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      localStorage.setItem("impact360_persona", userId);
      const defaultCtx = getDefaultContext(user);
      localStorage.setItem("impact360_context", JSON.stringify(defaultCtx));
      emitSessionChange();
    }
  }, []);

  const clearUser = useCallback(() => {
    localStorage.removeItem("impact360_persona");
    localStorage.removeItem("impact360_context");
    emitSessionChange();
  }, []);

  return (
    <UserContext.Provider value={{ isHydrated, currentUser, activeContext, selectUser, setActiveContext, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
