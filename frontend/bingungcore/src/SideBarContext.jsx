import React, { createContext, useState, useContext } from "react";

// Create the context for the sidebar state.
// We provide a default value to help with autocompletion and to handle cases where the context is not provided.
const SideBarContext = createContext({
  isCollapsed: false,
  toggleSideBar: () => {},
});

// This is the provider component that will wrap the part of your application
// that needs access to the sidebar state.
export const SideBarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSideBar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // The value object contains the state and the function to update it.
  // This will be accessible to any component wrapped by this provider.
  const value = {
    isCollapsed,
    toggleSideBar,
  };

  return <SideBarContext.Provider value={value}>{children}</SideBarContext.Provider>;
};

// Custom hook to make it easier to consume the context.
// This prevents having to import useContext and SideBarContext in every component.
export const useSideBar = () => {
  const context = useContext(SideBarContext);
  if (context === undefined) {
    throw new Error("useSideBar must be used within a SideBarProvider");
  }
  return context;
};

export default SideBarContext;
