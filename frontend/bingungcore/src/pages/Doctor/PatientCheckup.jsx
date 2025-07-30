import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import SideBar from '../../components/SideBar';

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
      details: "Initial Checkup by Nurse\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
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
  
  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar}/>
      
      <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Doctor - Patient Checkup</h1>
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
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedCheckup.details}</p>
                </div>
                {/* AI Response Section */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-2">AI Response (Optional)</p>
                  <textarea
                    className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AI generated response will appear here..."
                  />
                  <div className="flex justify-between mt-4">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Save
                    </button>
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
