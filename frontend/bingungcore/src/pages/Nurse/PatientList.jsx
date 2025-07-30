import React, { useState } from 'react';
import PatientItem from '../../components/PatientItem';
import { IconMagnifyingGlass } from '../../components/Icons';
import SideBar from "../../components/SideBar";

// Mock data would typically be fetched from an API here
const patients = [
    { 
        id: 1, 
        name: 'Sam Strand', 
        status: 'Scheduled',
        details: {
            idNumber: '3201012345678',
            gender: 'Male',
            dob: '23 April 1981',
            bloodType: 'B',
            phone: '62 888 123 4567',
            address: 'Jl Sekolah Hijau',
            condition: 'Type 2 Diabetes'
        },
        checkups: [
            { id: 'c1', date: '12 February 2025', details: { weight: '75kg', height: '180cm', bloodPressure: '120/80 mmHg', notes: 'Patient feels well. Continue current medication.' } },
            { id: 'c2', date: '24 February 2025', details: { weight: '74.5kg', height: '180cm', bloodPressure: '118/78 mmHg', notes: 'Slight improvement in blood sugar levels.' } },
        ]
    },
    { id: 2, name: 'Jokowi', status: 'Scheduled', details: { idNumber: '3201019876543', gender: 'Male', dob: '21 June 1961', bloodType: 'A', phone: '62 812 987 6543', address: 'Istana Bogor', condition: 'General Checkup' }, checkups: [] },
    { id: 3, name: 'HeartMan', status: 'Scheduled', details: { idNumber: '3201011122334', gender: 'Male', dob: '15 May 1975', bloodType: 'O', phone: '62 811 112 2334', address: 'Central Knot City', condition: 'Arrhythmia' }, checkups: [] },
    { id: 4, name: 'Lockne', status: 'Scheduled', details: { idNumber: '3201015566778', gender: 'Female', dob: '10 October 1988', bloodType: 'AB', phone: '62 877 556 6778', address: 'Mountain Knot City', condition: 'Post-surgery recovery' }, checkups: [] },
    { id: 5, name: 'Cliff', status: 'Scheduled', details: { idNumber: '3201014433221', gender: 'Male', dob: '01 January 1960', bloodType: 'B', phone: '62 855 443 3221', address: 'War Zone', condition: 'PTSD' }, checkups: [] },
    { id: 6, name: 'Lou', status: 'Scheduled', details: { idNumber: 'N/A', gender: 'Female', dob: 'Unknown', bloodType: 'N/A', phone: 'N/A', address: 'Incubator', condition: 'Bridge Baby' }, checkups: [] },
];

const PatientList = () => {
    const [expandedPatientId, setExpandedPatientId] = useState(null);
    const handleToggleExpand = (patientId) => {
        setExpandedPatientId(currentId => currentId === patientId ? null : patientId);
    };

    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSideBar = () => setIsCollapsed(!isCollapsed);

    return (
    <div className="flex h-screen bg-gray-100">
        <SideBar isCollapsed={isCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
            <main className="p-8 overflow-y-auto h-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Patient List</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-end items-center mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconMagnifyingGlass />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        className="pl-10 pr-4 py-2 border rounded-lg"
                    />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Filter</button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Sort</button>
                </div>
                </div>
                <div className="space-y-3">
                {patients.map((patient) => (
                    <PatientItem
                    key={patient.id}
                    patient={patient}
                    onToggle={handleToggleExpand}
                    isExpanded={expandedPatientId === patient.id}
                    />
                ))}
                </div>
            </div>
            </main>
        </div>
    </div>
    );
};

// The file now exports only the nurse's page component
export default PatientList;