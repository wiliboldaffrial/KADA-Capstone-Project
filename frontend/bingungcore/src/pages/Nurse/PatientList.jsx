// src/pages/nurse/PatientList.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronUp, PlusCircle, Trash2 } from "lucide-react";
import SideBar from "../../components/SideBar";
import ConfirmationModal from "../../components/ConfirmationModal";

// --- Helper Component defined in the same file ---

const PatientItem = ({ patient, onToggle, isExpanded, onAddCheckup, onDeleteCheckup }) => {
  const [showCheckupDetails, setShowCheckupDetails] = useState(null);
  const [showAddCheckupForm, setShowAddCheckupForm] = useState(false);
  const [newCheckupData, setNewCheckupData] = useState({ weight: "", height: "", bloodPressure: "", notes: "" });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newCheckup = {
      id: `c${Date.now()}`,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      details: newCheckupData,
    };
    onAddCheckup(patient.id, newCheckup);
    setShowAddCheckupForm(false);
    setNewCheckupData({ weight: "", height: "", bloodPressure: "", notes: "" });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-white cursor-pointer hover:bg-gray-50" onClick={() => onToggle(patient.id)}>
        <p className="font-semibold text-gray-800">{patient.name}</p>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${patient.status === "Scheduled" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>{patient.status}</span>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Checkup History */}
            <div>
              <h4 className="font-bold text-gray-700 mb-3">Checkup History</h4>
              <div className="space-y-2">
                {patient.checkups.length > 0 ? (
                  patient.checkups
                    .slice()
                    .reverse()
                    .map((checkup) => (
                      <div key={checkup.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                        <p className="text-gray-700">{checkup.date}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCheckup(patient.id, checkup.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition"
                            aria-label="Delete checkup"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button onClick={() => setShowCheckupDetails(showCheckupDetails?.id === checkup.id ? null : checkup)} className="bg-blue-500 text-white font-semibold px-4 py-1.5 text-sm rounded-md hover:bg-blue-600 transition">
                            Detail
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 italic">No checkup history found.</p>
                )}
              </div>
              <button onClick={() => setShowAddCheckupForm(true)} className="mt-4 flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition">
                <PlusCircle size={18} /> Add New Checkup
              </button>
            </div>

            {/* Details Section */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-bold text-gray-700 mb-3">{showAddCheckupForm ? "New Checkup Form" : showCheckupDetails ? `Details for ${showCheckupDetails.date}` : "Details"}</h4>
              {showAddCheckupForm ? (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <input type="text" placeholder="Weight (e.g., 75kg)" value={newCheckupData.weight} onChange={(e) => setNewCheckupData({ ...newCheckupData, weight: e.target.value })} className="w-full p-2 border rounded-md" />
                  <input type="text" placeholder="Height (e.g., 180cm)" value={newCheckupData.height} onChange={(e) => setNewCheckupData({ ...newCheckupData, height: e.target.value })} className="w-full p-2 border rounded-md" />
                  <input
                    type="text"
                    placeholder="Blood Pressure (e.g., 120/80 mmHg)"
                    value={newCheckupData.bloodPressure}
                    onChange={(e) => setNewCheckupData({ ...newCheckupData, bloodPressure: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                  <textarea placeholder="Notes..." value={newCheckupData.notes} onChange={(e) => setNewCheckupData({ ...newCheckupData, notes: e.target.value })} className="w-full p-2 border rounded-md" rows="3"></textarea>
                  <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                    Save Checkup
                  </button>
                </form>
              ) : showCheckupDetails ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Weight:</strong> {showCheckupDetails.details.weight}
                  </p>
                  <p>
                    <strong>Height:</strong> {showCheckupDetails.details.height}
                  </p>
                  <p>
                    <strong>Blood Pressure:</strong> {showCheckupDetails.details.bloodPressure}
                  </p>
                  <p>
                    <strong>Notes:</strong> {showCheckupDetails.details.notes}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Select a checkup to see details or add a new one.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---

const initialPatients = [
  {
    id: 1,
    name: "Sam Strand",
    status: "Scheduled",
    details: { idNumber: "3201012345678", gender: "Male", dob: "23 April 1981", bloodType: "B", phone: "62 888 123 4567", address: "Jl Sekolah Hijau", condition: "Type 2 Diabetes" },
    checkups: [
      { id: "c1", date: "12 February 2025", details: { weight: "75kg", height: "180cm", bloodPressure: "120/80 mmHg", notes: "Patient feels well. Continue current medication." } },
      { id: "c2", date: "24 February 2025", details: { weight: "74.5kg", height: "180cm", bloodPressure: "118/78 mmHg", notes: "Slight improvement in blood sugar levels." } },
    ],
  },
  { id: 2, name: "Jokowi", status: "Scheduled", details: { idNumber: "3201019876543", gender: "Male", dob: "21 June 1961", bloodType: "A", phone: "62 812 987 6543", address: "Istana Bogor", condition: "General Checkup" }, checkups: [] },
  { id: 3, name: "HeartMan", status: "Scheduled", details: { idNumber: "3201011122334", gender: "Male", dob: "15 May 1975", bloodType: "O", phone: "62 811 112 2334", address: "Central Knot City", condition: "Arrhythmia" }, checkups: [] },
];

const PatientList = () => {
  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : initialPatients;
  });

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  const [expandedPatientId, setExpandedPatientId] = useState(null);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [checkupToDelete, setCheckupToDelete] = useState({ patientId: null, checkupId: null });

  const handleToggleExpand = (patientId) => {
    setExpandedPatientId((currentId) => (currentId === patientId ? null : patientId));
  };

  const handleAddNewCheckup = (patientId, newCheckup) => {
    const updatedPatients = patients.map((p) => {
      if (p.id === patientId) {
        const updatedCheckups = [...p.checkups, newCheckup];
        return { ...p, checkups: updatedCheckups };
      }
      return p;
    });
    setPatients(updatedPatients);
    toast.success("New checkup added successfully!");
  };

  const handleOpenDeleteModal = (patientId, checkupId) => {
    setCheckupToDelete({ patientId, checkupId });
    setDeleteModalOpen(true);
  };

  const handleDeleteCheckup = () => {
    const { patientId, checkupId } = checkupToDelete;
    if (!patientId || !checkupId) {
      toast.error("Could not delete checkup. Invalid ID.");
      return;
    }

    try {
      const updatedPatients = patients.map((p) => {
        if (p.id === patientId) {
          const updatedCheckups = p.checkups.filter((c) => c.id !== checkupId);
          return { ...p, checkups: updatedCheckups };
        }
        return p;
      });
      setPatients(updatedPatients);
      toast.success("Checkup record deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete checkup record.");
      console.error("Deletion Error:", error);
    } finally {
      setDeleteModalOpen(false);
      setCheckupToDelete({ patientId: null, checkupId: null });
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSideBar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <SideBar isCollapsed={isCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
          <main className="p-8 overflow-y-auto h-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient List</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-3">
                {patients.map((patient) => (
                  <PatientItem key={patient.id} patient={patient} onToggle={handleToggleExpand} isExpanded={expandedPatientId === patient.id} onAddCheckup={handleAddNewCheckup} onDeleteCheckup={handleOpenDeleteModal} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteCheckup} title="Delete Checkup Record" confirmText="Delete">
        <p>
          Are you sure you want to delete this checkup record? <br /> This action cannot be undone.
        </p>
      </ConfirmationModal>
    </>
  );
};

export default PatientList;
