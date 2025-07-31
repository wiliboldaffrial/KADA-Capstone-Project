import React from "react";
import MediLinkLogo from "../assets/images/MediLink_white.png"; // Adjust the path if needed

// Helper component for the header
const LoginAppHeader = ({ subtitle, mode }) => {
  const isSidebar = mode === "sidebar";
  const logoWidth = isSidebar ? 96 : 220; // Increased sizes
  const textColor = isSidebar ? "white" : "#045ae2";

  return (
    <div className="text-center flex flex-col items-center my-8">
      <img src={MediLinkLogo} alt="MediLink Logo" style={{ width: logoWidth, height: "auto" }} className="mx-auto mb-4" />
      {subtitle && (
        <p className="text-xl text-gray-700 mt-8" style={{ fontFamily: "Kollektif, sans-serif", color: textColor }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default LoginAppHeader;
