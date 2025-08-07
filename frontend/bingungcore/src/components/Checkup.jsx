import React, { useState } from "react";
import axios from "axios";

const Checkup = ({ patientId, onAddCheckup }) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [details, setDetails] = useState("");
  const handleAddCheckup = async () => {
    try {
      const response = await axios.post("/api/checkups", {
        patientId: patientId,
        date: date,
        details: details,
      });
      onAddCheckup(response.data);
    } catch (error) {
      console.error("Error adding checkup:", error);
    }
  };

  return (
    <div clasName="mt-4">
      <h4 className="font-semibold">Add Checkup</h4>
      <div className="mt-2 flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Checkup details" className="border p-2 rounded w-full"></textarea>
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={handleAddCheckup}>
        Add Checkup
      </button>
    </div>
  );
};

export default Checkup;
