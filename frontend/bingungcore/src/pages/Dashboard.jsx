import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { Outlet } from 'react-router-dom';
import PatientChartDay from "../components/PatientChartDay";
import PatientBarChart from "../components/PatientBarMonth";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
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

          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* 3 kotak dan today's appointments */}
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

              <div class="col-span-1 bg-white shadow rounded-md p-4 gap-4">
                <h3 class="font-semibold text-lg mb-4">Today's Appointment</h3>
                <ul class="divide-y">
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Sam Strand</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span class="text-yellow-500">Waiting</span>
                  </li>
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Heartman</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span class="text-yellow-500">Waiting</span>
                  </li>
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Mama</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span class="text-green-500">Scheduled</span>
                  </li>
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Lockne</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span class="text-green-500">Scheduled</span>
                  </li>
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Cliff Unger</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                    </div>
                    <span class="text-green-500">Scheduled</span>
                  </li>
                  <li class="py-2 flex justify-between">
                    <div>
                      <p>Lou</p>
                      <p class="text-xs text-gray-500">Time with Dr. Deadman</p>
                      
                    {/* Graphs */}
                    <div className="flex flex-col gap-4">
                        
                        {/* Card 1 */}
                        <div className="bg-blue-600 text-white rounded-md p-4 flex flex-col flex-1">
                            <h4 className="font-semibold mb-2">Patient per Day</h4>
                            <div className="flex-1">
                                <PatientChartDay />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-md shadow p-4 flex flex-col flex-1">
                            <h4 className="font-semibold mb-2">Patient per Month</h4>
                            <div className="flex-1">
                                <PatientBarChart />
                            </div>
                        </div>
                    </div>
                    <span class="text-blue-500">Finished</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            {/* Graphs */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-600 text-white rounded-md p-4 flex flex-col">
                  <h4 className="font-semibold mb-2">Patient per Day</h4>
                  <PatientChartDay />
                </div>
                <div className="bg-white rounded-md shadow p-4 flex flex-col">
                  <h4 className="font-semibold mb-2">Patient per Month</h4>
                  <PatientBarChart />
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default Dashboard;
