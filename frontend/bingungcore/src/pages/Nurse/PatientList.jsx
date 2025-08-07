import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Search, ArrowDownAZ, ArrowUpAZ } from "lucide-react"; // NEW: Icons for UI

const APPOINTMENTS_URL = "http://localhost:5000/api/appointments";
const CHECKUPS_URL = "http://localhost:5000/api/checkups";

const DoctorCheckupDetail = ({ checkup }) => {
  if (!checkup) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 h-full flex flex-col justify-center items-center text-center">
        <p className="text-gray-500">Select a doctor's checkup record to view details.</p>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-lg bg-gray-50 h-full">
      <h3 className="font-bold text-lg mb-3">Doctor's Diagnosis Details</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Date:</strong> {format(new Date(checkup.date), "dd MMMM yyyy")}
        </p>
        <p>
          <strong>Symptoms Described:</strong> {checkup.symptoms || "N/A"}
        </p>
        <p>
          <strong>Doctor's Notes:</strong> {checkup.doctorNotes || "N/A"}
        </p>
        {checkup.vitalSigns && (
          <div>
            <strong>Vitals Recorded During Diagnosis:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Temp: {checkup.vitalSigns.temperature || "N/A"}</li>
              <li>Blood Pressure: {checkup.vitalSigns.bloodPressure || "N/A"}</li>
            </ul>
          </div>
        )}
        <p>
          <strong>Diagnosis Details:</strong> {checkup.details || "N/A"}
        </p>
      </div>
    </div>
  );
};

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nurseName, setNurseName] = useState("");
  const initialFormState = { weight: "", bloodPressure: "", temperature: "", notes: "" };
  const [initialCheckupForm, setInitialCheckupForm] = useState(initialFormState);
  const [doctorHistory, setDoctorHistory] = useState([]);
  const [activeDoctorCheckup, setActiveDoctorCheckup] = useState(null);

  const [filter, setFilter] = useState("all");

  // NEW: State for sorting
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  useEffect(() => {
    const loggedInUserName = localStorage.getItem("userName") || "User";
    setNurseName(loggedInUserName);
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await axios.get(APPOINTMENTS_URL, getAuthHeaders());
      setAppointments(response.data);
    } catch (error) {
      toast.error("Could not fetch appointments.");
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const fetchDoctorHistory = async (patientId) => {
    try {
      const response = await axios.get(`${CHECKUPS_URL}/patient/${patientId}`, getAuthHeaders());
      setDoctorHistory(response.data);
    } catch (error) {
      setDoctorHistory([]);
      toast.error("Could not fetch doctor's diagnosis history.");
    }
  };

  const handleToggleAppointment = async (appointment) => {
    const isOpening = selectedAppointmentId !== appointment._id;
    setDoctorHistory([]);
    setActiveDoctorCheckup(null);
    setSelectedAppointmentId(isOpening ? appointment._id : null);

    if (isOpening) {
      const nurseCheckup = Array.isArray(appointment.checkups) && appointment.checkups.length > 0 ? appointment.checkups[0] : initialFormState;
      setInitialCheckupForm(nurseCheckup);

      const patientId = appointment.patient?._id;
      if (patientId) {
        await fetchDoctorHistory(patientId);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInitialCheckupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInitialCheckup = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) return;

    const currentAppointment = appointments.find((app) => app._id === selectedAppointmentId);
    if (currentAppointment?.checkups?.length > 0) {
      toast.error("An initial checkup has already been added for this appointment.");
      return;
    }

    const toastId = toast.loading("Saving Initial Checkup...");
    const endpoint = `${APPOINTMENTS_URL}/${selectedAppointmentId}/checkups`;

    try {
      const checkupData = { ...initialCheckupForm, date: new Date().toISOString() };
      await axios.post(endpoint, checkupData, getAuthHeaders());
      toast.success("Initial Checkup Saved!", { id: toastId });
      await fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save checkup.", { id: toastId });
    }
  };

  const handleResetCheckup = async () => {
    if (!selectedAppointmentId) return;
    const endpoint = `${APPOINTMENTS_URL}/${selectedAppointmentId}/checkups/reset`;
    const toastId = toast.loading("Resetting Initial Checkup...");
    try {
      await axios.post(endpoint, {}, getAuthHeaders());
      setInitialCheckupForm(initialFormState);
      toast.success("Initial Checkup reset. You can now re-enter the data.", { id: toastId });
      await fetchAppointments();
    } catch (error) {
      toast.error("Could not reset checkup.", { id: toastId });
    }
  };

  // Filter and sort appointments
  const processedAppointments = appointments
    .filter((app) => {
      const patientName = app.patient?.name || "Unknown";
      const matchesSearchTerm = patientName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearchTerm) {
        return false;
      }

      const appointmentDate = new Date(app.dateTime);
      if (filter === "today") {
        return isToday(appointmentDate);
      }
      if (filter === "week") {
        return isThisWeek(appointmentDate, { weekStartsOn: 1 });
      }
      if (filter === "month") {
        return isThisMonth(appointmentDate);
      }

      return true;
    })
    // NEW: Sorting logic added
    .sort((a, b) => {
      const nameA = a.patient?.name || "Unknown";
      const nameB = b.patient?.name || "Unknown";
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  return (
    <>
      <ConfirmationModal isOpen={false} onClose={() => {}} onConfirm={() => {}} />
      <main className="flex-1 p-8 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Hello Nurse {nurseName} 👋</h1>
          {/* NEW: Aesthetic search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 bg-white px-4 py-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          {/* Filter buttons */}
          <div className="flex space-x-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "all" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              All
            </button>
            <button onClick={() => setFilter("today")} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "today" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              Today
            </button>
            <button onClick={() => setFilter("week")} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "week" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              This Week
            </button>
            <button onClick={() => setFilter("month")} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === "month" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              This Month
            </button>
          </div>
          {/* NEW: Sort buttons */}
          <div className="flex space-x-2">
            <button onClick={() => setSortOrder("asc")} className={`p-2 rounded-lg ${sortOrder === "asc" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              <ArrowUpAZ size={20} />
            </button>
            <button onClick={() => setSortOrder("desc")} className={`p-2 rounded-lg ${sortOrder === "desc" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
              <ArrowDownAZ size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processedAppointments.map((app) => {
            const isSelected = selectedAppointmentId === app._id;
            const patient = app.patient;

            return (
              <div key={app._id} className="bg-white rounded-xl shadow-sm">
                <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => handleToggleAppointment(app)}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyan-200 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{patient?.name}</p>
                      <p className="text-sm text-gray-500">Schedule: {format(new Date(app.dateTime), "dd MMMM yyyy, HH:mm")}</p>
                    </div>
                  </div>
                  <button className="text-blue-600">{isSelected ? "▲" : "▼"}</button>
                </div>

                {isSelected && (
                  <div className="border-t p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                      {/* Section 1: NURSE'S CHECKUP */}
                      <div className="bg-white border p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Initial Checkup by Nurse</h3>
                        <form onSubmit={handleAddInitialCheckup} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input name="weight" value={initialCheckupForm.weight || ""} onChange={handleFormChange} placeholder="Weight (kg)" className="p-2 border rounded-md w-full" />
                            <input name="bloodPressure" value={initialCheckupForm.bloodPressure || ""} onChange={handleFormChange} placeholder="Blood Pressure" className="p-2 border rounded-md w-full" />
                            <input name="temperature" value={initialCheckupForm.temperature || ""} onChange={handleFormChange} placeholder="Temperature (°C)" className="p-2 border rounded-md w-full" />
                          </div>
                          <textarea name="notes" value={initialCheckupForm.notes || ""} onChange={handleFormChange} placeholder="Notes / Keluhan" rows="3" className="p-2 border rounded-md w-full"></textarea>
                          <div className="flex justify-end space-x-3">
                            <button type="button" onClick={handleResetCheckup} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                              Reset
                            </button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                              Add Checkup
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Section 2: DOCTOR'S HISTORY */}
                      <div className="bg-white border p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Doctor Checkup History (All Time)</h3>
                        <div className="space-y-3">
                          {doctorHistory.length > 0 ? (
                            doctorHistory.map((ch) => (
                              <div key={ch._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <p>Diagnosis - {format(new Date(ch.date), "dd MMMM yyyy")}</p>
                                <div>
                                  <button onClick={() => toast.error("Delete not implemented.")} className="text-red-500 mr-4">
                                    🗑️
                                  </button>
                                  <button onClick={() => setActiveDoctorCheckup(ch)} className="bg-blue-500 text-white px-4 py-1 rounded-md">
                                    Detail
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No doctor diagnosis history found.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <DoctorCheckupDetail checkup={activeDoctorCheckup} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default PatientList;
