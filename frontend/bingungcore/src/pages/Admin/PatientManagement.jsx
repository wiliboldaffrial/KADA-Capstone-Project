import React, { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import Modal from '../../components/Modal'; // Make sure this path is correct
import SideBar from '../../components/SideBar';
import axios from 'axios';

const initialPatients = [
  { id: 1, nik: '320101012345678', name: 'Alice', gender: 'Female', age: 20, birthdate: '2005-05-10', bloodType: 'O', contact: '081234567890', address: '123 Wonderland Ave', medicalHistory: 'None' },
  { id: 2, nik: '320101023456789', name: 'Elsa', gender: 'Female', age: 22, birthdate: '2003-03-15', bloodType: 'A', contact: '081234567891', address: '456 Arendelle St', medicalHistory: 'Allergy to dust' },
  { id: 3, nik: '320101034567890', name: 'John', gender: 'Male', age: 30, birthdate: '1995-01-20', bloodType: 'B', contact: '081234567892', address: '789 Sherwood Forest', medicalHistory: 'Asthma' },
  { id: 4, nik: '320101045678901', name: 'Doe', gender: 'Male', age: 25, birthdate: '2000-11-25', bloodType: 'AB', contact: '081234567893', address: '101 Nowhere Ln', medicalHistory: 'None' },
];

const PatientManagement = () => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [patients, setPatients] = useState();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ nik: '', name: '', gender: '', birthdate: '', bloodType: '', contact: '', address: '', medicalHistory: '' });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatientData, setEditingPatientData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.nik) {
      alert('Please fill in at least the NIK and Name fields.');
      return;
    }
    const patientToAdd = {
      id: Date.now(),
      ...newPatient,
      age: newPatient.birthdate ? new Date().getFullYear() - new Date(newPatient.birthdate).getFullYear() : 'N/A',
    };
    setPatients([patientToAdd, ...patients]);
    // MODIFIED: Added success alert
    alert('Patient successfully added!');
    setNewPatient({ nik: '', name: '', gender: '', birthdate: '', bloodType: '', contact: '', address: '', medicalHistory: '' });
    setShowAddForm(false);
  };

  const handleSeeDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setEditingPatientData(patient);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPatientData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    const updatedPatientData = {
        ...editingPatientData,
        age: editingPatientData.birthdate ? new Date().getFullYear() - new Date(editingPatientData.birthdate).getFullYear() : 'N/A',
    }
    setPatients(patients.map(p => p.id === updatedPatientData.id ? updatedPatientData : p));
    // MODIFIED: Added success alert
    alert('Patient details successfully updated!');
    setIsEditModalOpen(false);
    setSelectedPatient(null);
  };

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      setPatients(patients.filter(p => p.id !== patientId));
      // MODIFIED: Added success alert
      alert('Patient successfully deleted!');
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    }
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
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar}/>
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16': 'ml-64'}`}>
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
                        <input type={field.type} id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
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
              <div key={patient.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
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
                    if (key === 'id' || key === 'age') return null;
                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                        <div key={key} className="grid grid-cols-3 gap-4">
                            <p className="font-semibold text-gray-600 col-span-1">{formattedKey}</p>
                            <p className="text-gray-800 col-span-2">{value}</p>
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
                        <input type={field.type} id={`edit-${field.name}`} name={field.name} value={editingPatientData[field.name]} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-6">
                    <button
                        type="button"
                        onClick={() => handleDeletePatient(editingPatientData.id)}
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