import { createContext, useContext, useState } from "react";

// 1. Crear el contexto
const AuthContext = createContext();

// 2. Hook personalizado para consumir el contexto de forma sencilla
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// 3. Proveedor del contexto que envuelve la app
export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
