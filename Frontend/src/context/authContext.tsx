import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the type for the AuthContext's value
interface AuthContextType {
  authUser: string | null;
  setAuthUser: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthContextProvider");
  }
  return context;
};

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [authUser, setAuthUser] = useState<string | null>(() => {
    // Initialize state from localStorage
    const studentId = localStorage.getItem("studentId");
    const employerId = localStorage.getItem("employerId");
    return studentId || employerId || null;
  });

  // Persist authUser to localStorage whenever it changes
  useEffect(() => {
    if (authUser) {
      // Example: Check user type and store accordingly
      if (authUser.startsWith("student")) {
        localStorage.setItem("studentId", authUser);
        localStorage.removeItem("employerId");
      } else if (authUser.startsWith("employer")) {
        localStorage.setItem("employerId", authUser);
        localStorage.removeItem("studentId");
      }
    } else {
      // Clear all user data if logged out
      localStorage.removeItem("studentId");
      localStorage.removeItem("employerId");
    }
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
