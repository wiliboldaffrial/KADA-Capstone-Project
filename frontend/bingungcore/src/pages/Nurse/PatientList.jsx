import React, { useState, useEffect } from "react";
import PatientItem from "../../components/PatientItem";
import { IconMagnifyingGlass } from "../../components/Icons";
import SideBar from "../../components/SideBar";

// Mock data would typically be fetched from an API here

const initialPatients = [
  {
    id: 1,

    name: "Sam Strand",

    status: "Scheduled",

    details: {
      idNumber: "3201012345678",

      gender: "Male",

      dob: "23 April 1981",

      bloodType: "B",

      phone: "62 888 123 4567",

      address: "Jl Sekolah Hijau",

      condition: "Type 2 Diabetes",
    },

    checkups: [
      { id: "c1", date: "12 February 2025", details: { weight: "75kg", height: "180cm", bloodPressure: "120/80 mmHg", notes: "Patient feels well. Continue current medication." } },

      { id: "c2", date: "24 February 2025", details: { weight: "74.5kg", height: "180cm", bloodPressure: "118/78 mmHg", notes: "Slight improvement in blood sugar levels." } },
    ],
  },

  { id: 2, name: "Jokowi", status: "Scheduled", details: { idNumber: "3201019876543", gender: "Male", dob: "21 June 1961", bloodType: "A", phone: "62 812 987 6543", address: "Istana Bogor", condition: "General Checkup" }, checkups: [] },

  { id: 3, name: "HeartMan", status: "Scheduled", details: { idNumber: "3201011122334", gender: "Male", dob: "15 May 1975", bloodType: "O", phone: "62 811 112 2334", address: "Central Knot City", condition: "Arrhythmia" }, checkups: [] },

  {
    id: 4,
    name: "Lockne",
    status: "Scheduled",
    details: { idNumber: "3201015566778", gender: "Female", dob: "10 October 1988", bloodType: "AB", phone: "62 877 556 6778", address: "Mountain Knot City", condition: "Post-surgery recovery" },
    checkups: [],
  },

  { id: 5, name: "Cliff", status: "Scheduled", details: { idNumber: "3201014433221", gender: "Male", dob: "01 January 1960", bloodType: "B", phone: "62 855 443 3221", address: "War Zone", condition: "PTSD" }, checkups: [] },

  { id: 6, name: "Lou", status: "Scheduled", details: { idNumber: "N/A", gender: "Female", dob: "Unknown", bloodType: "N/A", phone: "N/A", address: "Incubator", condition: "Bridge Baby" }, checkups: [] },
];

const PatientList = () => {
    // --- STATE MANAGEMENT FOR PERSISTENCE ---
    const [patients, setPatients] = useState(() => {
        // On initial load, try to get patients from localStorage
        const savedPatients = localStorage.getItem('patients');
        return savedPatients ? JSON.parse(savedPatients) : initialPatients;
    });

    // When the patients state changes, save it to localStorage
    useEffect(() => {
        localStorage.setItem('patients', JSON.stringify(patients));
    }, [patients]);

    // --- HANDLER FUNCTIONS ---
    const [expandedPatientId, setExpandedPatientId] = useState(null);
    const handleToggleExpand = (patientId) => {
        setExpandedPatientId(currentId => currentId === patientId ? null : patientId);
    };

    const handleAddNewCheckup = (patientId, newCheckup) => {
        const updatedPatients = patients.map(p => {
            if (p.id === patientId) {
                // Add the new checkup to the end of the array for descending order
                const updatedCheckups = [...p.checkups, newCheckup];
                return { ...p, checkups: updatedCheckups };
            }
            return p;
        });
        setPatients(updatedPatients);
    };

    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSideBar = () => setIsCollapsed(!isCollapsed);

    return (
        <div className="flex h-screen bg-gray-100">
          <SideBar isCollapsed={isCollapsed} toggleSideBar={toggleSideBar} />

          <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
            <main className="p-8 overflow-y-auto h-full">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient List</h2>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-end items-center mb-6">
                  {/* Search and filter controls */}
                </div>

                <div className="space-y-3">
                  {patients.map((patient) => (
                    <PatientItem
                      key={patient.id}
                      patient={patient}
                      onToggle={handleToggleExpand}
                      isExpanded={expandedPatientId === patient.id}
                      onAddCheckup={handleAddNewCheckup}
                    />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>

    );
};

export default PatientList;