import React, { useState } from 'react';

const ExpandedPatientDetails = ({ patient, onAddCheckup }) => {
    const [selectedCheckup, setSelectedCheckup] = useState(null);
    const [isAddingCheckup, setIsAddingCheckup] = useState(false);
    const [newCheckupNotes, setNewCheckupNotes] = useState("");

    const handleAddClick = () => {
        if (newCheckupNotes.trim() === "") return;

        const newCheckup = {
            id: `c${patient.checkups.length + 1}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            details: { notes: newCheckupNotes }
        };

        // Call the function from the parent to update the main state
        onAddCheckup(patient.id, newCheckup);

        setNewCheckupNotes("");
        setIsAddingCheckup(false);
    };

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border-t">
            {/* Left Column */}
            <div className="flex flex-col space-y-4">
                {/* ... Patient Info Card ... */}
                <div className="p-4 bg-white rounded-lg border flex-grow">
                    <h4 className="font-bold mb-3">Checkup History</h4>
                    <div className="space-y-2 mb-4">
                        {/* Now uses patient.checkups directly from props */}
                        {patient.checkups.map(checkup => (
                            <div key={checkup.id} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <span>{checkup.date}</span>
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
                    <div className="flex flex-col">
                        <textarea
                            value={newCheckupNotes}
                            onChange={(e) => setNewCheckupNotes(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Enter notes for the new checkup..."
                            rows="10"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            {/* This button now calls handleAddClick */}
                            <button onClick={handleAddClick} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                                Add
                            </button>
                        </div>
                    </div>
                ) : selectedCheckup ? (
                    <div className="text-sm space-y-2">
                        <p><strong>Date:</strong> {selectedCheckup.date}</p>
                        <p><strong>Notes:</strong></p>
                        <p className="p-2 bg-gray-100 rounded-md whitespace-pre-wrap">{selectedCheckup.details.notes}</p>
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