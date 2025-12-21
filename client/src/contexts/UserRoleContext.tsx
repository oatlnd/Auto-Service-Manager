import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { USER_ROLES } from "@shared/schema";

type UserRole = typeof USER_ROLES[number];

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canViewRevenue: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem("userRole");
    if (stored && USER_ROLES.includes(stored as UserRole)) {
      return stored as UserRole;
    }
    return "Admin";
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
  };

  useEffect(() => {
    localStorage.setItem("userRole", role);
  }, [role]);

  const canViewRevenue = role === "Admin" || role === "Manager";
  const isAdmin = role === "Admin";
  const isManager = role === "Manager";

  return (
    <UserRoleContext.Provider value={{ role, setRole, canViewRevenue, isAdmin, isManager }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}
