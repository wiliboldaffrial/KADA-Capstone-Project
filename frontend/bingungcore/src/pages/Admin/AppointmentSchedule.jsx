import React, { useState, useEffect, useRef, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, X, Edit, Trash2, Plus, Clock, User, Stethoscope, Calendar as CalendarIcon } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { toast } from "react-hot-toast";
import axios from "axios";

const APPOINTMENT_API_URL = `${process.env.REACT_APP_API_URL}/api/appointments`;
const PATIENT_API_URL = `${process.env.REACT_APP_API_URL}/api/patients`;
const USER_API_URL = `${process.env.REACT_APP_API_URL}/api/users`;

// A more robust Searchable Input component
const SearchableInput = ({ value, onChange, itemList, displayKey, placeholder, onFocus, name }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && itemList.length > 0) {
      const selectedItem = itemList.find((item) => item._id === value);
      setSearchTerm(selectedItem ? selectedItem[displayKey] : "");
    } else {
      setSearchTerm("");
    }
  }, [value, itemList, displayKey]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredItems = itemList.filter((item) => item[displayKey].toLowerCase().includes(searchTerm.toLowerCase()));

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    const syntheticEvent = { target: { name, value: "" } };
    onChange(syntheticEvent);
    setDropdownOpen(true);
  };

  const handleSelectItem = (item) => {
    const syntheticEvent = { target: { name, value: item._id } };
    onChange(syntheticEvent);
    setSearchTerm(item[displayKey]);
    setDropdownOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          setDropdownOpen(true);
          if (onFocus) onFocus();
        }}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        required
      />
      {isDropdownOpen && filteredItems.length > 0 && (
        <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
          {filteredItems.map((item) => (
            <div key={item._id} onClick={() => handleSelectItem(item)} className="p-2 hover:bg-blue-50 cursor-pointer">
              <p className="font-semibold">{item[displayKey]}</p>
              {item.nik && <p className="text-sm text-gray-500">NIK: {item.nik}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AppointmentSchedule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patientList, setPatientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newAppointment, setNewAppointment] = useState({ patient: "", doctor: "", dateTime: "", notes: "" });
  const [editingData, setEditingData] = useState(null);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

  const fetchData = async () => {
    try {
      const [appsRes, patientsRes, doctorsRes] = await Promise.all([axios.get(APPOINTMENT_API_URL, getAuthHeaders()), axios.get(PATIENT_API_URL, getAuthHeaders()), axios.get(`${USER_API_URL}/role/doctors`, getAuthHeaders())]);

      const formattedAppointments = appsRes.data.map((app) => ({
        ...app,
        date: format(new Date(app.dateTime), "yyyy-MM-dd"),
        time: format(new Date(app.dateTime), "HH:mm"),
        patientDisplayName: app.patient?.name || "Unknown Patient",
        doctorDisplayName: app.doctor?.name || "Unknown Doctor",
      }));

      setAppointments(formattedAppointments);
      setPatientList(patientsRes.data);
      setDoctorList(doctorsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load schedule data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData();
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
      fetchData();
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
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not delete appointment.");
      } finally {
        setDeleteModalOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };

  const handleOpenDeleteModal = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
    setDeleteModalOpen(true);
  };

  const handleEditClick = () => {
    const formattedDateTime = selectedAppointment.dateTime ? new Date(new Date(selectedAppointment.dateTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
    setEditingData({
      ...selectedAppointment,
      dateTime: formattedDateTime,
      patient: selectedAppointment.patient?._id,
      doctor: selectedAppointment.doctor?._id,
    });
    setIsEditing(true);
  };

  const goToNextMonth = () => setCurrentDate((prevDate) => addMonths(prevDate, 1));
  const goToPreviousMonth = () => setCurrentDate((prevDate) => subMonths(prevDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startOfWeek(firstDayOfMonth), end: endOfWeek(lastDayOfMonth) });
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Appointment Schedule</h1>
            <p className="text-gray-500 mt-1">Manage and view all patient appointments.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
            <Plus size={20} />
            {showAddForm ? "Cancel" : "New Appointment"}
          </button>
        </header>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Appointment</h2>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Patient</label>
                  <SearchableInput
                    value={newAppointment.patient}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, patient: e.target.value }))}
                    itemList={patientList}
                    displayKey="name"
                    placeholder="Search patient by name or NIK"
                    name="patient"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-600">Doctor</label>
                  <select name="doctor" value={newAppointment.doctor} onChange={(e) => setNewAppointment((prev) => ({ ...prev, doctor: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {doctorList.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-600">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={newAppointment.dateTime}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, dateTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-600">Notes (Optional)</label>
                  <textarea name="notes" value={newAppointment.notes} onChange={(e) => setNewAppointment((prev) => ({ ...prev, notes: e.target.value }))} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="submit" className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 w-40 text-center">{format(currentDate, "MMMM yyyy")}</h2>
              <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              Today
            </button>
          </div>
          <div className="grid grid-cols-7">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-500 text-sm py-3 border-b">
                {day}
              </div>
            ))}
            {daysInMonth.map((day, index) => {
              const dayAppointments = appointments.filter((app) => app.date === format(day, "yyyy-MM-dd"));
              const isCurrentMonth = format(day, "M") === format(currentDate, "M");
              return (
                <div key={index} className={`border-b border-r p-2 h-36 flex flex-col ${isCurrentMonth ? "" : "bg-gray-50"}`}>
                  <span className={`self-end w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${isToday(day) ? "bg-blue-600 text-white" : isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}>
                    {format(day, "d")}
                  </span>
                  {/* CHANGE: Removed slice and max-height to allow scrolling */}
                  <div className="mt-1 space-y-1 overflow-y-auto flex-grow">
                    {dayAppointments.map((app) => (
                      <div key={app._id} onClick={() => setSelectedAppointment(app)} className="bg-blue-100 text-blue-800 text-xs rounded p-1 truncate cursor-pointer hover:bg-blue-200">
                        <p className="font-semibold">{app.patientDisplayName}</p>
                        <p>{format(new Date(app.dateTime), "p")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedAppointment && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => {
              setSelectedAppointment(null);
              setIsEditing(false);
            }}
          >
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsEditing(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
              >
                <X size={24} />
              </button>
              {isEditing ? (
                <form onSubmit={handleUpdateAppointment}>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Appointment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-600">Patient</label>
                      <SearchableInput value={editingData.patient} onChange={(e) => setEditingData((prev) => ({ ...prev, patient: e.target.value }))} itemList={patientList} displayKey="name" placeholder="Search patient" name="patient" />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-600">Doctor</label>
                      <select name="doctor" value={editingData.doctor} onChange={(e) => setEditingData((prev) => ({ ...prev, doctor: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                        {doctorList.map((doc) => (
                          <option key={doc._id} value={doc._id}>
                            {doc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-600">Date & Time</label>
                      <input type="datetime-local" name="dateTime" value={editingData.dateTime} onChange={(e) => setEditingData((prev) => ({ ...prev, dateTime: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-600">Notes</label>
                      <textarea name="notes" value={editingData.notes} onChange={(e) => setEditingData((prev) => ({ ...prev, notes: e.target.value }))} rows="3" className="w-full px-3 py-2 border rounded-md"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <button type="button" onClick={() => handleOpenDeleteModal(selectedAppointment._id)} className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800">
                      <Trash2 size={16} /> Delete
                    </button>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">
                        Cancel
                      </button>
                      <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedAppointment.patientDisplayName}</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-3">
                      <CalendarIcon size={18} className="text-gray-400" />
                      <span>{format(parseISO(selectedAppointment.date), "EEEE, MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-gray-400" />
                      <span>{format(new Date(selectedAppointment.dateTime), "p")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-gray-400" />
                      <span>{selectedAppointment.patientDisplayName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Stethoscope size={18} className="text-gray-400" />
                      <span>{selectedAppointment.doctorDisplayName}</span>
                    </div>
                    <div>
                      <strong className="block mb-1">Notes:</strong>
                      <p className="bg-gray-50 p-3 rounded-md border text-sm">{selectedAppointment.notes || "No notes provided."}</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 mt-4 border-t">
                    <button onClick={handleEditClick} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
                      <Edit size={16} /> Edit Appointment
                    </button>
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
