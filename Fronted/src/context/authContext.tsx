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
  const [authUser, setAuthUser] = useState<string | null>(null);

  // Sync authUser with localStorage on component mount
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const employerId = localStorage.getItem("employerId");

    // Set the user from localStorage if available
    if (studentId) {
      setAuthUser(studentId);
    } else if (employerId) {
      setAuthUser(employerId);
    } else {
      setAuthUser(null);
    }
  }, []); // This runs only once when the component mounts

  // Debugging log to track if the state updates correctly
  useEffect(() => {
    console.log("authUser state updated:", authUser);
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
