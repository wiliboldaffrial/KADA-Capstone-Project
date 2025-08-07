import React from "react";
import MediLinkLogo from "../assets/images/MediLink.png"; // Adjust the path if needed

// Helper component for the header
const AppHeader = ({ subtitle, mode }) => {
  const isSidebar = mode === "sidebar";
  const logoWidth = isSidebar ? 130 : 220; // Increased sizes
  const textColor = isSidebar ? "white" : "#045ae2";

  return (
    <div className={`flex items-center ${isSidebar ? "justify-center px-4 py-4" : "justify-start"} gap-2`}>
      <img src={MediLinkLogo} alt="MediLink Logo" style={{ width: logoWidth, height: "auto" }} />
      {!isSidebar && (
        <h1 className="text-xl font-bold" style={{ fontFamily: "Kollektif, sans-serif", color: textColor }}>
          MediLink
        </h1>
      )}
      {subtitle && !isSidebar && (
        <p className="ml-4 text-lg" style={{ fontFamily: "Kollektif, sans-serif", color: textColor }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AppHeader;
