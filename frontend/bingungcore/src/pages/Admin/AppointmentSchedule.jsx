import React, { useState, useEffect, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, X, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-hot-toast";
import axios from "axios";

const APPOINTMENT_API_URL = "http://localhost:5000/api/appointments";
const PATIENT_API_URL = "http://localhost:5000/api/patients";
const USER_API_URL = "http://localhost:5000/api/users";

const AppointmentSchedule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]); // New state for doctors
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [newAppointment, setNewAppointment] = useState({ patient: "", doctor: "", dateTime: "", notes: "" });

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // --- API Communication ---

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(APPOINTMENT_API_URL, getAuthHeaders());
      const formattedAppointments = response.data.map((app) => ({
        ...app,
        date: format(new Date(app.dateTime), "yyyy-MM-dd"),
        time: format(new Date(app.dateTime), "h:mm a"),
        // Use the populated names for display
        patientDisplayName: app.patientName || (app.patient ? app.patient.name : 'Unknown Patient'),
        doctorDisplayName: app.doctorName || (app.doctor ? app.doctor.name : 'Unknown Doctor')
      }));
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to fetch appointments.");
    }
  };

  const fetchPatientList = async () => {
    try {
      const response = await axios.get(PATIENT_API_URL, getAuthHeaders());
      setPatientList(response.data);
    } catch (error) {
      console.error("Failed to fetch patient list:", error);
      toast.error("Could not load patient list.");
    }
  };

  // New function to fetch doctors
  const fetchDoctorList = async () => {
    try {
      const response = await axios.get(`${USER_API_URL}/role/doctors`, getAuthHeaders());
      setDoctorList(response.data);
    } catch (error) {
      console.error("Failed to fetch doctor list:", error);
      toast.error("Could not load doctor list.");
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatientList();
    fetchDoctorList(); // Add this to fetch doctors on component mount
  }, []);

  // --- CRUD Handlers (largely unchanged) ---
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.dateTime || !newAppointment.doctor || !newAppointment.patient) {
      toast.error("Please fill out all required fields.");
      return;
    }
    try {
      await axios.post(APPOINTMENT_API_URL, newAppointment, getAuthHeaders());
      toast.success("Appointment successfully added!");
      setShowAddForm(false);
      setNewAppointment({ patient: "", doctor: "", dateTime: "", notes: "" });
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add appointment.");
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${APPOINTMENT_API_URL}/${editingData._id}`, editingData, getAuthHeaders());
      toast.success("Appointment successfully updated!");
      setIsEditing(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update appointment.");
    }
  };

  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await axios.delete(`${APPOINTMENT_API_URL}/${appointmentToDelete}`, getAuthHeaders());
        toast.success("Appointment successfully deleted!");
        setSelectedAppointment(null);
        setIsEditing(false);
        fetchAppointments();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not delete appointment.");
      } finally {
        setDeleteModalOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };

  // --- UI Handlers ---
  const handleOpenDeleteModal = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setDeleteModalOpen(true);
  };

  const handleEditClick = () => {
    const formattedDateTime = selectedAppointment.dateTime ? new Date(new Date(selectedAppointment.dateTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
    setEditingData({ 
      ...selectedAppointment, 
      dateTime: formattedDateTime,
      // Set the ObjectId values for the form
      patient: selectedAppointment.patient ? selectedAppointment.patient._id || selectedAppointment.patient : "",
      doctor: selectedAppointment.doctor ? selectedAppointment.doctor._id || selectedAppointment.doctor : ""
    });
    setIsEditing(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Searchable Patient Dropdown Component ---
  const SearchablePatientInput = ({ value, onChange, patientList, displayValue }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
      // If we have a displayValue (for editing), use it, otherwise try to find the patient name by ID
      if (displayValue) {
        setSearchTerm(displayValue);
      } else if (value && patientList.length > 0) {
        const patient = patientList.find(p => p._id === value);
        setSearchTerm(patient ? patient.name : "");
      } else {
        setSearchTerm("");
      }
    }, [value, displayValue, patientList]);

    useEffect(() => {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredPatients = patientList.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nik.includes(searchTerm));

    const handleInputChange = (e) => {
      setSearchTerm(e.target.value);
      // Clear the selected patient ID when user types
      const syntheticEvent = { target: { name: "patient", value: "" } };
      // onChange(syntheticEvent);
      setDropdownOpen(true);
    };

    const handleSelectPatient = (patient) => {
      const syntheticEvent = { target: { name: "patient", value: patient._id } };
      onChange(syntheticEvent);
      setSearchTerm(patient.name);
      setDropdownOpen(false);
    };

    return (
      <div className="relative" ref={wrapperRef}>
        <input type="text" id="patientName" name="patient" value={searchTerm} onChange={handleInputChange} onFocus={() => setDropdownOpen(true)} autoComplete="off" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        {isDropdownOpen && filteredPatients.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
            {filteredPatients.map((p) => (
              <div key={p._id} onClick={() => handleSelectPatient(p)} className="p-2 hover:bg-blue-100 cursor-pointer">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">NIK: {p.nik}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const goToNextMonth = () => setCurrentDate((prevDate) => addMonths(prevDate, 1));
  const goToPreviousMonth = () => setCurrentDate((prevDate) => subMonths(prevDate, 1));

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const startingDayIndex = getDay(firstDayOfMonth);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <>
      <div className="min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin - Appointment Schedule</h1>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            {showAddForm ? "×" : "Add New Appointment"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Appointment</h2>
            <form onSubmit={handleAddAppointment}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="patientName" className="mb-1 text-sm font-medium text-gray-600">
                    Patient's Name
                  </label>
                  <SearchablePatientInput value={newAppointment.patient} onChange={(e) => setNewAppointment((prev) => ({ ...prev, patient: e.target.value }))} patientList={patientList} />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="doctor" className="mb-1 text-sm font-medium text-gray-600">
                    Doctor
                  </label>
                  <select id="doctor" name="doctor" value={newAppointment.doctor} onChange={(e) => setNewAppointment((prev) => ({ ...prev, doctor: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {doctorList.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="dateTime" className="mb-1 text-sm font-medium text-gray-600">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="dateTime"
                    name="dateTime"
                    value={newAppointment.dateTime}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="notes" className="mb-1 text-sm font-medium text-gray-600">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))}
                    rows="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg drop-shadow-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-4 bg-blue-600">
            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6 text-blue-200" />
            </button>
            <h2 className="text-xl font-semibold text-white px-20 py-4 rounded-lg">{format(currentDate, "MMMM yyyy")}</h2>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight className="w-6 h-6 text-blue-200" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center font-semibold text-gray-600 border-b mb-2 pb-2">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startingDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="border-r border-b"></div>
            ))}
            {daysInMonth.map((day, index) => {
              const dayAppointments = appointments.filter((app) => app.date === format(day, "yyyy-MM-dd"));
              return (
                <div key={index} className="border-r border-b p-2 h-36 relative">
                  <div className="flex justify-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${isToday(day) ? "bg-blue-600 text-white" : "text-gray-800"}`}>{format(day, "d")}</div>
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                    {dayAppointments.map((app) => (
                      <div key={app._id} onClick={() => setSelectedAppointment(app)} className="bg-blue-500 text-white text-xs rounded-md p-1 truncate cursor-pointer hover:bg-blue-700">
                        {app.patientDisplayName} - {app.time}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in">
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsEditing(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
              >
                <X size={24} />
              </button>
              {isEditing ? (
                <form onSubmit={handleUpdateAppointment}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Appointment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col">
                      <label htmlFor="edit-patient" className="mb-1 text-sm font-medium text-gray-600">
                        Patient's Name
                      </label>
                      <SearchablePatientInput 
                        value={editingData.patient} 
                        onChange={handleEditInputChange} 
                        patientList={patientList}
                        displayValue={selectedAppointment.patientDisplayName}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="edit-doctor" className="mb-1 text-sm font-medium text-gray-600">
                        Doctor
                      </label>
                      <select id="edit-doctor" name="doctor" value={editingData.doctor} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        {doctorList.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <label htmlFor="edit-dateTime" className="mb-1 text-sm font-medium text-gray-600">
                        Date & Time
                      </label>
                      <input type="datetime-local" id="edit-dateTime" name="dateTime" value={editingData.dateTime} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div className="flex flex-col col-span-2">
                      <label htmlFor="edit-notes" className="mb-1 text-sm font-medium text-gray-600">
                        Notes
                      </label>
                      <textarea id="edit-notes" name="notes" value={editingData.notes} onChange={handleEditInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button type="button" onClick={() => handleOpenDeleteModal(selectedAppointment._id)} className="flex items-center gap-2 bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg hover:bg-red-200 transition">
                      <Trash2 size={16} /> Delete
                    </button>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                        Cancel
                      </button>
                      <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex-grow">Appointment Details</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      <strong>Date:</strong> {format(parseISO(selectedAppointment.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedAppointment.time}
                    </p>
                    <p>
                      <strong>Patient:</strong> {selectedAppointment.patientDisplayName}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {selectedAppointment.doctorDisplayName}
                    </p>
                    <div>
                      <strong className="block mb-1">Notes:</strong>
                      <p className="bg-gray-50 p-3 rounded-md border text-sm">{selectedAppointment.notes || "No notes provided."}</p>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button onClick={handleEditClick} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Edit size={16} /> Edit Appointment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Appointment" confirmText="Delete">
        Are you sure you want to delete this appointment? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
};

export default AppointmentSchedule;