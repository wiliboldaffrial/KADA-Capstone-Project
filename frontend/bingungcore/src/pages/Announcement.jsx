import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";

const API_URL = "http://localhost:5000/api/announcements";

const Announcement = () => {
  // All state and handlers for announcements remain the same
  const [announcements, setAnnouncements] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ content: "", urgency: false, date: new Date() });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.content) {
      alert("Please fill in at least the content field.");
      return;
    }

    try {
      await axios.post(API_URL, newAnnouncement, getAuthHeaders());
      toast.success("Announcement successfully added!");
      setShowAddForm(false);
      setNewAnnouncement({ content: "", urgency: false });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast.error(error.response?.data?.message || "Could not add announcement.");
    }
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setNewAnnouncement((prevState) => ({ ...prevState, [name]: type === "checkbox" ? checked : value }));
  };

  const handleConfirmDelete = async () => {
    if (announcementToDelete) {
      try {
        await axios.delete(`${API_URL}/${announcementToDelete}`, getAuthHeaders());
        toast.success("Announcement successfully deleted!");
        setSelectedAnnouncement(null);
        setIsEditing(false);
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error(error.response?.data?.message || "Could not delete announcement.");
      } finally {
        setDeleteModalOpen(false);
        setAnnouncementToDelete(null);
      }
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  const handleOpenDeleteModal = (announcementId) => {
    setAnnouncementToDelete(announcementId);
    setDeleteModalOpen(true);
  };

  const formFields = [
    { name: "content", label: "Content", type: "textarea" },
    { name: "urgency", label: "Urgent", type: "checkbox" },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to fetch announcements. Please make sure you are logged in.");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <>
      {/*
        The main layout with SideBar and the padding/margin divs have been moved to Layout.jsx.
        This component now only contains the content to be displayed within the Outlet.
      */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
          {showAddForm ? "×" : "Add New Announcement"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Announcement</h2>
          <form onSubmit={handleAddAnnouncement}>
            <div className="grid grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="mb-1 text-sm font-medium text-gray-600">
                    {field.label}
                  </label>
                  {field.type === "checkbox" ? (
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id={field.name} name={field.name} checked={newAnnouncement[field.name]} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <label htmlFor={field.name} className="text-sm text-gray-700">
                        {field.label}
                      </label>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea id={field.name} name={field.name} value={newAnnouncement[field.name]} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                  ) : (
                    <input type={field.type} id={field.name} name={field.name} value={newAnnouncement[field.name]} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Add Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full h-full border shadow rounded-lg p-6">
        {announcements?.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement._id} onClick={() => handleViewAnnouncement(announcement)} className="flex items-center border shadow w-full h-16 p-4 text-center justify-between">
              {announcement.content}
              <div className="flex items-center justify-between gap-3">
                {announcement.urgency && (
                  <span
                    className="w-3 h-3 bg-red-500 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  ></span>
                )}
                <span
                  className="text-sm text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {new Date(announcement.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteModal(announcement._id);
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No announcements to display.</p>
        )}
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Announcement Details">
        {selectedAnnouncement && (
          <div className="space-y-3">
            {Object.entries(selectedAnnouncement).map(([key, value]) => {
              if (["_id", "__v", "updatedAt"].includes(key)) return null;

              let formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
              let formattedValue = value;

              if (key === "urgency") {
                formattedKey = "Urgent";
                formattedValue = value ? "Yes" : "No";
              } else if (key === "createdAt") {
                formattedValue = new Date(selectedAnnouncement.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
              }

              return (
                <div key={key} className="grid grid-cols-3 gap-4">
                  <p className="font-semibold text-gray-600 col-span-1">{formattedKey}</p>
                  <p className="text-gray-800 col-span-2">{formattedValue}</p>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Delete Announcement" confirmText="Delete">
        Are you sure you want to delete this announcement? This action cannot be undone.
      </ConfirmationModal>
    </>
  );
};

export default Announcement;
