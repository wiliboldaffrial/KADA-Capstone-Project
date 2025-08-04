import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import AppHeader from "./AppHeader";
import SideBarItem from "./SideBarItem";
import LogoutModal from "./LogoutModal";
import { useUser } from "../UserContext";
import { useSideBar } from "../SideBarContext"; // Import the custom hook

const SideBar = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // Use the SideBarContext to get the state and function
  const { isCollapsed, toggleSideBar } = useSideBar();

  // Get user data from context
  const { userName, userRole, loading } = useUser();

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
    "doctor": [
      { path: "/doctor/patients/", label: "Patient List", iconType: "patientlist" },
    ],
    "nurse": [{ path: "/nurse/patientList", label: "Patient List", iconType: "patientlist" }],
  };

  // Normalize the user role to match the keys in roleBasedLinks
  const normalizedRole = userRole?.toLowerCase() === "admin" ? "admin/receptionist" : userRole?.toLowerCase();
  const linksToShow = [...commonLinks, ...(roleBasedLinks[normalizedRole] || [])];

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-blue-800 text-white transition-all duration-300 h-screen flex flex-col fixed left-0 top-0`}>
        <button onClick={toggleSideBar} className="absolute top-4 right-[-12px] w-6 h-6 flex items-center justify-center bg-white text-blue-800 rounded-full shadow hover:bg-gray-200 transition">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="mt-6 px-2 flex-grow">
          <div className="flex justify-center items-center mb-2">
            <h2 className="text-white text-sm">
              <AppHeader mode="sidebar" />
            </h2>
          </div>
          <ul className="space-y-2">
            {linksToShow.map((item) => (
              <SideBarItem key={item.path} path={item.path} label={item.label} iconType={item.iconType} />
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <img className="w-8 h-8 rounded-full border border-white object-cover flex-shrink-0" alt="User" />
              {!isCollapsed && (
                <div className="text-white text-sm truncate">
                  <p className="font-semibold">{userName || "Loading..."}</p>
                  <p className="text-xs text-gray-300 capitalize">{userRole}</p>
                </div>
              )}
            </div>
            <button onClick={() => setModalOpen(true)} className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors" aria-label="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      <LogoutModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
};

export default SideBar;
