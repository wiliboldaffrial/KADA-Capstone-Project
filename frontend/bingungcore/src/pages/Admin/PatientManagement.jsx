import React, { useState, useEffect, useMemo } from "react";
import { UserPlus, Trash2, Search, ArrowUp, ArrowDown, Edit, Eye, User, Users } from "lucide-react";
import Modal from "../../components/Modal";
import ConfirmationModal from "../../components/ConfirmationModal";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = `${process.env.REACT_APP_API_URL}/api/patients`;

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ nik: "", name: "", gender: "Male", birthdate: "", bloodType: "A", contact: "", address: "", medicalHistory: "" });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatientData, setEditingPatientData] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // NEW: State for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      const patientsWithAge = response.data.map((p) => ({
        ...p,
        age: p.birthdate ? new Date().getFullYear() - new Date(p.birthdate).getFullYear() : "N/A",
      }));
      setPatients(patientsWithAge);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to fetch patients. Please log in.");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // NEW: Memoized hook for processing patients (search and sort)
  const processedPatients = useMemo(() => {
    let filteredPatients = [...patients];

    if (searchTerm) {
      filteredPatients = filteredPatients.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nik.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortConfig.key !== null) {
      filteredPatients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredPatients;
  }, [patients, searchTerm, sortConfig]);

  // NEW: Handler for sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.nik) {
      toast.error("Please fill in at least the NIK and Name fields.");
      return;
    }
    try {
      await axios.post(API_URL, newPatient, getAuthHeaders());
      toast.success("Patient successfully added!");
      setShowAddForm(false);
      setNewPatient({ nik: "", name: "", gender: "Male", birthdate: "", bloodType: "A", contact: "", address: "", medicalHistory: "" });
      fetchPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error(error.response?.data?.message || "Could not add patient.");
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${editingPatientData._id}`, editingPatientData, getAuthHeaders());
      toast.success("Patient details successfully updated!");
      setIsEditModalOpen(false);
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error(error.response?.data?.message || "Could not update patient.");
    }
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      try {
        await axios.delete(`${API_URL}/${patientToDelete}`, getAuthHeaders());
        toast.success("Patient successfully deleted!");
        setIsEditModalOpen(false); // Close edit modal if open
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error(error.response?.data?.message || "Could not delete patient.");
      } finally {
        setDeleteModalOpen(false);
        setPatientToDelete(null);
      }
    }
  };

  const handleOpenDeleteModal = (patientId) => {
    setPatientToDelete(patientId);
    setDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPatientData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSeeDetail = (patient) => {
    setSelectedPatient(patient);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (patient) => {
    const patientData = {
      ...patient,
      birthdate: patient.birthdate ? new Date(patient.birthdate).toISOString().split("T")[0] : "",
    };
    setEditingPatientData(patientData);
    setIsEditModalOpen(true);
  };

  const renderValue = (key, value) => {
    if (value === null || value === undefined || value === "") return <span className="text-gray-400">N/A</span>;
    if (key === "birthdate") return new Date(value).toLocaleDateString();
    return String(value);
  };

  const formFields = [
    { name: "nik", label: "NIK", type: "text" },
    { name: "name", label: "Name", type: "text" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "birthdate", label: "Birthdate", type: "date" },
    { name: "bloodType", label: "Blood Type", type: "select", options: ["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { name: "contact", label: "Contact", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "medicalHistory", label: "Medical History", type: "textarea" },
  ];

  return (
    <>
      <div className="p-8 bg-gray-50 min-h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Patient Management</h1>
            <p className="text-gray-500 mt-1">Add, view, and manage all patient records.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
            <UserPlus size={20} />
            {showAddForm ? "Cancel" : "Add New Patient"}
          </button>
        </header>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 transition-all">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">New Patient Form</h2>
            <form onSubmit={handleAddPatient}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formFields.map((field) => (
                  <div key={field.name} className={`flex flex-col ${field.type === "textarea" ? "col-span-full" : ""}`}>
                    <label htmlFor={field.name} className="mb-1 text-sm font-medium text-gray-600">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        value={newPatient[field.name]}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    ) : (
                      <input type={field.type} id={field.name} name={field.name} value={newPatient[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button type="submit" className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by patient name or NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 bg-gray-50 px-4 py-2 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  {["name", "nik", "age", "gender", "contact"].map((key) => (
                    <th key={key} scope="col" className="px-6 py-3">
                      <button onClick={() => requestSort(key)} className="flex items-center gap-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig.key === key ? sortConfig.direction === "ascending" ? <ArrowUp size={14} /> : <ArrowDown size={14} /> : null}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedPatients.map((patient) => (
                  <tr key={patient._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{patient.name}</td>
                    <td className="px-6 py-4">{patient.nik}</td>
                    <td className="px-6 py-4">{patient.age}</td>
                    <td className="px-6 py-4">{patient.gender}</td>
                    <td className="px-6 py-4">{patient.contact || "N/A"}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleSeeDetail(patient)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(patient)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-md">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleOpenDeleteModal(patient._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {processedPatients.length === 0 && (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Patients Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or add a new patient.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Patient Details">
        {selectedPatient && (
          <div className="space-y-3 max-h-96 overflow-y-auto p-1">
            {formFields.map((field) => {
              if (field.name === "medicalHistory") return null; // Hide long fields for brevity
              return (
                <div key={field.name} className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-2">
                  <p className="font-semibold text-gray-600 col-span-1">{field.label}</p>
                  <div className="text-gray-800 col-span-2">{renderValue(field.name, selectedPatient[field.name])}</div>
                </div>
              );
            })}
            <div className="pt-2">
              <p className="font-semibold text-gray-600 mb-1">Medical History</p>
              <div className="text-gray-800 bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">{selectedPatient.medicalHistory || "N/A"}</div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Patient Information">
        {editingPatientData && (
          <form onSubmit={handleUpdatePatient}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.name} className={`flex flex-col ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                  <label htmlFor={`edit-${field.name}`} className="mb-1 text-sm font-medium text-gray-600">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={`edit-${field.name}`}
                      name={field.name}
                      value={editingPatientData[field.name]}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`edit-${field.name}`}
                      name={field.name}
                      value={editingPatientData[field.name]}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  ) : (
                    <input
                      type={field.type}
                      id={`edit-${field.name}`}
                      name={field.name}
                      value={editingPatientData[field.name]}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Patient" confirmText="Delete">
        Are you sure you want to delete this patient? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
};

export default PatientManagement;
