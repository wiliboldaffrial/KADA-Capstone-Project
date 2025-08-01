import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import axios from "axios";
import { Outlet } from "react-router-dom";
import PatientChartDay from "../components/PatientChartDay";
import PatientBarChart from "../components/PatientBarMonth";
import { formatDistanceToNow } from "date-fns";

const appointmentsToday = [
  { id: 1, name: "Sam Strand", doctor: "Dr. Deadman", status: "ulululu" },
  { id: 2, name: "Heartman", doctor: "Dr. Deadman", status: "Waiting" },
  { id: 3, name: "Mama", doctor: "Dr. Deadman", status: "Scheduled" },
  { id: 4, name: "Lockne", doctor: "Dr. Deadman", status: "Scheduled" },
  { id: 5, name: "Cliff Unger", doctor: "Dr. Deadman", status: "Scheduled" },
  { id: 6, name: "Lou", doctor: "Dr. Deadman", status: "Finished" },
];

const Dashboard = () => {
  console.log("Dashboard component is rendering.");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Helper function to get authentication headers from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
    if (!token) {
      return {};
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        // Correctly pass the authentication headers to the axios request
        const res = await axios.get("http://localhost:5000/api/announcements", getAuthHeaders());
        console.log("Announcements fetched successfully:", res.data);
        if (res.data && res.data.length > 0) {
          setLatestAnnouncement(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        setLatestAnnouncement(null);
      }
    };
    fetchLatestAnnouncement();
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
          <div className="flex justify-between items-center">
            <div className="border rounded-full px-4 py-2 w-full">
              <div className="flex items-center justify-between">
                <p>{latestAnnouncement ? latestAnnouncement.content : "No announcements yet."}</p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 pr-3">{latestAnnouncement ? formatDistanceToNow(new Date(latestAnnouncement.createdAt), { addSuffix: true }) : null}</span>
                  <span className={`w-3 h-3 rounded-full ${latestAnnouncement?.urgency ? "bg-red-500" : "bg-green-500"}`}></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">31</h2>
                  <p className="text-gray-600">New Patient</p>
                </div>
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">13</h2>
                  <p className="text-gray-600">Doctors</p>
                </div>
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">20</h2>
                  <p className="text-gray-600">Rooms Available</p>
                </div>
              </div>
              <div className="col-span-1 bg-white shadow rounded-md p-4 gap-4">
                <h3 className="font-semibold text-lg mb-4">Today's Appointment</h3>
                <ul className="divide-y">
                  {appointmentsToday.map((appt) => (
                    <li key={appt.id} className="py-2 flex justify-between">
                      <div>
                        <p>{appt.name}</p>
                        <p className="text-xs text-gray-500">{appt.doctor}</p>
                      </div>
                      <span>{appt.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="">
              <div className="col-span-1 grid grid-cols-1 gap-4">
                <div className="bg-blue-600 text-white rounded-md p-4">
                  <h4 className="font-semibold mb-2">Patient per Day</h4>
                  <div className="h-40 flex items-center justify-center text-sm">{<PatientChartDay />}</div>
                </div>
                <div className="bg-white rounded-md shadow p-4">
                  <h4 className="font-semibold mb-2">Patient per Month</h4>
                  <div className="h-40 flex items-center justify-center text-sm">{<PatientBarChart />}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
