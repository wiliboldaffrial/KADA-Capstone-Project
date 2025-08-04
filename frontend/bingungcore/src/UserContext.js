import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Create a new context
const UserContext = createContext();

// Custom hook
export const useUser = () => useContext(UserContext);

// Provider
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

  // Fetch user data from the backend
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
          setUserRole(role === 'admin' ? 'admin/receptionist' : role);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserName(null);
        setUserRole(null);
      }
    } else {
      setUserName(null);
      setUserRole(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    userName,
    userRole,
    loading,
    refetchUserData: fetchUserData, // Expose a method to refetch user data
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
