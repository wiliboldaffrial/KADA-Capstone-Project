import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths, parseISO, parse } from 'date-fns';
import { ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import SideBar from '../../components/SideBar';

// Define a list of doctors for the selection menu
const doctors = ['Dr. Dumbledore', 'Dr. Snape', 'Dr. McGonagall', 'Dr. Sprout'];

const mockAppointments = [
  { id: 1, dateTime: '2025-07-04T14:00', patient: 'Sophia', doctor: 'Dr. Dumbledore', notes: 'Follow-up on previous treatment. Patient reports significant improvement.' },
  { id: 2, dateTime: '2025-07-18T11:00', patient: 'Megan', doctor: 'Dr. Snape', notes: 'Initial consultation for persistent headaches.' },
  { id: 3, dateTime: '2025-07-26T15:00', patient: 'Dani', doctor: 'Dr. Dumbledore', notes: 'Routine annual check-up.' },
  { id: 4, dateTime: '2025-07-27T13:00', patient: 'Manon', doctor: 'Dr. Snape', notes: 'Discuss recent lab results and adjust medication.' },
  { id: 5, dateTime: `${format(new Date(), 'yyyy-MM-dd')}T09:00`, patient: 'Lara', doctor: 'Dr. Dumbledore', notes: 'New patient intake and initial assessment.' },
].map(app => ({ // Derive date and time for display
  ...app,
  date: format(new Date(app.dateTime), 'yyyy-MM-dd'),
  time: format(new Date(app.dateTime), 'h:mm a')
}));


const AppointmentSchedule = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [showAddForm, setShowAddForm] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [newAppointment, setNewAppointment] = useState({ patientName: '', doctor: '', dateTime: '', notes: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    if (!newAppointment.dateTime || !newAppointment.doctor) {
      alert('Please fill out all required fields.');
      return;
    }
    const appointmentDate = new Date(newAppointment.dateTime);
    const newEntry = {
      id: Date.now(),
      dateTime: newAppointment.dateTime,
      date: format(appointmentDate, 'yyyy-MM-dd'),
      time: format(appointmentDate, 'h:mm a'),
      patient: newAppointment.patientName,
      doctor: newAppointment.doctor,
      notes: newAppointment.notes,
    };
    setAppointments([newEntry, ...appointments]);
    alert('Appointment successfully added!');
    setShowAddForm(false);
    setNewAppointment({ patientName: '', doctor: '', dateTime: '', notes: '' });
  };

  const handleEditClick = () => {
    setEditingData({ ...selectedAppointment });
    setIsEditing(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateAppointment = (e) => {
    e.preventDefault();
    const appointmentDate = new Date(editingData.dateTime);
    const updatedAppointment = {
        ...editingData,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'h:mm a'),
    };

    const updatedAppointments = appointments.map(app =>
        app.id === updatedAppointment.id ? updatedAppointment : app
    );
    setAppointments(updatedAppointments);
    alert('Appointment successfully updated!');
    setSelectedAppointment(updatedAppointment);
    setIsEditing(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
        setAppointments(appointments.filter(app => app.id !== appointmentId));
        alert('Appointment successfully deleted!');
        setSelectedAppointment(null);
        setIsEditing(false);
    }
  };

  const goToNextMonth = () => setCurrentDate(prevDate => addMonths(prevDate, 1));
  const goToPreviousMonth = () => setCurrentDate(prevDate => subMonths(prevDate, 1));

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const startingDayIndex = getDay(firstDayOfMonth);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar}/>
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16': 'ml-64'}`}>
          {/* Add Appointment Form */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin - Appointment Schedule</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {showAddForm ? '×' : 'Add New Appointment'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Appointment</h2>
              <form onSubmit={handleAddAppointment}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="patientName" className="mb-1 text-sm font-medium text-gray-600">Patient's Name</label>
                    <input type="text" id="patientName" name="patientName" value={newAppointment.patientName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                  {/* MODIFIED: Doctor text input changed to select */}
                  <div className="flex flex-col">
                    <label htmlFor="doctor" className="mb-1 text-sm font-medium text-gray-600">Doctor</label>
                    <select id="doctor" name="doctor" value={newAppointment.doctor} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                        <option value="" disabled>Select a doctor</option>
                        {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="dateTime" className="mb-1 text-sm font-medium text-gray-600">Date & Time</label>
                    <input type="datetime-local" id="dateTime" name="dateTime" value={newAppointment.dateTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="notes" className="mb-1 text-sm font-medium text-gray-600">Notes</label>
                    <textarea id="notes" name="notes" value={newAppointment.notes} onChange={handleInputChange} rows="1" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
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

          {/* Calendar View */}
          <div className="bg-white rounded-lg drop-shadow-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-4 bg-blue-600">
              <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft className="w-6 h-6 text-blue-200" />
              </button>
              <h2 className="text-xl font-semibold text-white px-20 py-4 rounded-lg">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
                <ChevronRight className="w-6 h-6 text-blue-200" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-gray-600 border-b mb-2 pb-2">
              {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: startingDayIndex }).map((_, index) => (
                <div key={`empty-${index}`} className="border-r border-b"></div>
              ))}
              {daysInMonth.map((day, index) => {
                const dayAppointments = appointments.filter(app => app.date === format(day, 'yyyy-MM-dd'));
                return (
                  <div key={index} className="border-r border-b p-2 h-36 relative">
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-800'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                      {dayAppointments.map(app => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedAppointment(app)}
                          className="bg-blue-500 text-white text-xs rounded-md p-1 truncate cursor-pointer hover:bg-blue-700"
                        >
                          {app.patient} - {app.time}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details/Edit Modal */}
          {selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in">
                <button
                  onClick={() => { setSelectedAppointment(null); setIsEditing(false); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
                >
                  <X size={24} />
                </button>
                
                {isEditing ? (
                    /* Edit Form View */
                    <form onSubmit={handleUpdateAppointment}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Appointment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col">
                                <label htmlFor="edit-patient" className="mb-1 text-sm font-medium text-gray-600">Patient's Name</label>
                                <input type="text" id="edit-patient" name="patient" value={editingData.patient} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            {/* MODIFIED: Doctor text input changed to select */}
                            <div className="flex flex-col">
                                <label htmlFor="edit-doctor" className="mb-1 text-sm font-medium text-gray-600">Doctor</label>
                                <select id="edit-doctor" name="doctor" value={editingData.doctor} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                                    {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="edit-dateTime" className="mb-1 text-sm font-medium text-gray-600">Date & Time</label>
                                <input type="datetime-local" id="edit-dateTime" name="dateTime" value={editingData.dateTime} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="edit-notes" className="mb-1 text-sm font-medium text-gray-600">Notes</label>
                                <textarea id="edit-notes" name="notes" value={editingData.notes} onChange={handleEditInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <button type="button" onClick={() => handleDeleteAppointment(selectedAppointment.id)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition">
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
                    /* Details View */
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex-grow">Appointment Details</h3>
                        </div>
                        <div className="space-y-4 text-gray-700">
                          <p><strong>Date:</strong> {format(parseISO(selectedAppointment.date), 'EEEE, MMMM d, yyyy')}</p>
                          <p><strong>Time:</strong> {selectedAppointment.time}</p>
                          <p><strong>Patient:</strong> {selectedAppointment.patient}</p>
                          <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
                          <div>
                            <strong className="block mb-1">Notes:</strong>
                            <p className="bg-gray-50 p-3 rounded-md border text-sm">{selectedAppointment.notes || 'No notes provided.'}</p>
                          </div>
                          <div className="flex justify-end pt-4">
                            <button
                              onClick={handleEditClick}
                              className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
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
      </div>
      
    </>
    
  );
};

export default AppointmentSchedule;