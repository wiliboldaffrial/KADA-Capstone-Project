import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown, Eye, Edit, Trash2, Plus, User, Calendar, Phone, MapPin, MoreVertical, ChevronLeft, ChevronRight, Users, ChevronDown, ChevronUp, FileText, Activity } from "lucide-react";
import SideBar from "../../components/SideBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const PatientPage = () => {
  const navigate = useNavigate();

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data states
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterGender, setFilterGender] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // NEW: Patient expansion states
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [patientCheckups, setPatientCheckups] = useState({});
  const [patientAppointments, setPatientAppointments] = useState({});

  // Helper function for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found");
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patients`, { headers: getAuthHeaders() });
      const patientsWithAge = response.data.map((p) => ({
        ...p,
        age: p.birthdate ? new Date().getFullYear() - new Date(p.birthdate).getFullYear() : "N/A",
      }));
      setPatients(patientsWithAge);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        setError("Access denied. You do not have permission to view patients.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setError("Network error. Please check your connection.");
      } else {
        setError(error.response?.data?.message || "Failed to fetch patients.");
      }
      toast.error(error.response?.data?.message || "Failed to fetch patients.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch patient checkups
  const fetchPatientCheckups = async (patientId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/checkups/patient/${patientId}`, { headers: getAuthHeaders() });
      setPatientCheckups((prev) => ({
        ...prev,
        [patientId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to fetch checkups:", error);
      setPatientCheckups((prev) => ({
        ...prev,
        [patientId]: [],
      }));
    }
  };

  // NEW: Fetch patient appointments
  const fetchPatientAppointments = async (patientId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/appointments/patient/${patientId}`, { headers: getAuthHeaders() });
      setPatientAppointments((prev) => ({
        ...prev,
        [patientId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setPatientAppointments((prev) => ({
        ...prev,
        [patientId]: [],
      }));
    }
  };

  // NEW: Handle patient expansion
  const handlePatientExpansion = async (patient) => {
    if (expandedPatient && expandedPatient._id === patient._id) {
      setExpandedPatient(null);
    } else {
      setExpandedPatient(patient);
      if (!patientCheckups[patient._id]) {
        await fetchPatientCheckups(patient._id);
      }
      if (!patientAppointments[patient._id]) {
        await fetchPatientAppointments(patient._id);
      }
    }
  };

  // Load patients on component mount
  useEffect(() => {
    const loadPatients = async () => {
      await fetchPatients();
    };
    loadPatients();
  }, []);

  // Search and filter effect
  useEffect(() => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.contact?.includes(searchTerm) || patient._id.includes(searchTerm));
    }

    if (filterGender !== "all") {
      filtered = filtered.filter((patient) => patient.gender?.toLowerCase() === filterGender.toLowerCase());
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "dateOfBirth" || sortField === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchTerm, filterGender, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle delete patient
  const handleDeletePatient = async (patientId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/patients/${patientId}`, { headers: getAuthHeaders() });
      setPatients((prev) => prev.filter((p) => p._id !== patientId));
      setShowDeleteModal(false);
      setPatientToDelete(null);
      setError("Patient deleted successfully");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient");
    }
  };

  // Pagination logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // Calculate age - Fixed version
  const calculateAge = (dateOfBirth) => {
    try {
      if (!dateOfBirth) return "N/A";
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return "N/A";
      }
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  // Pagination Controls
  const renderPagination = () => (
    <div className="flex justify-between items-center mt-6">
      <p className="text-sm text-gray-700">
        Showing <span className="font-medium">{indexOfFirstPatient + 1}</span> to <span className="font-medium">{Math.min(indexOfLastPatient, filteredPatients.length)}</span> of <span className="font-medium">{filteredPatients.length}</span>{" "}
        results
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${page === currentPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200"}`}>
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteModal = ({ patient, onClose, onDelete }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                Delete Patient
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the record for <span className="font-semibold">{patient.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => onDelete(patient._id)}
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // NEW: Expanded Patient Details Component
  const ExpandedPatientDetails = ({ patient }) => {
    const checkups = patientCheckups[patient._id] || [];
    const appointments = patientAppointments[patient._id] || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient Details
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Full Name:</span>
                <p className="text-gray-900">{patient.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Patient ID:</span>
                <p className="text-gray-900 font-mono">{patient._id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Age:</span>
                <p className="text-gray-900">{calculateAge(patient.birthdate)} years</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Gender:</span>
                <p className="text-gray-900">{patient.gender}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p className="text-gray-900">{patient.contact || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date of Birth:</span>
                <p className="text-gray-900">{formatDate(patient.birthdate)}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Address:</span>
                <p className="text-gray-900">{patient.address || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </h4>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent Checkups ({checkups.length})
            </h5>
            {checkups.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {checkups.slice(0, 3).map((checkup) => (
                  <div key={checkup._id} className="bg-white p-2 rounded border text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{checkup.type || "General Checkup"}</p>
                        <p className="text-gray-600 text-xs">{format(new Date(checkup.date), "MMM dd, yyyy")}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${checkup.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{checkup.status || "pending"}</span>
                    </div>
                    {checkup.doctorNotes && <p className="text-gray-600 text-xs mt-1 truncate">Notes: {checkup.doctorNotes}</p>}
                  </div>
                ))}
                {checkups.length > 3 && <p className="text-xs text-gray-500 text-center">+{checkups.length - 3} more checkups</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No checkups recorded</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments ({appointments.length})
            </h5>
            {appointments.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="bg-white p-2 rounded border text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {appointment.doctor}</p>
                        <p className="text-gray-600 text-xs">{format(new Date(appointment.dateTime), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${appointment.status === "completed" ? "bg-green-100 text-green-800" : appointment.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                        {appointment.status || "scheduled"}
                      </span>
                    </div>
                    {appointment.notes && <p className="text-gray-600 text-xs mt-1 truncate">{appointment.notes}</p>}
                  </div>
                ))}
                {appointments.length > 3 && <p className="text-xs text-gray-500 text-center">+{appointments.length - 3} more appointments</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No appointments scheduled</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Patient card component for mobile view
  const PatientCard = ({ patient }) => {
    const isExpanded = expandedPatient && expandedPatient._id === patient._id;

    return (
      <div className="border border-gray-200 bg-white p-4 mb-4 hover:bg-gray-50 cursor-pointer">
        <div className="cursor-pointer" onClick={() => handlePatientExpansion(patient)}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-500">ID: {patient._id}</p>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <button className="p-1 hover:bg-gray-100 rounded" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Age: {calculateAge(patient.birthdate)} years</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{patient.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{patient.contact || "No phone"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{patient.address || "No address"}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <ExpandedPatientDetails patient={patient} />
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => navigate(`/doctor/patient/${patient._id}`)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Full Diagnosis
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPatientToDelete(patient);
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar isCollapsed={isSidebarCollapsed} toggleSideBar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      {/* This container has the padding and inherits the gray background. */}
      <div className="flex-1 transition-all duration-300 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
                <p className="text-gray-600">Manage all patient records</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && <div className={`mb-6 px-4 py-3 rounded-lg ${error.includes("successfully") ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{error}</div>}

          {/* Search and Filters - bg-white and shadow classes removed */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Toggle */}
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="name">Name</option>
                      <option value="dateOfBirth">Age</option>
                      <option value="createdAt">Date Added</option>
                      <option value="gender">Gender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Patient Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {currentPatients.length} of {filteredPatients.length} patients
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Loading State - bg-white and shadow classes removed */}
          {loading ? (
            <div className="p-8">
              <div className="flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading patients...</p>
                <p className="text-sm text-gray-400 mt-2">If this takes too long, check your network connection</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Patients</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={fetchPatients} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
                <p className="text-gray-600 mb-4">No patients match your search criteria.</p>
                <button onClick={() => setSearchTerm("")} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View - bg-white, rounded, and shadow classes removed */}
              <div className="hidden lg:block overflow-hidden mb-6 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-gray-700">
                          Patient
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort("dateOfBirth")} className="flex items-center gap-1 hover:text-gray-700">
                          Age
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort("gender")} className="flex items-center gap-1 hover:text-gray-700">
                          Gender
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPatients.map((patient) => {
                      const isExpanded = expandedPatient && expandedPatient._id === patient._id;
                      return (
                        <React.Fragment key={patient._id}>
                          <tr className="bg-white hover:bg-gray-200 cursor-pointer" onClick={() => handlePatientExpansion(patient)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    {patient.name}
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                  <div className="text-sm text-gray-500">ID: {patient._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{calculateAge(patient.birthdate)} years</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  patient.gender?.toLowerCase() === "male" ? "bg-blue-100 text-blue-800" : patient.gender?.toLowerCase() === "female" ? "bg-pink-100 text-pink-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {patient.gender || "Not specified"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  {patient.contact || "No phone"}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="truncate max-w-xs">{patient.address || "No address"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/doctor/patient/${patient._id}`);
                                  }}
                                  className="p-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                  title="Diagnose"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPatientToDelete(patient);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-gray-50">
                              <td colSpan="5" className="px-6 py-4">
                                <ExpandedPatientDetails patient={patient} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - bg-white and shadow classes removed */}
              <div className="lg:hidden">
                {currentPatients.map((patient) => (
                  <PatientCard key={patient._id} patient={patient} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && patientToDelete && <DeleteModal patient={patientToDelete} onClose={() => setShowDeleteModal(false)} onDelete={handleDeletePatient} />}
    </div>
  );
};

export default PatientPage;
