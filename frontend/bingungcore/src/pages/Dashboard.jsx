import React, { useState } from "react";
import SideBar from "../components/SideBar";
import PatientChartDay from "../components/PatientChartDay";
import PatientBarChart from "../components/PatientBarMonth";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Announcement */}
        <div className="flex justify-between items-center">
          <div className="border rounded-full px-4 py-2 w-full">
            <div className="flex items-center justify-between">
              <p>New Announcement</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 pr-3">1 minute ago</span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Left column: cards + today's appointment */}
          <div>
            {/* 3 summary boxes */}
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

            {/* Today's appointments */}
            <div className="bg-white shadow rounded-md p-4">
              <h3 className="font-semibold text-lg mb-4">Today's Appointment</h3>
              <ul className="divide-y">
                {[
                  { name: 'Sam Strand', status: 'Waiting' },
                  { name: 'Heartman', status: 'Waiting' },
                  { name: 'Mama', status: 'Scheduled' },
                  { name: 'Lockne', status: 'Scheduled' },
                  { name: 'Cliff Unger', status: 'Scheduled' },
                  { name: 'Lou', status: 'Finished' },
                ].map((appointment, index) => (
                  <li key={index} className="py-2 flex justify-between">
                    <div>
                      <p>{appointment.name}</p>
                      <p className="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span
                      className={`${
                        appointment.status === 'Waiting'
                          ? 'text-yellow-500'
                          : appointment.status === 'Scheduled'
                          ? 'text-green-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: charts */}
          <div className="flex flex-col gap-4">
            {/* Patient per Day */}
            <div className="bg-blue-600 text-white rounded-md p-4 flex-1">
              <h4 className="font-semibold mb-2">Patient per Day</h4>
              <div className="h-48">
                <PatientChartDay />
              </div>
            </div>

            {/* Patient per Month */}
            <div className="bg-white rounded-md shadow p-4 flex-1">
              <h4 className="font-semibold mb-2">Patient per Month</h4>
              <div className="h-48">
                <PatientBarChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
