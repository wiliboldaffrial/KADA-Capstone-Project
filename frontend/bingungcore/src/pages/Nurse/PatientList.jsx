import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { Search, ArrowDownAZ, ArrowUpAZ, ChevronDown, Stethoscope } from "lucide-react";

const APPOINTMENTS_URL = `${process.env.REACT_APP_API_URL}/api/appointments`;
const CHECKUPS_URL = `${process.env.REACT_APP_API_URL}/api/checkups`;

const DoctorCheckupDetail = ({ checkup }) => {
  if (!checkup) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 h-full flex flex-col justify-center items-center text-center">
        <div className="text-center">
          <Stethoscope size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 font-semibold">Diagnosis Details</p>
          <p className="text-sm text-gray-400">Select a record to view details.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 rounded-lg bg-gray-50 h-full">
      <h3 className="font-bold text-lg mb-3 text-gray-800">Doctor's Diagnosis</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-600">Date</p>
          <p className="text-gray-800">{format(new Date(checkup.date), "dd MMMM yyyy")}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Symptoms Described</p>
          <p className="text-gray-800">{checkup.symptoms || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Diagnosis Details</p>
          <p className="text-gray-800">{checkup.details || "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Doctor's Notes</p>
          <p className="text-gray-800">{checkup.doctorNotes || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nurseName, setNurseName] = useState("");
  const initialFormState = { height: "", weight: "", bloodPressure: "", temperature: "", notes: "" };
  const [initialCheckupForm, setInitialCheckupForm] = useState(initialFormState);
  const [doctorHistory, setDoctorHistory] = useState([]);
  const [activeDoctorCheckup, setActiveDoctorCheckup] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const processedAppointments = appointments
    .filter((app) => {
      const patientName = app.patient?.name || "Unknown";
      const matchesSearchTerm = patientName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearchTerm) return false;

      const appointmentDate = new Date(app.dateTime);
      if (filter === "today") return isToday(appointmentDate);
      if (filter === "week") return isThisWeek(appointmentDate, { weekStartsOn: 1 });
      if (filter === "month") return isThisMonth(appointmentDate);
      return true;
    })
    .sort((a, b) => {
      const nameA = a.patient?.name || "Unknown";
      const nameB = b.patient?.name || "Unknown";
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  return (
    <>
      <ConfirmationModal isOpen={false} onClose={() => {}} onConfirm={() => {}} />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Patient Appointments</h1>
            <p className="text-gray-500 mt-1">Hello Nurse {nurseName}, manage today's patient checkups.</p>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 bg-white px-4 py-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
          </div>
        </header>

        <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg shadow-sm border">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${filter === "all" ? "bg-white text-gray-800 shadow-sm" : "bg-transparent text-gray-600"}`}>
              All
            </button>
            <button onClick={() => setFilter("today")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${filter === "today" ? "bg-white text-gray-800 shadow-sm" : "bg-transparent text-gray-600"}`}>
              Today
            </button>
            <button onClick={() => setFilter("week")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${filter === "week" ? "bg-white text-gray-800 shadow-sm" : "bg-transparent text-gray-600"}`}>
              This Week
            </button>
            <button onClick={() => setFilter("month")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${filter === "month" ? "bg-white text-gray-800 shadow-sm" : "bg-transparent text-gray-600"}`}>
              This Month
            </button>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setSortOrder("asc")} className={`p-2 rounded-lg ${sortOrder === "asc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
              <ArrowUpAZ size={20} />
            </button>
            <button onClick={() => setSortOrder("desc")} className={`p-2 rounded-lg ${sortOrder === "desc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
              <ArrowDownAZ size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processedAppointments.map((app) => {
            const isSelected = selectedAppointmentId === app._id;
            const patient = app.patient;

            return (
              <div key={app._id} className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => handleToggleAppointment(app)}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">{patient?.name?.charAt(0) || "P"}</div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{patient?.name}</p>
                      <p className="text-sm text-gray-500">Scheduled for {format(new Date(app.dateTime), "dd MMMM, HH:mm")}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 transition-transform duration-300" style={{ transform: isSelected ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <ChevronDown />
                  </button>
                </div>

                {isSelected && (
                  <div className="border-t p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                      <div className="bg-white border p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Initial Checkup</h3>
                        <form onSubmit={handleAddInitialCheckup} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input name="height" value={initialCheckupForm.height || ""} onChange={handleFormChange} placeholder="Height (cm)" className="p-2 border rounded-md w-full" />
                            <input name="weight" value={initialCheckupForm.weight || ""} onChange={handleFormChange} placeholder="Weight (kg)" className="p-2 border rounded-md w-full" />
                            <input name="bloodPressure" value={initialCheckupForm.bloodPressure || ""} onChange={handleFormChange} placeholder="Blood Pressure" className="p-2 border rounded-md w-full" />
                            <input name="temperature" value={initialCheckupForm.temperature || ""} onChange={handleFormChange} placeholder="Temperature (°C)" className="p-2 border rounded-md w-full" />
                          </div>
                          <textarea name="notes" value={initialCheckupForm.notes || ""} onChange={handleFormChange} placeholder="Notes / Chief Complaint" rows="3" className="p-2 border rounded-md w-full"></textarea>
                          <div className="flex justify-end space-x-3">
                            <button type="button" onClick={handleResetCheckup} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                              Reset
                            </button>
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                              Save Checkup
                            </button>
                          </div>
                        </form>
                      </div>

                      <div className="bg-white border p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">Doctor's Diagnosis History</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {doctorHistory.length > 0 ? (
                            doctorHistory.map((ch) => (
                              <div key={ch._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <p className="text-sm font-medium text-gray-700">Diagnosis on {format(new Date(ch.date), "dd MMM yyyy")}</p>
                                <button onClick={() => setActiveDoctorCheckup(ch)} className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-200">
                                  View Detail
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No diagnosis history found for this patient.</p>
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
