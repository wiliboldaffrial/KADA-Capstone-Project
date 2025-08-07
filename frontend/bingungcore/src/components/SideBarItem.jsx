import React from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";

const SideBarItem = ({ path, label, iconType, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <li>
      <Link to={path} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-blue-700" : "hover:bg-blue-600"}`}>
        <Icon type={iconType} size={22} />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
};

export default SideBarItem;
