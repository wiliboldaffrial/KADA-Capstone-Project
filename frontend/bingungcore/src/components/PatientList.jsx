// src/components/PatientList.js

import React, { useEffect, useState } from "react";

import axios from "axios";

import Checkup from "./Checkup";

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("/api/patients");

        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleAddCheckup = (checkup) => {
    const updatedPatient = {
      ...selectedPatient,

      checkups: [...selectedPatient.checkups, checkup],
    };

    setSelectedPatient(updatedPatient);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Patient List</h2>

      <ul className="list-none">
        {patients.map((patient) => (
          <li key={patient._id} onClick={() => handlePatientClick(patient)} className="cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-100">
            {patient.name} - {patient.phone}
          </li>
        ))}
      </ul>

      {selectedPatient && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">{selectedPatient.name} Details</h3>

          <p className="mt-2">Phone: {selectedPatient.phone}</p>

          <p className="mt-2">Address: {selectedPatient.address}</p>

          <div className="mt-4 flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => console.log("Edit Checkup")}>
              Edit Checkup
            </button>

            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => console.log("Delete Checkup")}>
              Delete Checkup
            </button>
          </div>

          <Checkup patientId={selectedPatient._id} onAddCheckup={handleAddCheckup} />
        </div>
      )}
    </div>
  );
};

export default PatientList;
