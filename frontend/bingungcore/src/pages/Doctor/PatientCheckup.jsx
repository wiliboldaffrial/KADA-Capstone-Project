import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Home, User, Calendar, Phone, MapPin, FileText, Activity, Save, Plus, X, Stethoscope, Brain, AlertCircle, CheckCircle, Loader, Download, Users } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PatientCheckup = () => {
  const navigate = useNavigate();
  const params = useParams();

  const patientId = params._id;

  // Core states
  const [patient, setPatient] = useState(null);
  const [checkups, setCheckups] = useState([]);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // New checkup states
  const [showNewCheckupModal, setShowNewCheckupModal] = useState(false);
  const [newCheckupData, setNewCheckupData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'General',
    details: '',
    symptoms: '',
    vitalSigns: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      weight: '',
      height: ''
    }
  });
  const [createCheckupLoading, setCreateCheckupLoading] = useState(false);

  // Nurse initial checkups states
  const [availableInitialCheckups, setAvailableInitialCheckups] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // AI states
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Fetch available initial checkups from nurse
  const fetchAvailableInitialCheckups = useCallback(async () => {
    if (!patientId) return;

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await axios.get(
        `${API_URL}/api/patients/${patientId}/initial-checkups`,
        { headers: getAuthHeaders() }
      );
      setAvailableInitialCheckups(response.data);
    } catch (error) {
      console.warn("No initial checkups available or error fetching:", error);
      setAvailableInitialCheckups([]);
    }
  }, [patientId, getAuthHeaders]);

  // Fetch patient data and checkups
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setError("No patient ID provided in URL");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const API_URL = process.env.REACT_APP_API_URL;

        // Fetch patient data
        const patientResponse = await axios.get(
          `${API_URL}/api/patients/${patientId}`,
          { headers: getAuthHeaders() }
        );

        const patientData = patientResponse.data;
        const normalizedPatient = {
          ...patientData,
          dateOfBirth: patientData.birthdate || patientData.dateOfBirth,
          phone: patientData.contact || patientData.phone,
        };

        setPatient(normalizedPatient);

        // Fetch checkups from separate collection
        try {
          const checkupsResponse = await axios.get(
            `${API_URL}/api/checkups/patient/${patientId}`,
            { headers: getAuthHeaders() }
          );
          setCheckups(checkupsResponse.data);

          if (checkupsResponse.data.length > 0) {
            const firstCheckup = checkupsResponse.data[0];
            setSelectedCheckup(firstCheckup);
            setDoctorNotes(firstCheckup.doctorNotes || "");
          }
        } catch (checkupError) {
          console.warn("No checkups found or checkups endpoint not available");
          setCheckups([]);
        }

        // Fetch available initial checkups from nurse
        await fetchAvailableInitialCheckups();

      } catch (err) {
        console.error("Error loading data:", err);

        let errorMessage = "Failed to load patient data";

        if (err.response?.status === 404) {
          errorMessage = "Patient not found. Please check the patient ID.";
        } else if (err.response?.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (err.response?.status === 403) {
          errorMessage = "Access denied. You don't have permission to view this patient.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, getAuthHeaders, fetchAvailableInitialCheckups]);

  // Import initial checkup from nurse
  const handleImportInitialCheckup = useCallback(async (initialCheckup) => {
    setImportLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL;

      const response = await axios.post(
        `${API_URL}/api/patients/${patientId}/convert-initial-checkup`,
        { initialCheckupDate: initialCheckup.date },
        { headers: getAuthHeaders() }
      );

      // Add the new checkup to the list
      setCheckups(prev => [response.data, ...prev]);

      // Select the imported checkup
      setSelectedCheckup(response.data);
      setDoctorNotes("");

      // Refresh available initial checkups
      await fetchAvailableInitialCheckups();

      setShowImportModal(false);
      setError("Initial checkup imported successfully! You can now add your diagnosis.");
      setTimeout(() => setError(null), 5000);

    } catch (err) {
      console.error("Error importing initial checkup:", err);
      let errorMessage = "Failed to import initial checkup. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setImportLoading(false);
    }
  }, [patientId, getAuthHeaders, fetchAvailableInitialCheckups]);

  // Handle checkup selection
  const handleCheckupSelect = useCallback((checkup) => {
    setSelectedCheckup(checkup);
    setDoctorNotes(checkup.doctorNotes || "");
    setError(null);
    setShowAiAnalysis(false);
    setAiAnalysisResult(null);
  }, []);

  // Handle doctor notes change
  const handleDoctorNotesChange = useCallback((e) => {
    setDoctorNotes(e.target.value);
  }, []);

  // Handle new checkup data changes
  const handleNewCheckupChange = useCallback((field, value) => {
    setNewCheckupData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleVitalSignChange = useCallback((field, value) => {
    setNewCheckupData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  }, []);

  // Create new checkup
  const handleCreateCheckup = useCallback(async () => {
    if (!newCheckupData.details.trim()) {
      setError("Please provide checkup details");
      return;
    }

    setCreateCheckupLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL;

      const checkupPayload = {
        patientId: patientId,
        date: new Date(newCheckupData.date),
        type: newCheckupData.type,
        details: newCheckupData.details,
        symptoms: newCheckupData.symptoms,
        vitalSigns: newCheckupData.vitalSigns,
        doctorNotes: ""
      };

      console.log('Creating checkup with payload:', checkupPayload);

      const response = await axios.post(
        `${API_URL}/api/checkups`,
        checkupPayload,
        { headers: getAuthHeaders() }
      );

      console.log('Checkup created successfully:', response.data);

      // Add new checkup to the list
      setCheckups(prev => [response.data, ...prev]);

      // Select the new checkup
      setSelectedCheckup(response.data);
      setDoctorNotes("");

      // Reset form
      setNewCheckupData({
        date: new Date().toISOString().split('T')[0],
        type: 'General',
        details: '',
        symptoms: '',
        vitalSigns: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          weight: '',
          height: ''
        }
      });

      setShowNewCheckupModal(false);
      setError("Checkup created successfully!");
      setTimeout(() => setError(null), 3000);

    } catch (err) {
      console.error("Error creating checkup:", err);
      console.error("Error response:", err.response?.data);

      let errorMessage = "Failed to create checkup. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 404) {
        errorMessage = "Patient not found. Please refresh the page.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }

      setError(errorMessage);
    } finally {
      setCreateCheckupLoading(false);
    }
  }, [newCheckupData, patientId, getAuthHeaders]);

  // Save doctor notes
  const handleSaveNotes = useCallback(async () => {
    if (!selectedCheckup) {
      setError("No checkup selected");
      return;
    }

    if (!doctorNotes.trim()) {
      setError("Please enter some notes to save");
      return;
    }

    setSaveLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL;

      const response = await axios.put(
        `${API_URL}/api/checkups/${selectedCheckup._id}`,
        { doctorNotes: doctorNotes.trim() },
        { headers: getAuthHeaders() }
      );

      // Update the checkup in local state
      setCheckups(prevCheckups =>
        prevCheckups.map(checkup =>
          checkup._id === selectedCheckup._id
            ? { ...checkup, aiResponse: response.data }
            : checkup
        )
      );

      setSelectedCheckup({ ...selectedCheckup, aiResponse: response.data });

      setError("Notes saved successfully!");
      setTimeout(() => setError(null), 3000);

    } catch (err) {
      console.error("Error saving notes:", err);
      setError("Failed to save notes. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }, [selectedCheckup, doctorNotes, getAuthHeaders]);

  // AI Analysis Function
  const handleAiAnalysis = useCallback(async () => {
    if (!selectedCheckup || !patient) {
      setError("No checkup selected for analysis");
      return;
    }

    setAiAnalysisLoading(true);
    setError(null);

    try {
      const API_URL = process.env.REACT_APP_API_URL;

      // Prepare data for AI analysis
      const analysisData = {
        patientInfo: {
          age: calculateAge(patient.dateOfBirth || patient.birthdate),
          gender: patient.gender,
          medicalHistory: patient.medicalHistory || "None provided"
        },
        checkupDetails: selectedCheckup.details,
        symptoms: selectedCheckup.symptoms || "",
        vitalSigns: selectedCheckup.vitalSigns || {},
        doctorNotes: doctorNotes
      };

      const response = await axios.post(
        `${API_URL}/api/ai/analyze-checkup`,
        analysisData,
        { headers: getAuthHeaders() }
      );

      setAiAnalysisResult(response.data);
      setShowAiAnalysis(true);

      // Update the checkup with AI response
      const updatedCheckup = {
        ...selectedCheckup,
        aiResponse: response.data
      };

      // Save AI response to checkup
      await axios.put(
        `${API_URL}/api/checkups/${selectedCheckup._id}`,
        { aiResponse: response.data },
        { headers: getAuthHeaders() }
      );

      // Update local state
      setCheckups(prevCheckups =>
        prevCheckups.map(checkup =>
          checkup._id === selectedCheckup._id
            ? updatedCheckup
            : checkup
        )
      );

      setSelectedCheckup(updatedCheckup);

    } catch (err) {
      console.error("Error during AI analysis:", err);
      setError("Failed to get AI analysis. Please try again.");
    } finally {
      setAiAnalysisLoading(false);
    }
  }, [selectedCheckup, patient, doctorNotes, getAuthHeaders]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return "Not provided";
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Format date and time helper
  const formatDateTime = useCallback((dateString) => {
    try {
      if (!dateString) return "Not provided";
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Calculate age helper
  const calculateAge = useCallback((dateOfBirth) => {
    try {
      if (!dateOfBirth) return "N/A";
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return "N/A";

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= 0 ? age : "N/A";
    } catch {
      return "N/A";
    }
  }, []);

  // Memoized patient age
  const patientAge = useMemo(() => {
    if (!patient) return "N/A";
    return calculateAge(patient.dateOfBirth || patient.birthdate);
  }, [patient, calculateAge]);

  // Import Modal Component
  const ImportModal = useMemo(() => {
    if (!showImportModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowImportModal(false)}></div>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Import Initial Checkups from Nurse</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                The following initial checkups were created by nurses and are available for import.
                Once imported, you can add your diagnosis to complete the checkup.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableInitialCheckups.length > 0 ? (
                availableInitialCheckups.map((checkup, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatDate(checkup.date)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(checkup.date)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                          <div>
                            <span className="font-medium text-gray-600">Weight:</span>
                            <p className="text-gray-900">{checkup.weight ? `${checkup.weight} kg` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Temperature:</span>
                            <p className="text-gray-900">{checkup.temperature ? `${checkup.temperature}°C` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">BP:</span>
                            <p className="text-gray-900">{checkup.bloodPressure || 'N/A'}</p>
                          </div>
                        </div>

                        {checkup.notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">Nurse Notes:</span>
                            <p className="text-gray-800 mt-1 bg-yellow-50 p-2 rounded border">
                              {checkup.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleImportInitialCheckup(checkup)}
                        disabled={importLoading}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {importLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Import
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Initial Checkups Available</h4>
                  <p className="text-sm">
                    No initial checkups from nurses are available for import, or all have already been converted to doctor checkups.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showImportModal, availableInitialCheckups, importLoading, handleImportInitialCheckup, formatDate, formatDateTime]);

  // New Checkup Modal Component
  const NewCheckupModal = useMemo(() => {
    if (!showNewCheckupModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowNewCheckupModal(false)}></div>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Checkup</h3>
              <button
                onClick={() => setShowNewCheckupModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newCheckupData.date}
                    onChange={(e) => handleNewCheckupChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newCheckupData.type}
                    onChange={(e) => handleNewCheckupChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chief Complaints / Symptoms</label>
                <textarea
                  value={newCheckupData.symptoms}
                  onChange={(e) => handleNewCheckupChange('symptoms', e.target.value)}
                  placeholder="Describe the patient's main complaints and symptoms..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              {/* Vital Signs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCheckupData.vitalSigns.temperature}
                      onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                      placeholder="36.5"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={newCheckupData.vitalSigns.bloodPressure}
                      onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value)}
                      placeholder="120/80"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={newCheckupData.vitalSigns.heartRate}
                      onChange={(e) => handleVitalSignChange('heartRate', e.target.value)}
                      placeholder="72"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCheckupData.vitalSigns.weight}
                      onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                      placeholder="70"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={newCheckupData.vitalSigns.height}
                      onChange={(e) => handleVitalSignChange('height', e.target.value)}
                      placeholder="170"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checkup Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Examination & Findings *</label>
                <textarea
                  value={newCheckupData.details}
                  onChange={(e) => handleNewCheckupChange('details', e.target.value)}
                  placeholder="Describe the physical examination findings, observations, and any tests performed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewCheckupModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCheckup}
                disabled={createCheckupLoading || !newCheckupData.details.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createCheckupLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Checkup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showNewCheckupModal, newCheckupData, createCheckupLoading, handleNewCheckupChange, handleVitalSignChange, handleCreateCheckup]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Patient Checkup</h1>
          </div>
          <div className="flex gap-3">
            {availableInitialCheckups.length > 0 && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download size={20} />
                Import from Nurse ({availableInitialCheckups.length})
              </button>
            )}
            <button
              onClick={() => setShowNewCheckupModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              New Checkup
            </button>
            <button
              onClick={() => navigate("/doctor/patients")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home size={20} />
              All Patients
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border ${
              error.includes("successfully")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {loading ? (
          /* Loading State */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Info & Checkup List */}
            <div className="space-y-6">
              {/* Patient Information */}
              {patient ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">ID: {patient._id}</p>
                      {patient.nik && <p className="text-sm text-gray-500">NIK: {patient.nik}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Age:</span>
                        <p className="text-gray-900">{patientAge} years</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Gender:</span>
                        <p className="text-gray-900">{patient.gender || "Not specified"}</p>
                      </div>
                      {patient.bloodType && (
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Blood Type:</span>
                          <p className="text-gray-900">{patient.bloodType}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">DOB:</span>
                        <span className="text-gray-900">{formatDate(patient.dateOfBirth || patient.birthdate)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Contact:</span>
                        <span className="text-gray-900">{patient.phone || patient.contact || "Not provided"}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">Address:</span>
                        <span className="text-gray-900">{patient.address || "Not provided"}</span>
                      </div>

                      {patient.medicalHistory && (
                        <div className="pt-2 border-t">
                          <span className="font-medium text-gray-600">Medical History:</span>
                          <p className="text-gray-900 text-xs mt-1">{patient.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Patient not found</p>
                    <p className="text-sm mt-1">Looking for patient ID: {patientId}</p>
                  </div>
                </div>
              )}

              {/* Checkups List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Checkups ({checkups.length})</h3>
                  </div>
                  <div className="flex gap-2">
                    {availableInitialCheckups.length > 0 && (
                      <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                        title="Import initial checkups from nurses"
                      >
                        <Download className="w-4 h-4" />
                        Import ({availableInitialCheckups.length})
                      </button>
                    )}
                    <button
                      onClick={() => setShowNewCheckupModal(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {checkups.length > 0 ? (
                    checkups.map((checkup, index) => (
                      <button
                        key={checkup._id || index}
                        onClick={() => handleCheckupSelect(checkup)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedCheckup && (selectedCheckup._id === checkup._id || selectedCheckup === checkup)
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "bg-gray-50 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {formatDate(checkup.date)}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {checkup.type || "General"} Checkup
                            </p>
                            {checkup.nurseInitialData && (
                              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Imported from Nurse
                              </p>
                            )}
                            {checkup.symptoms && (
                              <p className="text-xs text-gray-500 mt-1 break-words">
                                {checkup.symptoms.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">
                              {formatDateTime(checkup.createdAt || checkup.date)}
                            </p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              {checkup.doctorNotes && (
                                <div className="flex items-center gap-1">
                                  <Stethoscope className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs text-blue-600">Diagnosed</span>
                                </div>
                              )}
                              {checkup.aiResponse && (
                                <div className="flex items-center gap-1">
                                  <Brain className="w-3 h-3 text-purple-500" />
                                  <span className="text-xs text-purple-600">AI</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No checkups found</p>
                      <p className="text-sm mt-1">
                        {availableInitialCheckups.length > 0
                          ? "Import initial checkups from nurses or create a new one"
                          : "Create a new checkup to get started"
                        }
                      </p>
                      <div className="flex justify-center gap-3 mt-3">
                        {availableInitialCheckups.length > 0 && (
                          <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Import from Nurse ({availableInitialCheckups.length})
                          </button>
                        )}
                        <button
                          onClick={() => setShowNewCheckupModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Checkup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Checkup Details */}
            <div className="lg:col-span-2">
              {selectedCheckup ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Checkup Details</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-600">
                          {formatDateTime(selectedCheckup.date)} • {selectedCheckup.type || "General"} Checkup
                        </p>
                        {selectedCheckup.nurseInitialData && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            <Users className="w-3 h-3" />
                            Imported from Nurse
                          </div>
                        )}
                      </div>
                    </div>
                      {(selectedCheckup.doctorNotes || selectedCheckup.nurseInitialData) && !selectedCheckup.aiResponse && (
                        <button
                          onClick={handleAiAnalysis}
                          disabled={aiAnalysisLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {aiAnalysisLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4" />
                              AI Cross-Check
                            </>
                          )}
                        </button>
                      )}
                  </div>

                  {/* Nurse Initial Data Section */}
                  {selectedCheckup.nurseInitialData && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Initial Assessment by Nurse
                      </h4>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                          {selectedCheckup.nurseInitialData.weight && (
                            <div>
                              <span className="font-medium text-purple-800">Weight:</span>
                              <p className="text-purple-700">{selectedCheckup.nurseInitialData.weight} kg</p>
                            </div>
                          )}
                          {selectedCheckup.nurseInitialData.temperature && (
                            <div>
                              <span className="font-medium text-purple-800">Temperature:</span>
                              <p className="text-purple-700">{selectedCheckup.nurseInitialData.temperature}°C</p>
                            </div>
                          )}
                          {selectedCheckup.nurseInitialData.bloodPressure && (
                            <div>
                              <span className="font-medium text-purple-800">Blood Pressure:</span>
                              <p className="text-purple-700">{selectedCheckup.nurseInitialData.bloodPressure}</p>
                            </div>
                          )}
                        </div>
                        {selectedCheckup.nurseInitialData.notes && (
                          <div>
                            <span className="font-medium text-purple-800">Nurse Notes:</span>
                            <p className="text-purple-700 mt-1">{selectedCheckup.nurseInitialData.notes}</p>
                          </div>
                        )}
                        <div className="text-xs text-purple-600 mt-2 border-t pt-2">
                          Imported on: {formatDateTime(selectedCheckup.nurseInitialData.convertedAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {selectedCheckup.symptoms && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Chief Complaints / Symptoms</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedCheckup.symptoms}</p>
                      </div>
                    </div>
                  )}

                  {/* Vital Signs */}
                  {selectedCheckup.vitalSigns && Object.values(selectedCheckup.vitalSigns).some(v => v) && !selectedCheckup.nurseInitialData && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Vital Signs</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {selectedCheckup.vitalSigns.temperature && (
                            <div>
                              <span className="font-medium text-green-800">Temperature:</span>
                              <p className="text-green-700">{selectedCheckup.vitalSigns.temperature}°C</p>
                            </div>
                          )}
                          {selectedCheckup.vitalSigns.bloodPressure && (
                            <div>
                              <span className="font-medium text-green-800">Blood Pressure:</span>
                              <p className="text-green-700">{selectedCheckup.vitalSigns.bloodPressure}</p>
                            </div>
                          )}
                          {selectedCheckup.vitalSigns.heartRate && (
                            <div>
                              <span className="font-medium text-green-800">Heart Rate:</span>
                              <p className="text-green-700">{selectedCheckup.vitalSigns.heartRate} bpm</p>
                            </div>
                          )}
                          {selectedCheckup.vitalSigns.weight && (
                            <div>
                              <span className="font-medium text-green-800">Weight:</span>
                              <p className="text-green-700">{selectedCheckup.vitalSigns.weight} kg</p>
                            </div>
                          )}
                          {selectedCheckup.vitalSigns.height && (
                            <div>
                              <span className="font-medium text-green-800">Height:</span>
                              <p className="text-green-700">{selectedCheckup.vitalSigns.height} cm</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Physical Examination Details */}
                  {selectedCheckup.details && !selectedCheckup.nurseInitialData && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Physical Examination & Findings</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedCheckup.details}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Response Section */}
                  {(selectedCheckup.aiResponse || showAiAnalysis) && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          AI Medical Analysis
                        </h4>
                        {selectedCheckup.aiResponse && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Analysis Complete
                          </div>
                        )}
                      </div>

                      {aiAnalysisResult || selectedCheckup.aiResponse ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                          {(aiAnalysisResult?.possibleDiagnoses || selectedCheckup.aiResponse?.possibleDiagnoses) && (
                            <div>
                              <span className="font-medium text-purple-800">Possible Diagnoses:</span>
                              <ul className="text-purple-700 mt-1 list-disc list-inside">
                                {(aiAnalysisResult?.possibleDiagnoses || selectedCheckup.aiResponse?.possibleDiagnoses).map((diagnosis, index) => (
                                  <li key={index}>{diagnosis}</li>
                                ))}
                              </ul>
                              {(aiAnalysisResult?.confidenceExplanation || selectedCheckup.aiResponse?.confidenceExplanation) && (
                                <p className="text-purple-600 text-sm mt-1">
                                  {aiAnalysisResult?.confidenceExplanation || selectedCheckup.aiResponse?.confidenceExplanation}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t">
                            <button
                              onClick={handleAiAnalysis}
                              disabled={aiAnalysisLoading}
                              className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                            >
                              {aiAnalysisLoading ? (
                                <>
                                  <Loader className="w-3 h-3 animate-spin" />
                                  Re-analyzing...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3" />
                                  Run Again
                                </>
                              )}
                            </button>

                            <button
                              onClick={async () => {
                                try {
                                  const API_URL = process.env.REACT_APP_API_URL;
                                  await axios.put(
                                    `${API_URL}/api/checkups/${selectedCheckup._id}`,
                                    { aiResponse: aiAnalysisResult || selectedCheckup.aiResponse },
                                    { headers: getAuthHeaders() }
                                  );
                                  setError("AI analysis saved successfully!");
                                  setTimeout(() => setError(null), 3000);
                                } catch (err) {
                                  setError("Failed to save AI analysis");
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                              <Save className="w-3 h-3" />
                              Save Analysis
                            </button>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex items-center gap-2 text-xs text-purple-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>This AI analysis is for reference only. Always use clinical judgment for final diagnosis and treatment decisions.</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                          <Brain className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                          <p className="text-purple-700">AI analysis will appear here after cross-checking</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doctor Notes */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        Doctor's Diagnosis & Treatment Plan
                      </h4>
                      {selectedCheckup.doctorNotes && (
                        <span className="text-xs text-gray-500">
                          Last updated: {formatDateTime(selectedCheckup.updatedAt || selectedCheckup.date)}
                        </span>
                      )}
                    </div>

                    <textarea
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={doctorNotes}
                      onChange={handleDoctorNotesChange}
                      placeholder="Enter your medical assessment, diagnosis, treatment plan, medications, and recommendations here..."
                    />

                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-500">
                        {doctorNotes.length} characters
                      </p>
                      <div className="flex gap-3">
                        {(doctorNotes.trim() || selectedCheckup.nurseInitialData) && !selectedCheckup.aiResponse && (
                          <button
                            onClick={handleAiAnalysis}
                            disabled={aiAnalysisLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {aiAnalysisLoading ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                AI Cross-Check
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={handleSaveNotes}
                          disabled={saveLoading || !doctorNotes.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saveLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Diagnosis
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Checkup Selected</h3>
                  <p className="text-gray-600 mb-4">
                    Select a checkup from the list to view and edit details, or create a new one
                  </p>
                  {checkups.length === 0 && patient && (
                    <div className="flex justify-center gap-3">
                      {availableInitialCheckups.length > 0 && (
                        <button
                          onClick={() => setShowImportModal(true)}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Import from Nurse ({availableInitialCheckups.length})
                        </button>
                      )}
                      <button
                        onClick={() => setShowNewCheckupModal(true)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Create New Checkup
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Modal */}
        {ImportModal}

        {/* New Checkup Modal */}
        {NewCheckupModal}
      </div>
    </div>
  );
};

export default PatientCheckup;