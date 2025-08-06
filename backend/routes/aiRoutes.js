const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// AI Medical Analysis endpoint
router.post('/analyze-checkup', async (req, res) => {
    try {
        const { patientInfo, checkupDetails, symptoms, vitalSigns, doctorNotes } = req.body;

        // Validate required data
        if (!checkupDetails && !symptoms && !doctorNotes) {
            return res.status(400).json({ 
                message: 'Insufficient data for analysis. Please provide checkup details, symptoms, or doctor notes.' 
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

        console.log('Starting AI analysis with data:', {
            patientAge: patientInfo?.age,
            hasSymptoms: !!symptoms,
            hasCheckupDetails: !!checkupDetails,
            hasDoctorNotes: !!doctorNotes,
            hasVitalSigns: !!vitalSigns
        });

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Construct the medical analysis prompt
        const prompt = `You are a medical AI assistant. Analyze this patient case and respond with ONLY valid JSON (no markdown, no additional text).

PATIENT: Age ${patientInfo?.age || 'Unknown'}, Gender: ${patientInfo?.gender || 'Unknown'}
MEDICAL HISTORY: ${patientInfo?.medicalHistory || 'None provided'}

${symptoms ? `SYMPTOMS: ${symptoms}` : ''}
${checkupDetails ? `EXAMINATION: ${checkupDetails}` : ''}
${doctorNotes ? `DOCTOR NOTES: ${doctorNotes}` : ''}

${vitalSigns && Object.values(vitalSigns).some(v => v) ? `VITAL SIGNS:
${vitalSigns.temperature ? `Temperature: ${vitalSigns.temperature}°C` : ''}
${vitalSigns.bloodPressure ? `BP: ${vitalSigns.bloodPressure}` : ''}
${vitalSigns.heartRate ? `HR: ${vitalSigns.heartRate} bpm` : ''}
${vitalSigns.weight ? `Weight: ${vitalSigns.weight} kg` : ''}
${vitalSigns.height ? `Height: ${vitalSigns.height} cm` : ''}` : ''}

Respond with ONLY this JSON structure (no markdown formatting):
{
  "possibleDiagnoses": ["diagnosis 1", "diagnosis 2", "diagnosis 3"],
  "recommendedActions": "specific medical actions and tests to consider",
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "followUpRecommendations": "follow-up care recommendations",
  "confidence": 75,
  "confidenceExplanation": "explanation of confidence level",
  "additionalConsiderations": "additional medical considerations"
}`;

        console.log('Sending request to Gemini AI...');

        // Generate AI response - use simple configuration to avoid safety setting issues
        const result = await model.generateContent(prompt);

        const response = await result.response;
        let text = response.text();
        
        console.log('Raw AI response received:', text?.substring(0, 200) + '...');

        if (!text) {
            throw new Error('Empty response from AI service');
        }

        // Clean the response text more thoroughly
        text = text.trim();
        
        // Log the raw response for debugging
        console.log('Raw response before cleaning:', JSON.stringify(text.substring(0, 300)));
        
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

        console.log('Cleaned response:', JSON.stringify(text.substring(0, 200)));
        
        if (!text || text.length < 2) {
            throw new Error('Empty or invalid response after cleaning');
        }

        let aiAnalysis;
        try {
            // Try to parse the JSON response directly first
            aiAnalysis = JSON.parse(text);
            console.log('Successfully parsed AI response directly');
        } catch (parseError) {
            console.error('Direct JSON parsing failed:', parseError.message);
            console.log('Attempting to extract JSON from markdown-formatted response...');
            
            // Try to extract JSON from markdown code blocks
            let jsonText = text;
            
            // Remove markdown code blocks
            jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '');
            
            // Try to find JSON object in the text
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    aiAnalysis = JSON.parse(jsonMatch[0]);
                    console.log('Successfully extracted and parsed JSON from markdown');
                } catch (extractError) {
                    console.error('JSON extraction also failed:', extractError.message);
                    console.error('Extracted text was:', jsonMatch[0]);
                    
                    // Last resort: try to clean up common issues
                    let cleanedJson = jsonMatch[0];
                    
                    // Fix common JSON issues
                    cleanedJson = cleanedJson
                        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
                        .replace(/:\s*([^",{\[\d][^,}\]]*)/g, ': "$1"'); // Quote unquoted string values
                    
                    try {
                        aiAnalysis = JSON.parse(cleanedJson);
                        console.log('Successfully parsed cleaned JSON');
                    } catch (finalError) {
                        console.error('Final JSON parsing attempt failed:', finalError.message);
                        throw new Error(`Unable to parse AI response as JSON. Original error: ${parseError.message}`);
                    }
                }
            } else {
                console.error('No JSON pattern found in response');
                throw new Error('No JSON found in AI response');
            }
        }

        // Validate and clean the response structure
        const cleanedAnalysis = {
            possibleDiagnoses: Array.isArray(aiAnalysis.possibleDiagnoses) 
                ? aiAnalysis.possibleDiagnoses.filter(d => d && typeof d === 'string').slice(0, 5)
                : ['Analysis requires manual review'],
            
            recommendedActions: typeof aiAnalysis.recommendedActions === 'string' 
                ? aiAnalysis.recommendedActions.trim()
                : 'Please proceed with standard clinical assessment',
            
            riskFactors: Array.isArray(aiAnalysis.riskFactors) 
                ? aiAnalysis.riskFactors.filter(r => r && typeof r === 'string').slice(0, 5)
                : [],
            
            followUpRecommendations: typeof aiAnalysis.followUpRecommendations === 'string' 
                ? aiAnalysis.followUpRecommendations.trim()
                : 'Follow standard clinical protocols',
            
            confidence: typeof aiAnalysis.confidence === 'number' && aiAnalysis.confidence >= 0 && aiAnalysis.confidence <= 100
                ? Math.round(aiAnalysis.confidence)
                : 75,
            
            confidenceExplanation: typeof aiAnalysis.confidenceExplanation === 'string' 
                ? aiAnalysis.confidenceExplanation.trim()
                : 'Standard confidence level for AI medical analysis',
            
            additionalConsiderations: typeof aiAnalysis.additionalConsiderations === 'string' 
                ? aiAnalysis.additionalConsiderations.trim()
                : 'Continue monitoring patient condition',
            
            // Add metadata
            analyzedAt: new Date().toISOString(),
            aiModel: "gemini-1.5-flash",
            analysisVersion: "2.0"
        };

        console.log('Sending cleaned analysis:', {
            diagnosesCount: cleanedAnalysis.possibleDiagnoses.length,
            confidence: cleanedAnalysis.confidence,
            hasRecommendations: !!cleanedAnalysis.recommendedActions
        });

        res.json(cleanedAnalysis);

    } catch (error) {
        console.error('AI Analysis Error Details:', {
            message: error.message,
            name: error.name,
            stack: error.stack?.split('\n')[0]
        });
        
        // Handle specific Google AI API errors
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

        // Return a structured error response that matches the expected format
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
            analysisVersion: "2.0",
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