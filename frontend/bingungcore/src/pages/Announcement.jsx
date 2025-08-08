import React, { useState, useEffect, useMemo } from "react";
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import { useUser } from "../UserContext";
import { Megaphone, Plus, Calendar, AlertTriangle, Trash2, ChevronDown, Check } from "lucide-react";

const API_URL = `${process.env.REACT_APP_API_URL}/api/announcements`;
const USERS_API_URL = `${process.env.REACT_APP_API_URL}/api/users`;

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ content: "", urgency: false });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [authorNamesMap, setAuthorNameMap] = useState({});
  const [authorRoleMap, setAuthorRoleMap] = useState({});

  // State for filtering and sorting
  const [dateFilter, setDateFilter] = useState("all");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { currentUserId, userRole, loading } = useUser();
  const isAdmin = userRole && userRole.toLowerCase().includes("admin");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      const fetchedAnnouncements = response.data;
      setAnnouncements(fetchedAnnouncements);

      const authorIds = [...new Set(fetchedAnnouncements.map((ann) => ann.author))];
      const newAuthorNames = { ...authorNamesMap };
      const newAuthorRoles = { ...authorRoleMap };

      for (const authorId of authorIds) {
        if (!newAuthorNames[authorId]) {
          try {
            const userRes = await axios.get(`${USERS_API_URL}/${authorId}`, getAuthHeaders());
            if (userRes.data) {
              newAuthorNames[authorId] = userRes.data.name || "Unknown User";
              let role = userRes.data.role || "User";
              role = role.charAt(0).toUpperCase() + role.slice(1);
              if (role === "Admin/receptionist") role = "Admin";
              newAuthorRoles[authorId] = role;
            }
          } catch (userError) {
            console.error(`Failed to fetch user data for ID ${authorId}:`, userError);
            newAuthorNames[authorId] = "Unknown User";
            newAuthorRoles[authorId] = "Unknown Role";
          }
        }
      }
      setAuthorNameMap(newAuthorNames);
      setAuthorRoleMap(newAuthorRoles);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to fetch announcements.");
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!currentUserId || !newAnnouncement.content) {
      toast.error("Please fill in the content field.");
      return;
    }
    try {
      const payload = { ...newAnnouncement, author: currentUserId };
      await axios.post(API_URL, payload, getAuthHeaders());
      toast.success("Announcement added!");
      setShowAddForm(false);
      setNewAnnouncement({ content: "", urgency: false });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add announcement.");
    }
  };

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleConfirmDelete = async () => {
    if (announcementToDelete) {
      try {
        await axios.delete(`${API_URL}/${announcementToDelete}`, getAuthHeaders());
        toast.success("Announcement deleted!");
        fetchAnnouncements();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not delete announcement.");
      } finally {
        setDeleteModalOpen(false);
        setAnnouncementToDelete(null);
      }
    }
  };

  const handleOpenDeleteModal = (announcementId) => {
    setAnnouncementToDelete(announcementId);
    setDeleteModalOpen(true);
  };

  const processedAnnouncements = useMemo(() => {
    return announcements
      .filter((ann) => {
        const announcementDate = new Date(ann.createdAt);
        let dateMatch = true;
        if (dateFilter === "today") dateMatch = isToday(announcementDate);
        else if (dateFilter === "week") dateMatch = isThisWeek(announcementDate, { weekStartsOn: 1 });
        else if (dateFilter === "month") dateMatch = isThisMonth(announcementDate);

        const urgencyMatch = !showUrgentOnly || ann.urgency;

        return dateMatch && urgencyMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [announcements, dateFilter, showUrgentOnly, sortOrder]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

    return  (
    <>
      <div className="px-4 sm:px-8 py-8 bg-gray-50 min-h-screen max-w-full overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Announcements</h1>
            <p className="text-gray-500 mt-1">
              Stay updated with the latest news and alerts.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center"
            disabled={!currentUserId}
          >
            <Plus size={20} />
            {showAddForm ? "Cancel" : "New Announcement"}
          </button>
        </header>

        {showAddForm && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8 transition-all">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Create a New Announcement
            </h2>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <textarea
                name="content"
                value={newAnnouncement.content}
                onChange={handleInputChange}
                placeholder="What's the announcement?"
                rows="4"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="urgency"
                    name="urgency"
                    checked={newAnnouncement.urgency}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="urgency"
                    className="font-medium text-red-600"
                  >
                    Mark as Urgent
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2 bg-gray-200 p-1 rounded-lg w-full sm:w-auto">
            {["all", "today", "week", "month"].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                  dateFilter === filter
                    ? "bg-white text-gray-800 shadow-sm"
                    : "bg-transparent text-gray-600"
                }`}
              >
                {filter === "all"
                  ? "All"
                  : filter === "today"
                  ? "Today"
                  : filter === "week"
                  ? "This Week"
                  : "This Month"}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border w-full sm:w-auto justify-center"
            >
              Filter & Sort <ChevronDown size={16} />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-10 border">
                <div className="p-3">
                  <label className="font-semibold text-sm text-gray-600">
                    Sort By
                  </label>
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => {
                        setSortOrder("desc");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex justify-between items-center ${
                        sortOrder === "desc"
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                    >
                      Newest First{" "}
                      {sortOrder === "desc" && <Check size={16} />}
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("asc");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex justify-between items-center ${
                        sortOrder === "asc"
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }`}
                    >
                      Oldest First{" "}
                      {sortOrder === "asc" && <Check size={16} />}
                    </button>
                  </div>
                </div>
                <div className="border-t p-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUrgentOnly}
                      onChange={(e) =>
                        setShowUrgentOnly(e.target.checked)
                      }
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show Urgent Only
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="divide-y divide-gray-200">
            {processedAnnouncements.length > 0 ? (
              processedAnnouncements.map((ann) => (
                <div
                  key={ann._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        ann.urgency
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {ann.urgency ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <Megaphone size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800 leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        By {authorRoleMap[ann.author]}{" "}
                        {authorNamesMap[ann.author] || "..."} •{" "}
                        {formatDistanceToNow(new Date(ann.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {ann.urgency && (
                      <div
                        className="w-2.5 h-2.5 bg-red-500 rounded-full"
                        title="Urgent"
                      ></div>
                    )}
                    {(ann.author === currentUserId || isAdmin) && (
                      <button
                        onClick={() =>
                          handleOpenDeleteModal(ann._id)
                        }
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Calendar
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-700">
                  No Announcements Found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        confirmText="Delete"
      >
        Are you sure you want to delete this announcement? This
        action cannot be undone.
      </ConfirmationModal>
    </>
  );
};

export default Announcement;
