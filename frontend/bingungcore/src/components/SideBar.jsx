import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Hospital, Icon } from "lucide-react";
import AppHeader from "./AppHeader";
import SideBarItem from "./SideBarItem";
import LogoutModal from "./LogoutModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios"; // <-- NEW: Import axios

const SideBar = ({ isCollapsed, toggleSideBar }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const role = localStorage.getItem("role")?.toLowerCase();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("User");

  // Helper function to get authentication headers from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setModalOpen(false);
    navigate("/");
  };

  const commonLinks = [
    { path: "/dashboard", label: "Dashboard", iconType: "dashboard" },
    { path: "/announcement", label: "Announcement", iconType: "announcement" },
  ];

  const roleBasedLinks = {
    "admin/receptionist": [
      { path: "/admin/patientManagement", label: "Patient Management", iconType: "patientlist" },
      { path: "/admin/appointmentSchedule", label: "Appointment Schedule", iconType: "appoinment" },
      { path: "/admin/roomManagement", label: "Room Management", iconType: "room" },
    ],
    doctor: [{ path: "/doctor/patientCheckup/:id", label: "Patient List" }],
    nurse: [{ path: "/nurse/patientList", label: "Patient List", iconType: "patientlist" }],
  };

  const linksToShow = [...commonLinks, ...(roleBasedLinks[role] || [])];

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.id; // <-- Get the user ID from the token

          // Make a new API call to get the user's profile
          const res = await axios.get(`http://localhost:5000/api/users/${userId}`, getAuthHeaders());

          console.log("API response for user data:", res.data);
          // Assuming the profile data has a 'name' property
          if (res.data && res.data.name) {
            setUserName(res.data.name);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // If the API call fails, we will stick with the default "User" placeholder
        }
      }
      if (!role) {
        navigate("/");
      }
    };

    fetchUserName();
  }, [role, navigate]);

  return (
    <>
      <div className="flex min-h-screen">
        <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-blue-800 text-white transition-all duration-300 h-screen flex flex-col fixed left-0 top-0`}>
          <button onClick={toggleSideBar} className="absolute top-4 right-[-12px] w-6 h-6 flex items-center justify-center bg-white text-blue-800 rounded-full shadow hover:bg-gray-200 transition">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <nav className="mt-6 px-2 flex-grow">
            <div className="flex justify-center items-center mb-2">
              <h2 className="text-white text-sm">
                <AppHeader mode="sidebar" isCollapsed={isCollapsed} />
              </h2>
            </div>
            <ul className="space-y-2">
              {linksToShow.map((item) => (
                <SideBarItem key={item.path} path={item.path} label={item.label} iconType={item.iconType} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </nav>

          <div className="mt-auto p-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <img className="w-8 h-8 rounded-full border border-white object-cover flex-shrink-0" alt="User" />
                {!isCollapsed && (
                  <div className="text-white text-sm truncate">
                    <p className="font-semibold">{userName}</p>
                    <p className="text-xs text-gray-300 capitalize">{role}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setModalOpen(true)} className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors" aria-label="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </aside>
      </div>
      <LogoutModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
};

export default SideBar;
