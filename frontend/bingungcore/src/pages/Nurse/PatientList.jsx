import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import SideBar from '../../components/SideBar';
import ExpandedPatientDetails from '../../components/ExpandedPatientDetails';

const API_URL = 'http://localhost:5000/api/appointments';

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSideBar = () => setIsSidebarCollapsed(prev => !prev);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(API_URL, getAuthHeaders());
        const formattedAppointments = response.data.map(app => ({
          ...app,
          date: format(new Date(app.dateTime), 'yyyy-MM-dd'),
          time: format(new Date(app.dateTime), 'HH:mm'),
          checkups: app.checkups || [],
        }));
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

    const handleAddCheckup = async (appointmentId, checkupData) => {
    try {
      const response = await axios.post(
        `${API_URL}/${appointmentId}/checkups`,
        checkupData,
        getAuthHeaders()
      );

      // Update the local state (replace the appointment with updated one)
      setAppointments(prev =>
        prev.map(app =>
          app._id === appointmentId
            ? { ...app, checkups: [...(app.checkups || []), response.data] }
            : app
        )
      );
    } catch (error) {
      console.error("Failed to add checkup:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />

      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <h1 className="text-2xl font-bold mb-4">Nurse - Patient Checkup List</h1>

        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <React.Fragment key={app._id}>
                  <tr
                    className={`border-t cursor-pointer hover:bg-blue-50 ${selectedAppointment && selectedAppointment._id === app._id ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedAppointment(app._id === selectedAppointment?._id ? null : app)}
                  >
                    <td className="px-4 py-2">{app.date}</td>
                    <td className="px-4 py-2">{app.time}</td>
                    <td className="px-4 py-2">{app.patient}</td>
                    <td className="px-4 py-2">{app.doctor}</td>
                    <td className="px-4 py-2">{app.notes || '-'}</td>
                  </tr>
                  {selectedAppointment && selectedAppointment._id === app._id && (
                  <tr>
                    <td colSpan="5">
                      <ExpandedPatientDetails
                        patient={appointments.find(p => p._id === selectedAppointment._id)} // <- use fresh state
                        onAddCheckup={handleAddCheckup}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
