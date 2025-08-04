import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import PatientChartDay from "../components/PatientChartDay";
import PatientBarChart from "../components/PatientBarMonth";
import axios from "axios";
import { format, isToday, startOfWeek, subDays, eachDayOfInterval, subMonths, eachMonthOfInterval } from "date-fns";
import { toast } from "react-hot-toast";

// Define API URLs
const PATIENTS_API_URL = 'http://localhost:5000/api/patients';
const APPOINTMENTS_API_URL = 'http://localhost:5000/api/appointments';
const ANNOUNCEMENTS_API_URL = 'http://localhost:5000/api/announcements';
const ROOMS_API_URL = 'http://localhost:5000/api/rooms';

const Dashboard = () => {
  console.log("Dashboard component is rendering.");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // NEW: State for dynamic dashboard data
  const [patientCount, setPatientCount] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [weeklyPatientData, setWeeklyPatientData] = useState([]);
  const [monthlyPatientData, setMonthlyPatientData] = useState([]);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  
  const sortedAppointments = [...todaysAppointments].sort((a, b) => {
      const now = new Date();
      const aIsPast = new Date(a.dateTime) < now;
      const bIsPast = new Date(b.dateTime) < now;

      // Past appointments go last
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;

      // If both are in the same category, sort by time
      return new Date(a.dateTime) - new Date(b.dateTime);
  });


  // NEW: Fetch all necessary dashboard data on component mount
  useEffect(() => {
    const getAuthHeaders = () => {
      const token = localStorage.getItem("token");
      return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchDashboardData = async () => {
      try {
        // Use Promise.all to fetch data concurrently
        const [patientRes, appointmentRes, announcementRes, roomRes] = await Promise.all([
          axios.get(PATIENTS_API_URL, getAuthHeaders()),
          axios.get(APPOINTMENTS_API_URL, getAuthHeaders()),
          axios.get(ANNOUNCEMENTS_API_URL, getAuthHeaders()),
          axios.get(ROOMS_API_URL, getAuthHeaders()),
        ]);

        // 1. Set total patient count
        setPatientCount(patientRes.data.length);

        // 2. Filter for today's appointments
        const todayApps = appointmentRes.data.filter((app) => isToday(new Date(app.dateTime)));
        setTodaysAppointments(todayApps);

        // 3. Get the latest announcement
        if (announcementRes.data.length > 0) {
          setLatestAnnouncement(announcementRes.data[0]); // Assumes the backend sorts by most recent
        }
        // 4. Calculate and set available rooms count
        const availableCount = roomRes.data.filter((room) => room.status === "Available").length;
        setAvailableRooms(availableCount);

        // Process appointments to get weekly data patient
        const now = new Date();
        const startOfLast7Days = subDays(now, 6); // Calculate the date 6 days ago
        const startof6MonthsAgo = subMonths(now, 5);

        const days = eachDayOfInterval({
          start: startOfLast7Days,
          end: now,
        });

        const months = eachMonthOfInterval({
          start: startof6MonthsAgo,
          end: now
        });

        // Map over days and count appointments for each day
        const counts = days.map(day => {
          const count = appointmentRes.data.filter(app =>
            format(new Date(app.dateTime), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          ).length;
          return {
            day: format(day, 'E'), // E returns Mon, Tue, etc
            patients: count,
          };
        });
        setWeeklyPatientData(counts);

        const monthLyCounts = months.map(month => {
          const count = appointmentRes.data.filter(app =>
            format(new Date(app.dateTime), 'yyyy-MM') === format(month, 'yyyy-MM')
          ).length;
          return {
            month: format(month, 'MMM'),
            patients: count,
          };
        });
        setMonthlyPatientData(monthLyCounts);



      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Could not load dashboard data. Please log in.");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
          {/* MODIFIED: Announcement bar is now dynamic */}
          {latestAnnouncement && (
            <div className="border rounded-full px-4 py-2 w-full mb-4">
              <div className="flex items-center justify-between">
                <p>
                  <span className={`font-bold ${latestAnnouncement.urgency === "urgent" ? "text-red-500" : ""}`}>{latestAnnouncement.title}</span>
                  <span className="text-gray-600 ml-2 truncate">{latestAnnouncement.content}</span>
                </p>
                <div className="flex items-center flex-shrink-0 ml-4">
                  <span className="text-sm text-gray-500 pr-3">{format(new Date(latestAnnouncement.createdAt), "p")}</span>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* MODIFIED: Summary cards are now dynamic (Patient count) */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">{patientCount}</h2>
                  <p className="text-gray-600">Total Patients</p>
                </div>
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">13</h2>
                  <p className="text-gray-600">Doctors</p>
                </div>
                <div className="bg-white shadow rounded-md p-4 text-center">
                  <h2 className="text-2xl font-bold">{availableRooms}</h2>
                  <p className="text-gray-600">Rooms Available</p>
                </div>
              </div>

              {/* MODIFIED: Today's appointment list is now dynamic */}
              <div className="col-span-1 bg-white shadow rounded-md p-4">
                <h3 className="font-semibold text-lg mb-4">Today's Appointments</h3>
                <ul className="divide-y">
                  {sortedAppointments.length > 0 ? (
                    sortedAppointments.map((appt) => (
                      <li key={appt._id} className="py-2 flex justify-between items-center">
                        <div>
                          <p>{appt.patient}</p>
                          <p className="text-xs text-gray-500">{appt.doctor}</p>
                        </div>
                        {/* Note: 'status' field needs to be added to your Appointment model for this to work */}
                        <span className='text-sm text-blue-600'>{new Date() > new Date(appt.dateTime) ? "Finished" : format(new Date(appt.dateTime), "h:mm a")}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No appointments scheduled for today.</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-600 text-white rounded-md p-4">
                <h4 className="font-semibold mb-2">Patient per Day</h4>
                <div className="h-40 flex items-center justify-center text-sm">
                  <PatientChartDay data={weeklyPatientData}/>
                </div>
              </div>
              <div className="bg-white rounded-md shadow p-4">
                <h4 className="font-semibold mb-2">Patient per Month</h4>
                <div className="h-40 flex items-center justify-center text-sm">
                  <PatientBarChart data={monthlyPatientData}/>
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
