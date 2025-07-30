import React from 'react';
import { IconCaretUp, IconCaretDown } from './Icons';
import ExpandedPatientDetails from './ExpandedPatientDetails';

const PatientItem = ({ patient, onToggle, isExpanded }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between p-4">
            <p className="text-lg font-medium text-gray-800">{patient.name}</p>
            <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold px-4 py-1 rounded-full border bg-blue-100 text-blue-600 border-blue-300">{patient.status}</span>
                <button onClick={() => onToggle(patient.id)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                    {isExpanded ? <IconCaretUp /> : <IconCaretDown />}
                </button>
            </div>
        </div>
        {isExpanded && <ExpandedPatientDetails patient={patient} />}
    </div>
);

export default PatientItem;