// frontend/bingungcore/src/components/Icon.jsx
import React from "react";

// Dynamically import icons based on type
import AnnouncementIcon from "../assets/images/announcement.png";
import DashboardIcon from "../assets/images/dashboard.png";
import PatientListIcon from "../assets/images/patientlist.png";
import AppoinmentIcon from "../assets/images/appointment.png";
import RoomIcon from "../assets/images/room.png";

const iconMap = {
  announcement: AnnouncementIcon,
  dashboard: DashboardIcon,
  patientlist: PatientListIcon,
  appoinment: AppoinmentIcon,
  room: RoomIcon,
};

const Icon = ({ type, size = 24, alt = "" }) => {
  const src = iconMap[type?.toLowerCase()];

  if (!src) {
    console.warn(`Icon type "${type}" not found.`);
    return null;
  }

  return <img src={src} alt={alt || `${type} icon`} width={size} height={size} style={{ objectFit: "contain" }} />;
};

export default Icon;
