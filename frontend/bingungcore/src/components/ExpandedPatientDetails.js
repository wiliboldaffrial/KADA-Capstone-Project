import React, { useState } from 'react';

const ExpandedPatientDetails = ({ patient, onAddCheckup }) => {
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [isAddingCheckup, setIsAddingCheckup] = useState(false);
  const [newCheckup, setNewCheckup] = useState({
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
    const { weight, height, bloodPressure, temperature, notes } = newCheckup;

    // Build checkup payload
    const checkupData = {
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      height: parseFloat(height),
      bloodPressure,
      temperature: parseFloat(temperature),
      notes,
    };

    try {
      await onAddCheckup(patient._id, checkupData);

      // Reset local state after success
      setNewCheckup({
        weight: '',
        height: '',
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
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border-t">
      {/* Left Column */}
      <div className="flex flex-col space-y-4">
        <div className="p-4 bg-white rounded-lg border flex-grow">
          <h4 className="font-bold mb-3">Checkup History</h4>
          <div className="space-y-2 mb-4">
            {(patient.checkups || []).map((checkup, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
              >
                <span>{new Date(checkup.date).toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    setSelectedCheckup(checkup);
                    setIsAddingCheckup(false);
                  }}
                  className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-600"
                >
                  Detail
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setIsAddingCheckup(true);
              setSelectedCheckup(null);
            }}
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
          >
            Add New Checkup
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="p-4 bg-white rounded-lg border">
        <h4 className="font-bold mb-2">Details</h4>
        {isAddingCheckup ? (
          <div className="flex flex-col space-y-2">
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={newCheckup.weight}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-sm"
            />
            <input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={newCheckup.height}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-sm"
            />
            <input
              type="text"
              name="bloodPressure"
              placeholder="Blood Pressure (e.g. 120/80)"
              value={newCheckup.bloodPressure}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-sm"
            />
            <input
              type="number"
              name="temperature"
              placeholder="Temperature (°C)"
              value={newCheckup.temperature}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-sm"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              rows="4"
              value={newCheckup.notes}
              onChange={handleInputChange}
              className="p-2 border rounded-md text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        ) : selectedCheckup ? (
          <div className="text-sm space-y-2">
            <p><strong>Date:</strong> {new Date(selectedCheckup.date).toLocaleString()}</p>
            <p><strong>Weight:</strong> {selectedCheckup.weight} kg</p>
            <p><strong>Height:</strong> {selectedCheckup.height} cm</p>
            <p><strong>Blood Pressure:</strong> {selectedCheckup.bloodPressure}</p>
            <p><strong>Temperature:</strong> {selectedCheckup.temperature} °C</p>
            <p><strong>Notes:</strong></p>
            <p className="p-2 bg-gray-100 rounded-md whitespace-pre-wrap">{selectedCheckup.notes}</p>
          </div>
        ) : (
          <div className="text-sm text-gray-500 flex items-center justify-center h-full">
            <p>Select a checkup to see details or add a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandedPatientDetails;
