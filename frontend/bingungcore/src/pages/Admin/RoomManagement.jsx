import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000/api/rooms";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);

  // NEW: Function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // NEW: Function to fetch rooms from the backend
  const fetchRooms = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to fetch rooms. Please log in.");
    }
  };

  // NEW: Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // MODIFIED: Function to toggle status via API call
  const toggleRoomStatus = async (room) => {
    const newStatus = room.status === "Available" ? "Occupied" : "Available";
    try {
      await axios.put(`${API_URL}/${room._id}`, { status: newStatus }, getAuthHeaders());
      // Re-fetching ensures data consistency.
      fetchRooms();
      toast.success(`${room.name} is now ${newStatus}`);
    } catch (error) {
      console.error("Failed to update room status:", error);
      toast.error("Could not update room status.");
    }
  };

  const availableCount = rooms.filter((room) => room.status === "Available").length;
  const occupiedCount = rooms.length - availableCount;

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin - Room Management</h1>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rooms.map((room) => {
          const isOccupied = room.status === "Occupied";
          const cardClasses = `p-6 rounded-lg shadow-md flex flex-col justify-between text-center transition-colors duration-300 ${isOccupied ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`;
          const buttonClasses = `w-full py-2 rounded-lg font-semibold transition-colors duration-300 ${isOccupied ? "bg-white text-blue-600 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-700"}`;

          return (
            <div key={room._id} className={cardClasses}>
              <div>
                <h3 className="text-xl font-bold">{room.name}</h3>
                <p className={`text-lg mt-1 ${isOccupied ? "text-blue-200" : "text-gray-500"}`}>{room.status}</p>
              </div>
              <button onClick={() => toggleRoomStatus(room)} className={`mt-4 ${buttonClasses}`}>
                {isOccupied ? "Set Available" : "Set Occupied"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default RoomManagement;
