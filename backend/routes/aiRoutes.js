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

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Construct the medical analysis prompt
        const prompt = `
You are an experienced medical AI assistant helping doctors with diagnostic analysis. Please analyze the following patient case and provide structured medical insights.

PATIENT INFORMATION:
- Age: ${patientInfo.age} years
- Gender: ${patientInfo.gender}
- Medical History: ${patientInfo.medicalHistory}

CLINICAL DATA:
${symptoms ? `Chief Complaints/Symptoms: ${symptoms}` : ''}

${vitalSigns && Object.values(vitalSigns).some(v => v) ? `
Vital Signs:
${vitalSigns.temperature ? `- Temperature: ${vitalSigns.temperature}°C` : ''}
${vitalSigns.bloodPressure ? `- Blood Pressure: ${vitalSigns.bloodPressure}` : ''}
${vitalSigns.heartRate ? `- Heart Rate: ${vitalSigns.heartRate} bpm` : ''}
${vitalSigns.weight ? `- Weight: ${vitalSigns.weight} kg` : ''}
${vitalSigns.height ? `- Height: ${vitalSigns.height} cm` : ''}
` : ''}

${checkupDetails ? `Physical Examination & Findings: ${checkupDetails}` : ''}

${doctorNotes ? `Doctor's Initial Assessment: ${doctorNotes}` : ''}

Please provide a structured analysis in the following JSON format:
{
  "possibleDiagnoses": ["List of 3-5 most likely diagnoses based on the symptoms and findings"],
  "recommendedActions": "Specific medical actions, tests, or treatments to consider",
  "riskFactors": ["List of risk factors identified from the case"],
  "followUpRecommendations": "Recommendations for follow-up care and monitoring",
  "confidence": 85,
  "confidenceExplanation": "Brief explanation of confidence level and any limitations in the analysis",
  "additionalConsiderations": "Any additional medical considerations or red flags to monitor"
}

IMPORTANT GUIDELINES:
1. Base your analysis only on the provided clinical data
2. Consider differential diagnoses appropriate for the patient's age and gender
3. Prioritize patient safety - err on the side of caution
4. Include appropriate follow-up recommendations
5. Be honest about limitations and confidence levels
6. Do not provide specific medication dosages or definitive diagnoses
7. Always recommend professional medical judgment takes precedence

Provide only the JSON response without additional text.`;

        // Generate AI response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            // Parse the JSON response from AI
            const aiAnalysis = JSON.parse(text);
            
            // Validate the response structure
            const requiredFields = ['possibleDiagnoses', 'recommendedActions', 'confidence'];
            const missingFields = requiredFields.filter(field => !aiAnalysis[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`AI response missing required fields: ${missingFields.join(', ')}`);
            }

            // Ensure confidence is a number between 0-100
            if (typeof aiAnalysis.confidence !== 'number' || aiAnalysis.confidence < 0 || aiAnalysis.confidence > 100) {
                aiAnalysis.confidence = 75; // Default confidence
                aiAnalysis.confidenceExplanation = "Confidence level adjusted due to parsing issues";
            }

            // Add metadata
            aiAnalysis.analyzedAt = new Date().toISOString();
            aiAnalysis.aiModel = "gemini-1.5-flash";
            aiAnalysis.analysisVersion = "1.0";

            res.json(aiAnalysis);

        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            console.error('Raw AI response:', text);
            
            // Fallback response if JSON parsing fails
            res.json({
                possibleDiagnoses: ["Unable to parse AI analysis - please review manually"],
                recommendedActions: "AI analysis temporarily unavailable. Please proceed with standard clinical assessment.",
                riskFactors: [],
                followUpRecommendations: "Follow standard clinical protocols for this presentation",
                confidence: 0,
                confidenceExplanation: "AI analysis parsing failed - human review required",
                additionalConsiderations: "AI system encountered parsing issues. Rely on clinical judgment.",
                analyzedAt: new Date().toISOString(),
                aiModel: "gemini-1.5-flash",
                analysisVersion: "1.0",
                error: "Response parsing failed"
            });
        }

    } catch (error) {
        console.error('AI Analysis Error:', error);
        
        // Handle specific Google AI API errors
        if (error.message?.includes('API_KEY_INVALID')) {
            return res.status(500).json({ 
                message: 'AI service configuration error. Please contact system administrator.',
                error: 'Invalid API key'
            });
        }
        
        if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
            return res.status(429).json({ 
                message: 'AI service is temporarily busy. Please try again in a few moments.',
                error: 'Rate limit exceeded'
            });
        }
        
        if (error.message?.includes('SAFETY')) {
            return res.status(400).json({ 
                message: 'AI analysis could not be completed due to content safety policies.',
                error: 'Content safety restriction'
            });
        }

        // Generic error response
        res.status(500).json({ 
            message: 'AI analysis service is temporarily unavailable. Please proceed with manual analysis.',
            error: error.message,
            fallbackAnalysis: {
                possibleDiagnoses: ["AI analysis unavailable - clinical assessment required"],
                recommendedActions: "Proceed with standard diagnostic workup based on clinical presentation",
                riskFactors: [],
                followUpRecommendations: "Follow institutional clinical protocols",
                confidence: 0,
                confidenceExplanation: "AI service unavailable",
                additionalConsiderations: "Manual clinical review required due to AI service interruption",
                analyzedAt: new Date().toISOString(),
                aiModel: "gemini-1.5-flash",
                analysisVersion: "1.0",
                serviceStatus: "unavailable"
            }
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

        // Test the AI service with a simple prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Respond with: 'AI service is healthy'");
        const response = await result.response;
        const text = response.text();

        if (text.includes('healthy')) {
            res.json({
                status: 'healthy',
                message: 'AI analysis service is operational',
                model: 'gemini-1.5-flash',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'degraded',
                message: 'AI service responding but may have issues'
            });
        }

    } catch (error) {
        console.error('AI Health Check Error:', error);
        res.status(503).json({
            status: 'unhealthy',
            message: 'AI analysis service is not responding',
            error: error.message
        });
    }
});

// Get AI analysis statistics (optional - for admin dashboard)
router.get('/stats', async (req, res) => {
    try {
        // This would typically query your database for AI analysis usage stats
        // For now, return basic info
        res.json({
            service: 'Google Generative AI',
            model: 'gemini-1.5-flash',
            status: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'not_configured',
            version: '1.0',
            features: [
                'Medical diagnosis analysis',
                'Risk factor assessment',
                'Treatment recommendations',
                'Follow-up planning'
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;