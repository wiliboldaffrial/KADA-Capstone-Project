import React, { useState } from 'react';

const ExpandedPatientDetails = ({ patient, onAddCheckup }) => {
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isAddingCheckup, setIsAddingCheckup] = useState(false);
  const [newCheckup, setNewCheckup] = useState({
    date: '',
    weight: '',
    height: '',
    bloodPressure: '',
    temperature: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCheckup({ ...newCheckup, [name]: value });
  };

  const handleAddClick = async () => {
    if (!newCheckup.date) return alert("Date is required.");

    const checkupData = {
      date: newCheckup.date,
      weight: parseFloat(newCheckup.weight),
      // height: parseFloat(newCheckup.height),
      bloodPressure: newCheckup.bloodPressure,
      temperature: parseFloat(newCheckup.temperature),
      notes: newCheckup.notes,
    };

    try {
      await onAddCheckup(patient._id, checkupData);

      setNewCheckup({
        date: '',
        weight: '',
        // height: '',
        bloodPressure: '',
        temperature: '',
        notes: ''
      });
      setIsAddingCheckup(false);
      setSelectedCheckup(null);
    } catch (error) {
      console.error('Error adding checkup:', error);
    }
  };

  return (
    <div className="mt-4 p-6 bg-gray-100 rounded-2xl shadow-inner grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Patient Info Details */}
        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Appointment Details</h3>
          <p className="text-sm text-gray-700"><strong>Doctor:</strong> {patient.doctor}</p>
          {patient.notes && (
            <p className="text-sm text-gray-700"><strong>Notes:</strong> {patient.notes}</p>
          )}
        </div>
      {/* Left: Checkup History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Checkup History</h3>
        {patient.checkups?.length > 0 ? (
            patient.checkups.map((checkup, idx) => (
            <div
                key={idx}
                className="bg-white rounded-xl shadow p-3"
            >
                <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                    Checkup {idx + 1} - {checkup.date ? new Date(checkup.date).toLocaleDateString() : 'Invalid date'}
                </span>
                <div className="space-x-2">
                    <button
                    onClick={() =>
                        setSelectedCheckup(selectedCheckup === idx ? null : idx)
                    }
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                    {selectedCheckup === idx ? 'Hide' : 'Detail'}
                    </button>
                    <button className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    🗑
                    </button>
                </div>
                </div>

                {selectedCheckup === idx && (
                <div className="mt-3 text-sm text-gray-700 space-y-1 px-2">
                    <p>Weight: {checkup.weight} kg</p>
                    {/* <p>Height: {checkup.height} cm</p> */}
                    <p>Blood Pressure: {checkup.bloodPressure}</p>
                    <p>Temperature: {checkup.temperature} °C</p>
                    <p>Notes: {checkup.notes || '-'}</p>
                </div>
                )}
            </div>
            ))
        ) : (
            <p className="text-gray-500 text-sm">No checkups yet.</p>
        )}
        </div>


      {/* Right: Add New Checkup */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Add New Checkup</h3>
        <div className="space-y-2 text-sm">
          <input
            type="date"
            name="date"
            value={newCheckup.date}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={newCheckup.weight}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          />
          {/* <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={newCheckup.height}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          /> */}
          <input
            type="text"
            name="bloodPressure"
            placeholder="Blood Pressure (e.g. 120/80)"
            value={newCheckup.bloodPressure}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="temperature"
            placeholder="Temperature (°C)"
            value={newCheckup.temperature}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            name="notes"
            placeholder="Notes / Keluhan"
            value={newCheckup.notes}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded resize-none"
          ></textarea>

          <button
            onClick={handleAddClick}
            className="w-full bg-blue-600 text-white py-2 mt-2 rounded hover:bg-blue-700"
          >
            Add Checkup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpandedPatientDetails;
