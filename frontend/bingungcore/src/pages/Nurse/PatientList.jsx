import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import ExpandedPatientDetails from "../../components/ExpandedPatientDetails";

const API_URL = "http://localhost:5000/api/appointments";

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(API_URL, getAuthHeaders());
        const formattedAppointments = response.data.map((app) => ({
          ...app,
          date: format(new Date(app.dateTime), "yyyy-MM-dd"),
          time: format(new Date(app.dateTime), "HH:mm"),
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
      const response = await axios.post(`${API_URL}/${appointmentId}/checkups`, checkupData, getAuthHeaders());

      setAppointments((prev) => prev.map((app) => (app._id === appointmentId ? { ...app, checkups: [...(app.checkups || []), response.data] } : app)));
    } catch (error) {
      console.error("Failed to add checkup:", error);
    }
  };

  const filteredAppointments = appointments.filter((app) => app.patient.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6">
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
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const isSelected = selectedAppointment?._id === app._id;
            return (
              <div key={app._id} className="bg-white rounded-xl shadow p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{app.patient}</p>

                    {/* Appointment Details */}
                    <div className="mt-1 text-sm text-gray-600">
                      <p>
                        <strong>Doctor:</strong> {app.doctor}
                      </p>
                      <p>
                        <strong>Schedule:</strong> {format(new Date(app.dateTime), "dd MMM yyyy, HH:mm")}
                      </p>
                      {app.notes && (
                        <p>
                          <strong>Notes:</strong> {app.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedAppointment(isSelected ? null : app)} className="text-blue-600 hover:underline text-sm">
                      {isSelected ? "▲ Hide" : "▼ View"}
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 border-t pt-4">
                    <ExpandedPatientDetails patient={appointments.find((p) => p._id === selectedAppointment._id)} onAddCheckup={handleAddCheckup} />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 mt-20">No appointments found.</div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
