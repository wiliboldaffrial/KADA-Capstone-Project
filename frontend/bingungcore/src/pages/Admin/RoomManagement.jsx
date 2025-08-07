import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BedDouble, DoorOpen, DoorClosed, CheckCircle, XCircle } from "lucide-react";

const API_URL = `${process.env.REACT_APP_API_URL}/api/rooms`;

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);

  // State for filtering
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Available', 'Occupied'

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      // CHANGE: Sort by room number numerically instead of alphabetically.
      const sortedRooms = response.data.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/g)?.join("")) || 0;
        const numB = parseInt(b.name.match(/\d+/g)?.join("")) || 0;
        return numA - numB;
      });
      setRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Failed to fetch rooms. Please log in.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const toggleRoomStatus = async (room) => {
    const newStatus = room.status === "Available" ? "Occupied" : "Available";
    try {
      await axios.put(`${API_URL}/${room._id}`, { status: newStatus }, getAuthHeaders());
      fetchRooms();
      toast.success(`${room.name} is now ${newStatus}`);
    } catch (error) {
      console.error("Failed to update room status:", error);
      toast.error("Could not update room status.");
    }
  };

  // Memoized hook for filtering rooms
  const processedRooms = useMemo(() => {
    return rooms.filter((room) => filterStatus === "all" || room.status === filterStatus);
  }, [rooms, filterStatus]);

  const availableCount = rooms.filter((room) => room.status === "Available").length;
  const occupiedCount = rooms.length - availableCount;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Room Management</h1>
          <p className="text-gray-500 mt-1">Oversee and update the status of all patient rooms.</p>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <BedDouble className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <DoorOpen className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-gray-800">{availableCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <DoorClosed className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Occupied</p>
            <p className="text-2xl font-bold text-gray-800">{occupiedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl">
          <button onClick={() => setFilterStatus("all")} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === "all" ? "bg-white text-gray-800 shadow-md" : "bg-transparent text-gray-600"}`}>
            All Rooms
          </button>
          <button onClick={() => setFilterStatus("Available")} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === "Available" ? "bg-white text-gray-800 shadow-md" : "bg-transparent text-gray-600"}`}>
            Available
          </button>
          <button onClick={() => setFilterStatus("Occupied")} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${filterStatus === "Occupied" ? "bg-white text-gray-800 shadow-md" : "bg-transparent text-gray-600"}`}>
            Occupied
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {processedRooms.map((room) => {
          const isAvailable = room.status === "Available";
          return (
            <div key={room._id} className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                  <div className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full ${isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {room.status}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <button
                  onClick={() => toggleRoomStatus(room)}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors duration-300 text-sm ${isAvailable ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"}`}
                >
                  {isAvailable ? "Set Occupied" : "Set Available"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {processedRooms.length === 0 && (
        <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm border">
          <BedDouble size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Rooms Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
