import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Hospital, Icon } from "lucide-react";
import AppHeader from "./AppHeader";
import SideBarItem from "./SideBarItem";
import LogoutModal from "./LogoutModal";

// src/components/SideBar.jsx

const SideBar = ({ isCollapsed, toggleSideBar }) => {
  const [isModalOpen, setModalOpen] = useState(false); // State for modal visibility
  const role = localStorage.getItem("role")?.toLowerCase();
  const navigate = useNavigate();

  // This function will now be called by the modal's confirmation button
  const handleLogout = () => {
    localStorage.removeItem("role");
    // Also remove the JWT token if you have one
    localStorage.removeItem("token");
    setModalOpen(false); // Close the modal
    navigate("/"); // Redirect to login/home
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
    nurse: [{ path: "/patientList", label: "Patient List" }],
  };

  const linksToShow = [...commonLinks, ...(roleBasedLinks[role] || [])];

  React.useEffect(() => {
    if (!role) {
      navigate("/");
    }
  }, [role, navigate]);

  return (
    <>
      <div className="flex min-h-screen">
        <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-blue-800 text-white transition-all duration-300 h-screen flex flex-col fixed left-0 top-0`}>
          <button onClick={toggleSideBar} className="absolute top-4 right-[-12px] w-6 h-6 flex items-center justify-center bg-white text-blue-800 rounded-full shadow hover:bg-gray-200 transition">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <nav className="mt-6 px-2 flex-grow">
            {/* MediLink Logo */}
            <div className="flex justify-center items-center mb-2">
              <h2 className="text-white text-sm">
                <AppHeader mode="sidebar" isCollapsed={isCollapsed} />
              </h2>
            </div>

            {/* Pages */}
            <ul className="space-y-2">
              {linksToShow.map((item) => (
                <SideBarItem key={item.path} path={item.path} label={item.label} iconType={item.iconType} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </nav>

          {/* Profile and logout button */}
          <div className="mt-auto p-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <img className="w-8 h-8 rounded-full border border-white object-cover flex-shrink-0" alt="User" />
                {!isCollapsed && (
                  <div className="text-white text-sm truncate">
                    <p className="font-semibold">Username</p>
                    <p className="text-xs text-gray-300 capitalize">{role}</p>
                  </div>
                )}
              </div>

              {/* MODIFIED: Logout button now opens the modal */}
              <button onClick={() => setModalOpen(true)} className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors" aria-label="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* RENDER THE MODAL HERE */}
      <LogoutModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
};

export default SideBar;
