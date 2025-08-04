import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useSideBar } from "../SideBarContext";

const Layout = () => {
  const { isCollapsed, toggleSideBar } = useSideBar();

  return (
    <div className="flex min-h-screen">
      {/* The SideBar is now rendered here ONCE */}
      <SideBar />
      <div className={`flex-1 transition-all duration-300 p-6 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        {/* The Outlet renders the content of the current route */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
