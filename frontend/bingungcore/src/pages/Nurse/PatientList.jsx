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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAppointments = appointments.filter(app =>
    app.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />

      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header with search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold">Hello Nurse 👩‍⚕️</h1>
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-4 sm:mt-0 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Appointment List */}
        <div className="space-y-4">
          {filteredAppointments.map((app) => {
            const isSelected = selectedAppointment?._id === app._id;
            return (
              <div key={app._id} className="bg-white rounded-xl shadow p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-lg">{app.patient}</p>
                    {/* Schedule always visible */}
                    <p className="mt-1 text-sm text-gray-600">
                      <strong>Schedule:</strong> {format(new Date(app.dateTime), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedAppointment(isSelected ? null : app)}
                    className="mt-2 sm:mt-0 flex items-center text-blue-600 hover:underline text-sm"
                  >
                    {isSelected ? (
                      <>
                        ▲ <span className="ml-1">Hide</span>
                      </>
                    ) : (
                      <>
                        ▼ <span className="ml-1">View</span>
                      </>
                    )}
                  </button>
                </div>
                {isSelected && (
                  <div className="mt-4 border-t pt-4">
                    <ExpandedPatientDetails
                      patient={appointments.find(p => p._id === selectedAppointment._id)}
                      onAddCheckup={handleAddCheckup}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="text-center text-gray-500 mt-20">No appointments found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
