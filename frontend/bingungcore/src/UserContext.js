import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Create a new context
const UserContext = createContext();

// Create a custom hook to use the context
export const useUser = () => useContext(UserContext);

// Create the provider component
export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role")?.toLowerCase();

      if (token && role) {
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.id;

          const res = await axios.get(`http://localhost:5000/api/users/${userId}`, getAuthHeaders());

          if (res.data && res.data.name) {
            setUserName(res.data.name);
            setUserRole(role);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
      setLoading(false); // Data fetching is complete (or failed)
    };

    fetchUserData();
  }, []);

  const value = {
    userName,
    userRole,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
