import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Link, Home } from 'lucide-react';
import SideBar from '../../components/SideBar';

//Mock Patient Data
// This data is used to simulate the patient information and checkups.
const mockPatient = {
  id: "KAMC123456789",
  name: "Sam Strand",
  age: "32",
  type: "2 Diabetes",
  status: "Scheduled",
  checkups: [
    {
      id: 1,
      date: "12 February 2025",
      details: 
      `
      Weight: 75kg
      Height: 180cm
      Blood Pressure: 120/80 mmHg
      Heart Rate: 72 bpm
      Temperature: 36.5°C
      Notes: Patient reports no significant issues. Regular checkup scheduled for next month.
      `
    },
    {
      id: 2,
      date: "24 February 2025",
      details: "Follow-up checkup"
    },
    {
      id: 3,
      date: "20 March 2025",
      details: "Regular checkup"
    }
  ]
};

const PatientCheckup = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(mockPatient.checkups[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleSaveNotes = () => {
    console.log("Doctor's Notes Saved:", doctorNotes);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar}/>
      
      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Doctor - Patient Checkup</h1>
              <Link 
                to="/doctor/patients" 
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Home size={20} />
                All Patients
              </Link>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                Filter
              </button>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <ArrowUpDown className="w-5 h-5" />
                Sort
              </button>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{mockPatient.name}</h2>
                <div className="mt-2 space-y-1 text-gray-600">
                  <p>ID: {mockPatient.id}</p>
                  <p>Age: {mockPatient.age}</p>
                  <p>Type: {mockPatient.type}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {mockPatient.status}
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Checkup List */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                {mockPatient.checkups.map((checkup) => (
                  <button
                    key={checkup.id}
                    onClick={() => setSelectedCheckup(checkup)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedCheckup.id === checkup.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium">Checkup {checkup.id}</p>
                    <p className="text-sm text-gray-600">{checkup.date}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkup Details */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Detail</h3>
                {selectedCheckup.id === 1 ? (
                  // Read-only nurse checkup details
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedCheckup.details}</p>
                  </div>
                ) : (
                  // Editable doctor's notes
                  <textarea
                    className="w-full h-48 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter your medical notes here..."
                  />
                )}

                {/* AI Response Section */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-2">AI Response</p>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                    {aiResponse || 'AI insights will appear here after consultation'}
                  </div>
                  <div className="flex justify-between mt-4">
                    {selectedCheckup.id !== 1 && (
                      <button 
                        onClick={handleSaveNotes}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Save Notes
                      </button>
                    )}
                    <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                      <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                      Consult with AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCheckup;
