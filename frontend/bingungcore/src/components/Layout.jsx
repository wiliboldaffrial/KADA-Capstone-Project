import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useSideBar } from "../SideBarContext";

const Layout = ({ bgClass = "bg-gray-100" }) => {
  const { isCollapsed, toggleSideBar } = useSideBar();

  return (
    <div className={`flex min-h-screen ${bgClass}`}>
      {/* Sidebar for desktop & tablet */}
      <div className="hidden sm:block">
        <SideBar />
      </div>

      {/* Mobile overlay sidebar */}
      {/* Backdrop */}
      <div
        className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          !isCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSideBar}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Sidebar content */}
      <div
        className={`sm:hidden fixed top-0 left-0 z-50 w-64 h-full bg-blue-800 transform transition-transform duration-300 ${
          !isCollapsed ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SideBar />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 p-6 ${
          isCollapsed ? "sm:ml-16" : "sm:ml-64"
        }`}
      >
        {/* Mobile menu button */}
        <div className="sm:hidden mb-4">
          <button
            onClick={toggleSideBar}
            className="p-2 rounded-md bg-blue-700 text-white"
          >
            ☰
          </button>
        </div>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
