import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function getSafeUser() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (u && u.name && u.email && u.role) return u;
    localStorage.clear();
    return null;
  } catch {
    localStorage.clear();
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSafeUser);

  function login(userData, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
