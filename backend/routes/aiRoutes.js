const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

router.post('/analyze-checkup', async (req, res) => {
    try {
        const { patientInfo, checkupDetails, symptoms, vitalSigns, doctorNotes } = req.body;

        // Enhanced validation for imported nurse data
        const hasCheckupDetails = checkupDetails && checkupDetails.trim() &&
            checkupDetails !== "No physical examination details provided";
        const hasSymptoms = symptoms && symptoms.trim() &&
            symptoms !== "No symptoms recorded";
        const hasDoctorNotes = doctorNotes && doctorNotes.trim() &&
            !doctorNotes.includes("No doctor diagnosis yet");
        const hasVitalSigns = vitalSigns && Object.values(vitalSigns).some(v => v && v.trim());

        // More lenient validation - accept if we have ANY meaningful data
        if (!hasCheckupDetails && !hasSymptoms && !hasDoctorNotes && !hasVitalSigns) {
            return res.status(400).json({
                message: 'Insufficient data for analysis. Please provide at least some checkup details, symptoms, vital signs, or doctor notes.'
            });
        }

        // Validate API key
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.error('Google AI API key not found in environment variables');
            return res.status(500).json({
                message: 'AI service configuration error. Please contact system administrator.',
                error: 'API key not configured'
            });
        }

        console.log('Starting AI analysis with enhanced data validation:', {
            patientAge: patientInfo?.age,
            hasSymptoms: hasSymptoms,
            hasCheckupDetails: hasCheckupDetails,
            hasDoctorNotes: hasDoctorNotes,
            hasVitalSigns: hasVitalSigns,
            isImportedFromNurse: symptoms?.includes("Nurse Initial Assessment")
        });

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Enhanced prompt for imported nurse data
        const prompt = `You are a medical AI assistant analyzing patient data. This may include initial assessment by a nurse that was imported for doctor review. Analyze this case and respond with ONLY valid JSON (no markdown, no additional text).

PATIENT: Age ${patientInfo?.age || 'Unknown'}, Gender: ${patientInfo?.gender || 'Unknown'}
MEDICAL HISTORY: ${patientInfo?.medicalHistory || 'None provided'}

${symptoms ? `SYMPTOMS/COMPLAINTS: ${symptoms}` : ''}
${checkupDetails && hasCheckupDetails ? `PHYSICAL EXAMINATION: ${checkupDetails}` : ''}
${doctorNotes && hasDoctorNotes ? `DOCTOR NOTES: ${doctorNotes}` : ''}

${hasVitalSigns ? `VITAL SIGNS:
${vitalSigns.temperature ? `Temperature: ${vitalSigns.temperature}°C` : ''}
${vitalSigns.bloodPressure ? `Blood Pressure: ${vitalSigns.bloodPressure}` : ''}
${vitalSigns.heartRate ? `Heart Rate: ${vitalSigns.heartRate} bpm` : ''}
${vitalSigns.weight ? `Weight: ${vitalSigns.weight} kg` : ''}
${vitalSigns.height ? `Height: ${vitalSigns.height} cm` : ''}` : 'No vital signs recorded'}

${symptoms?.includes("Nurse Initial Assessment") ? `

NOTE: This analysis includes initial assessment data from nursing staff. Please provide preliminary diagnostic considerations that can help guide the doctor's examination and final diagnosis.` : ''}

Respond with ONLY this JSON structure (no markdown formatting):
{
  "possibleDiagnoses": ["most likely diagnosis", "alternative diagnosis", "differential diagnosis"],
  "recommendedActions": "specific medical actions, tests, and examinations to consider",
  "riskFactors": ["relevant risk factor 1", "risk factor 2"],
  "followUpRecommendations": "follow-up care and monitoring recommendations",
  "confidence": 75,
  "confidenceExplanation": "explanation of confidence level and data limitations",
  "additionalConsiderations": "additional medical considerations and red flags to watch for"
}`;

        console.log('Sending request to Gemini AI with enhanced prompt...');

        // Generate AI response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('Raw AI response received:', text?.substring(0, 200) + '...');

        if (!text) {
            throw new Error('Empty response from AI service');
        }

        // Clean the response text more thoroughly
        text = text.trim();

        // Remove markdown code blocks if present (case insensitive)
        text = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');

        // Remove any extra whitespace, newlines at start/end
        text = text.replace(/^\s+|\s+$/g, '');

        // Ensure we have the JSON object boundaries
        if (!text.startsWith('{')) {
            const startIndex = text.indexOf('{');
            if (startIndex !== -1) {
                text = text.substring(startIndex);
            }
        }

        if (!text.endsWith('}')) {
            const endIndex = text.lastIndexOf('}');
            if (endIndex !== -1) {
                text = text.substring(0, endIndex + 1);
            }
        }

        console.log('Cleaned response for parsing...');

        if (!text || text.length < 2) {
            throw new Error('Empty or invalid response after cleaning');
        }

        let aiAnalysis;
        try {
            // Try to parse the JSON response directly first
            aiAnalysis = JSON.parse(text);
            console.log('Successfully parsed AI response for imported data');
        } catch (parseError) {
            console.error('JSON parsing failed for imported data:', parseError.message);

            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiAnalysis = JSON.parse(jsonMatch[0]);
                    console.log('Successfully extracted and parsed JSON');
                } catch (extractError) {
                    console.error('JSON extraction failed:', extractError.message);
                    throw new Error(`Unable to parse AI response as JSON: ${parseError.message}`);
                }
            } else {
                throw new Error('No JSON found in AI response');
            }
        }

        // Enhanced validation and cleaning for imported data
        const cleanedAnalysis = {
            possibleDiagnoses: Array.isArray(aiAnalysis.possibleDiagnoses)
                ? aiAnalysis.possibleDiagnoses
                    .filter(d => d && typeof d === 'string')
                    .slice(0, 5)
                    .map(d => d.trim())
                : ['Preliminary assessment needed - insufficient data for specific diagnosis'],

            recommendedActions: typeof aiAnalysis.recommendedActions === 'string'
                ? aiAnalysis.recommendedActions.trim()
                : 'Complete physical examination and obtain additional history as needed',

            riskFactors: Array.isArray(aiAnalysis.riskFactors)
                ? aiAnalysis.riskFactors
                    .filter(r => r && typeof r === 'string')
                    .slice(0, 5)
                    .map(r => r.trim())
                : [],

            followUpRecommendations: typeof aiAnalysis.followUpRecommendations === 'string'
                ? aiAnalysis.followUpRecommendations.trim()
                : 'Schedule follow-up based on clinical assessment and patient response to initial treatment',

            confidence: typeof aiAnalysis.confidence === 'number' &&
                       aiAnalysis.confidence >= 0 && aiAnalysis.confidence <= 100
                ? Math.round(aiAnalysis.confidence)
                : (symptoms?.includes("Nurse Initial Assessment") ? 65 : 75), // Lower confidence for nurse-imported data

            confidenceExplanation: typeof aiAnalysis.confidenceExplanation === 'string'
                ? aiAnalysis.confidenceExplanation.trim()
                : (symptoms?.includes("Nurse Initial Assessment")
                    ? 'Analysis based on initial nursing assessment - doctor examination needed for definitive diagnosis'
                    : 'Standard confidence level for AI medical analysis'),

            additionalConsiderations: typeof aiAnalysis.additionalConsiderations === 'string'
                ? aiAnalysis.additionalConsiderations.trim()
                : 'Continue monitoring patient condition and complete comprehensive examination',

            // Add metadata with imported data flag
            analyzedAt: new Date().toISOString(),
            aiModel: "gemini-1.5-flash",
            analysisVersion: "2.1",
            dataSource: symptoms?.includes("Nurse Initial Assessment") ? "nurse_imported" : "direct_entry"
        };

        console.log('Sending enhanced analysis for imported data:', {
            diagnosesCount: cleanedAnalysis.possibleDiagnoses.length,
            confidence: cleanedAnalysis.confidence,
            dataSource: cleanedAnalysis.dataSource,
            hasRecommendations: !!cleanedAnalysis.recommendedActions
        });

        res.json(cleanedAnalysis);

    } catch (error) {
        console.error('AI Analysis Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n')[0]
        });

        // Handle specific errors
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
            return res.status(500).json({
                message: 'AI service configuration error. Please verify API key.',
                error: 'Invalid or missing API key'
            });
        }

        if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.message?.includes('quota')) {
            return res.status(429).json({
                message: 'AI service is temporarily busy. Please try again in a few moments.',
                error: 'Rate limit exceeded'
            });
        }

        if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
            return res.status(400).json({
                message: 'AI analysis could not be completed due to content policies.',
                error: 'Content safety restriction'
            });
        }

        // Return a structured error response for imported data
        res.status(500).json({
            possibleDiagnoses: ['AI analysis temporarily unavailable - please review manually'],
            recommendedActions: 'AI service encountered an error. Please proceed with standard clinical assessment and consider consulting with colleagues.',
            riskFactors: [],
            followUpRecommendations: 'Follow institutional clinical protocols and schedule appropriate follow-up based on clinical judgment.',
            confidence: 0,
            confidenceExplanation: `AI service error: ${error.message}`,
            additionalConsiderations: 'Manual clinical review required due to AI service interruption. Consider second opinion if complex case.',
            analyzedAt: new Date().toISOString(),
            aiModel: "gemini-1.5-flash",
            analysisVersion: "2.1",
            dataSource: "error",
            error: true,
            errorMessage: error.message
        });
    }
});

// Health check endpoint for AI service
router.get('/health', async (req, res) => {
    try {
        if (!process.env.GOOGLE_AI_API_KEY) {
            return res.status(503).json({
                status: 'unavailable',
                message: 'Google AI API key not configured'
            });
        }

        console.log('Testing AI service health...');

        // Test the AI service with a simple prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent('Respond with exactly: {"status":"healthy"}');
        const response = await result.response;
        const text = response.text();

        console.log('Health check response:', text);

        if (text.includes('healthy') || text.includes('status')) {
            res.json({
                status: 'healthy',
                message: 'AI analysis service is operational',
                model: 'gemini-1.5-flash',
                timestamp: new Date().toISOString(),
                apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY
            });
        } else {
            res.status(503).json({
                status: 'degraded',
                message: 'AI service responding but may have issues',
                response: text
            });
        }

    } catch (error) {
        console.error('AI Health Check Error:', error);
        res.status(503).json({
            status: 'unhealthy',
            message: 'AI analysis service is not responding',
            error: error.message,
            apiKeyConfigured: !!process.env.GOOGLE_AI_API_KEY
        });
    }
});

// Get AI analysis statistics (optional - for admin dashboard)
router.get('/stats', async (req, res) => {
    try {
        res.json({
            service: 'Google Generative AI',
            model: 'gemini-1.5-flash',
            status: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'not_configured',
            version: '2.0',
            features: [
                'Medical diagnosis analysis',
                'Risk factor assessment',
                'Treatment recommendations',
                'Follow-up planning'
            ],
            lastHealthCheck: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;