import React, { useState } from 'react';
import SideBar from '../../components/SideBar';

// Generates initial mock data for 20 rooms
const initialRooms = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Room ${i + 1}`,
  // Set Room 2 as 'Occupied' initially
  status: i === 1 ? 'Occupied' : 'Available',
}));

const RoomManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
      
  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // State to hold the array of room objects
  const [rooms, setRooms] = useState(initialRooms);

  // Function to toggle the status of a specific room by its ID
  const toggleRoomStatus = (roomId) => {
    setRooms(currentRooms =>
      currentRooms.map(room =>
        room.id === roomId
          ? { ...room, status: room.status === 'Available' ? 'Occupied' : 'Available' }
          : room
      )
    );
  };

  // NEW: Calculate room counts
  const availableCount = rooms.filter(room => room.status === 'Available').length;
  const occupiedCount = rooms.length - availableCount;

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar}/>
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? 'ml-16': 'ml-64'}`}>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin - Room Management</h1>

          {/* NEW: Room Status Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-teal-100 border-l-4 border-teal-500 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-teal-800">Available Rooms</h3>
              <p className="text-4xl font-bold text-teal-600 mt-2">{availableCount}</p>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-yellow-800">Occupied Rooms</h3>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{occupiedCount}</p>
            </div>
          </div>

          {/* Grid container for the room cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map(room => {
              const isOccupied = room.status === 'Occupied';

              // Conditionally set class names based on room status
              const cardClasses = `p-6 rounded-lg shadow-md flex flex-col justify-between text-center transition-colors duration-300 ${
                isOccupied ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
              }`;

              const buttonClasses = `w-full py-2 rounded-lg font-semibold transition-colors duration-300 ${
                isOccupied ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`;

              return (
                <div key={room.id} className={cardClasses}>
                  <div>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    <p className={`text-lg mt-1 ${isOccupied ? 'text-blue-200' : 'text-gray-500'}`}>
                      {room.status}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRoomStatus(room.id)}
                    className={`mt-4 ${buttonClasses}`}
                  >
                    {isOccupied ? 'Set Available' : 'Set Occupied'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomManagement;