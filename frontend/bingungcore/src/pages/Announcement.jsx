import React, { useState } from "react";
import SideBar from "../components/SideBar";
import Modal from "../components/Modal";
import { formatDistanceToNow } from "date-fns";
import { Toaster, toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";

const initialAnnouncements = [];

const Announcement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSideBar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ content: "", critical: false });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.content) {
      toast.error("Please fill in at least the content field.");
      return;
    }
    const announcementToAdd = {
      id: Date.now(),
      ...newAnnouncement,
      timestamp: new Date().toISOString(),
    };
    setAnnouncements([announcementToAdd, ...announcements]);
    // MODIFIED: Added success alert
    toast.success("Announcement successfully added!");
    setNewAnnouncement({ title: "", content: "" });
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setNewAnnouncement((prevState) => ({ ...prevState, [name]: type === "checkbox" ? checked : value }));
  };

  const openConfirmModal = (announcementId) => {
    setAnnouncementToDelete(announcementId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setAnnouncements(announcements.filter((p) => p.id !== announcementToDelete));
    toast.success("Announcement successfully deleted!");
    setIsConfirmModalOpen(false); // Close the confirmation modal
    setSelectedAnnouncement(null); // Clear selected announcement
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalOpen(true);
  };

  const formFields = [
    { name: "content", label: "Content", type: "textarea" },
    { name: "critical", label: "Critical", type: "checkbox" },
  ];

  return (
    <>
      <div className="flex min-h-screen">
        <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={toggleSideBar} />
        <div className={`flex-1 transition-all duration-300 p-6 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
          {/* Add announcement button */}
          <div className="flex justify-between items-center mb-6">
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
                        <div>
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
            {announcements.map((announcement) => (
              <div key={announcement.id} onClick={() => handleViewAnnouncement(announcement)} className="flex items-center border shadow w-full h-16 p-4 text-center justify-between">
                {announcement.content}
                <div className="flex items-center justify-between gap-3">
                  {announcement.critical && (
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
                    {announcement.timestamp ? formatDistanceToNow(new Date(announcement.timestamp), { addSuffix: true }) : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirmModal(announcement.id);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Announcement Details">
            {selectedAnnouncement && (
              <div className="space-y-3">
                {Object.entries(selectedAnnouncement).map(([key, value]) => {
                  if (key === "id") return null;
                  const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <p className="font-semibold text-gray-600 col-span-1">{formattedKey}</p>
                      <p className="text-gray-800 col-span-2">{value}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Modal>

          <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmDelete}>
            <p>This action cannot be undone. Are you sure you want to delete this announcement?</p>
          </ConfirmationModal>
        </div>
      </div>
    </>
  );
};

export default Announcement;
