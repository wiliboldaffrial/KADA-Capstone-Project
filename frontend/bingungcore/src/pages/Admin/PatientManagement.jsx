import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../../components/Modal'; // Make sure this path is correct
import SideBar from '../../components/SideBar';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/patients';

const PatientManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [patients, setPatients] = useState([]); // Initial state is an empty array
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ nik: '', name: '', gender: '', birthdate: '', bloodType: '', contact: '', address: '', medicalHistory: '' });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatientData, setEditingPatientData] = useState(null);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // --- API Communication ---

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Assumes token is stored in localStorage after login
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      // Calculate age for each patient before setting the state
      const patientsWithAge = response.data.map(p => ({
        ...p,
        age: p.birthdate ? new Date().getFullYear() - new Date(p.birthdate).getFullYear() : 'N/A',
      }));
      setPatients(patientsWithAge);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      alert('Failed to fetch patients. Please make sure you are logged in.');
    }
  };

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.nik) {
      alert('Please fill in at least the NIK and Name fields.');
      return;
    }
    try {
      await axios.post(API_URL, newPatient, getAuthHeaders());
      alert('Patient successfully added!');
      setShowAddForm(false);
      setNewPatient({ nik: '', name: '', gender: '', birthdate: '', bloodType: '', contact: '', address: '', medicalHistory: '' });
      fetchPatients(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error adding patient:', error);
      alert(`Error: ${error.response?.data?.message || 'Could not add patient.'}`);
    }
  };

const handleUpdatePatient = async (e) => {
  e.preventDefault();
  try {
    // This sends the complete, updated patient data object to the API.
    await axios.put(
      `${API_URL}/${editingPatientData._id}`, 
      editingPatientData, // The entire state object is sent as the body.
      getAuthHeaders()
    );

    alert('Patient details successfully updated!');
    setIsEditModalOpen(false);
    fetchPatients(); // Re-fetch to update the list with new data.
  } catch (error) {
    console.error('Error updating patient:', error);
    alert(`Error: ${error.response?.data?.message || 'Could not update patient.'}`);
  }
};

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/${patientId}`, getAuthHeaders());
        alert('Patient successfully deleted!');
        setIsEditModalOpen(false); // Also close the edit modal if deletion happens from there
        fetchPatients(); // Re-fetch to update the list
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert(`Error: ${error.response?.data?.message || 'Could not delete patient.'}`);
      }
    }
  };

  // --- Helper Functions for UI ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPatientData(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleSeeDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (patient) => {
    // Format birthdate for the date input if it exists
    const patientData = {
        ...patient,
        birthdate: patient.birthdate ? new Date(patient.birthdate).toISOString().split('T')[0] : ''
    }
    setEditingPatientData(patientData);
    setIsEditModalOpen(true);
  };
  
  const formFields = [
    { name: 'nik', label: 'NIK', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { name: 'birthdate', label: 'Birthdate', type: 'date' },
    { name: 'bloodType', label: 'Blood Type', type: 'select', options: ['A', 'B', 'AB', 'O'] },
    { name: 'contact', label: 'Contact', type: 'text' },
    { name: 'address', label: 'Address', type: 'textarea' },
    { name: 'medicalHistory', label: 'Medical History', type: 'textarea' },
  ];

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin - Patient Management</h1>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              {showAddForm ? '×' : 'Add New Patient'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Patient</h2>
              <form onSubmit={handleAddPatient}>
                <div className="grid grid-cols-2 gap-4">
                  {formFields.map(field => (
                    <div key={field.name} className="flex flex-col">
                      <label htmlFor={field.name} className="mb-1 text-sm font-medium text-gray-600">{field.label}</label>
                      {field.type === 'select' ? (
                        <select id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value="">Select {field.label}</option>
                          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                      ) : (
                        <input type={field.type} id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {patients.map((patient) => (
              // Use patient._id from MongoDB as the key
              <div key={patient._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{patient.nik}</p>
                  <p className="text-gray-700">{patient.name}</p>
                  <p className="text-sm text-gray-500">{patient.gender}, {patient.age} Years Old</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleSeeDetail(patient)} className="bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    See Detail
                  </button>
                  <button onClick={() => handleEdit(patient)} className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Patient Details">
            {selectedPatient && (
              <div className="space-y-3">
                {Object.entries(selectedPatient).map(([key, value]) => {
                  if (key === '_id' || key === 'age' || key === '__v' || key === 'createdAt' || key === 'updatedAt') return null;
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <p className="font-semibold text-gray-600 col-span-1">{formattedKey}</p>
                      <p className="text-gray-800 col-span-2">{key === 'birthdate' ? new Date(value).toLocaleDateString() : value}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </Modal>

          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Patient Information">
            {editingPatientData && (
              <form onSubmit={handleUpdatePatient}>
                <div className="grid grid-cols-2 gap-4">
                  {formFields.map(field => (
                    <div key={field.name} className="flex flex-col">
                      <label htmlFor={`edit-${field.name}`} className="mb-1 text-sm font-medium text-gray-600">{field.label}</label>
                      {field.type === 'select' ? (
                        <select id={`edit-${field.name}`} name={field.name} value={editingPatientData[field.name]} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea id={`edit-${field.name}`} name={field.name} value={editingPatientData[field.name]} onChange={handleEditInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                      ) : (
                        <input type={field.type} id={`edit-${field.name}`} name={field.name} value={editingPatientData[field.name]} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => handleDeletePatient(editingPatientData._id)}
                    className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Patient
                  </button>
                  <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
};

export default PatientManagement;