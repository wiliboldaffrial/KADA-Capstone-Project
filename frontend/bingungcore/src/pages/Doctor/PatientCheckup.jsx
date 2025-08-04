import React, { useState, useEffect } from "react";
import { Home } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const PatientCheckup = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  // Core states
  const [patient, setPatient] = useState(null);
  const [checkups, setCheckups] = useState([]);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState("");

  // AI analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch patient data and checkups on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setError("No patient ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [patientResponse, checkupsResponse] = await Promise.all([axios.get(`${API_URL}/patients/${patientId}`, { headers: getAuthHeaders() }), axios.get(`${API_URL}/checkups/patient/${patientId}`, { headers: getAuthHeaders() })]);

        setPatient(patientResponse.data);
        setCheckups(checkupsResponse.data);

        // Auto-select the first checkup if available
        if (checkupsResponse.data.length > 0) {
          const firstCheckup = checkupsResponse.data[0];
          setSelectedCheckup(firstCheckup);
          setDoctorNotes(firstCheckup.doctorNotes || "");
          try {
            setAiResponse(firstCheckup.aiResponse ? JSON.parse(firstCheckup.aiResponse) : null);
          } catch (e) {
            console.error("Failed to parse AI response from database:", e);
            setAiResponse(null);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        const errorMessage = err.response?.data?.message || "Failed to load patient or checkup data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Handle checkup selection
  const handleCheckupSelect = (checkup) => {
    setSelectedCheckup(checkup);
    setDoctorNotes(checkup.doctorNotes || "");
    try {
      setAiResponse(checkup.aiResponse ? JSON.parse(checkup.aiResponse) : null);
    } catch (e) {
      console.error("Failed to parse AI response from database:", e);
      setAiResponse(null);
    }
    setError(null);
  };

  // Save doctor notes
  const handleSaveNotes = async () => {
    if (!selectedCheckup || !doctorNotes.trim()) {
      setError("Please enter some notes to save");
      return;
    }

    try {
      await axios.put(`${API_URL}/checkups/${selectedCheckup._id}`, { doctorNotes: doctorNotes }, { headers: getAuthHeaders() });

      // Update the checkup in local state
      setCheckups((prevCheckups) => prevCheckups.map((checkup) => (checkup._id === selectedCheckup._id ? { ...checkup, doctorNotes: doctorNotes } : checkup)));

      // Show success message briefly
      setError("Notes saved successfully!");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error saving notes:", err);
      setError("Failed to save notes. Please try again.");
    }
  };

  // AI consultation function
  const handleConsultAI = async () => {
    if (!doctorNotes.trim()) {
      setError("Please enter medical notes first");
      return;
    }
    if (!selectedCheckup) {
      setError("No checkup selected for analysis");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prompt = `
        Analyze the provided medical notes and return a JSON response with the following structure:
        {
          "diagnosis": "Primary diagnosis based on symptoms",
          "likely_cause": "Most probable underlying cause",
          "diseases": ["Array of potential diseases/conditions"],
          "recommended_actions": "Recommended next steps and treatments"
        }
        
        Patient Medical Notes: "${doctorNotes}"
        
        Please analyze these notes and provide your assessment in the specified JSON format.
      `;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              diagnosis: { type: "STRING" },
              likely_cause: { type: "STRING" },
              diseases: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              recommended_actions: { type: "STRING" },
            },
            required: ["diagnosis", "likely_cause", "diseases", "recommended_actions"],
          },
        },
      };

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed with status: ${response.status}`);
      }

      const result = await response.json();

      // The API returns the structured JSON as a string within the text part
      const aiAnalysisString = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiAnalysisString) {
        throw new Error("No AI analysis content received.");
      }

      const analysisData = JSON.parse(aiAnalysisString);

      // Save the AI response to the checkup
      await axios.put(
        `${API_URL}/checkups/${selectedCheckup._id}`,
        {
          aiResponse: JSON.stringify(analysisData),
          doctorNotes: doctorNotes,
        },
        { headers: getAuthHeaders() }
      );

      setAiResponse(analysisData);
    } catch (err) {
      console.error("AI consultation error:", err);
      setError(`AI consultation failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Result card component for displaying AI response
  const ResultCard = ({ title, content }) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{content}</p>
    </div>
  );

  // Render AI response section
  const renderAIResponse = () => {
    if (isAnalyzing) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    if (aiResponse) {
      return (
        <div className="space-y-4">
          <ResultCard title="AI Diagnosis" content={aiResponse.diagnosis} />
          <ResultCard title="Likely Causes" content={aiResponse.likely_cause} />
          <ResultCard title="Potential Diseases" content={Array.isArray(aiResponse.diseases) ? aiResponse.diseases.join(", ") : aiResponse.diseases} />
          <ResultCard title="Recommended Actions" content={aiResponse.recommended_actions} />
        </div>
      );
    }
    return <p className="text-gray-500">AI insights will appear here after consultation</p>;
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Patient Checkup</h1>
            <button onClick={() => navigate("/doctor/patient")} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Home size={20} />
              All Patients
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <div className={`mb-6 px-4 py-3 rounded-lg ${error.includes("successfully") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>{error}</div>}

        {/* Patient Information */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/5"></div>
            </div>
          </div>
        ) : patient ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{patient.name}</h2>
                <div className="mt-2 space-y-1 text-gray-600">
                  <p>ID: {patient._id}</p>
                  <p>Gender: {patient.gender}</p>
                  <p>Date of Birth: {formatDate(patient.dateOfBirth)}</p>
                  <p>Phone: {patient.phone}</p>
                  <p>Address: {patient.address}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <p className="text-gray-500">Patient not found</p>
            </div>
          )
        )}

        {/* Checkups Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Checkup List */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Checkups</h3>
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="animate-pulse">
                        <div className="h-16 bg-gray-100 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : checkups.length > 0 ? (
                  checkups.map((checkup) => (
                    <button
                      key={checkup._id}
                      onClick={() => handleCheckupSelect(checkup)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${selectedCheckup?._id === checkup._id ? "bg-blue-50 border-2 border-blue-500" : "hover:bg-gray-50 border-2 border-transparent"}`}
                    >
                      <p className="font-medium">Checkup on {formatDate(checkup.date)}</p>
                      <p className="text-sm text-gray-600">{checkup.type || "General Checkup"}</p>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No checkups found</p>
                )}
              </div>
            </div>
          </div>

          {/* Checkup Details */}
          <div className="col-span-8">
            {selectedCheckup ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Checkup Details</h3>

                {/* Show read-only details for nurse checkups, editable for doctor checkups */}
                {selectedCheckup.type === "nurse" ? (
                  <div className="prose max-w-none mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Nurse Notes:</h4>
                      <p className="whitespace-pre-wrap">{selectedCheckup.details || "No details available"}</p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="w-full h-48 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Enter your medical notes here..."
                  />
                )}

                {/* AI Response Section */}
                <div className="pt-6 border-t">
                  <h4 className="text-lg font-semibold mb-4">AI Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[100px] mb-4">{renderAIResponse()}</div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    {selectedCheckup.type !== "nurse" && (
                      <button onClick={handleSaveNotes} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Save Notes
                      </button>
                    )}
                    <button
                      onClick={handleConsultAI}
                      disabled={isAnalyzing || !doctorNotes.trim()}
                      className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? "Analyzing..." : "Consult with AI"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">Select a checkup from the list to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCheckup;
