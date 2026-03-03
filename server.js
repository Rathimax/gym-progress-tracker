import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('API key missing');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        const geminiBody = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                role: "user",
                parts: [{
                    text: "You are FitTrack AI, a helpful Gym AI Assistant. You have access to the user's workout history. Only answer gym, fitness, and nutrition related queries. Be concise, motivating, and helpful. Reference their history when relevant to provide personalized answers. If asked something unrelated to fitness or nutrition, politely decline."
                }]
            }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Error:', errorText);
            return res.status(response.status).json({ error: 'Failed to fetch', details: errorText });
        }

        const data = await response.json();
        return res.status(200).json({
            text: data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error('Error in chat API:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ==========================================
// AI DIET COACH API
// ==========================================
app.post('/api/diet-coach', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('API key missing');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { message, context, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        // Build context string from user's real nutrition data
        let contextStr = '';
        if (context) {
            contextStr = `\n\nUSER'S CURRENT NUTRITION DATA:
- Today's Calories: ${context.todayCalories || 0} / ${context.calorieTarget || 2000} kcal
- Today's Protein: ${context.todayProtein || 0}g / ${context.proteinTarget || 120}g
- Today's Carbs: ${context.todayCarbs || 0}g
- Today's Fat: ${context.todayFat || 0}g
- Weekly Average Calories: ${context.weeklyAvgCalories || 'N/A'} kcal
- Weekly Average Protein: ${context.weeklyAvgProtein || 'N/A'}g
- Protein Consistency Score: ${context.proteinConsistency || 'N/A'}%
- Current Streak: ${context.currentStreak || 0} days
- Goal Type: ${context.goalType || 'Maintain'}
- Water Intake Today: ${context.todayWater || 0}ml / ${context.waterTarget || 2500}ml
- Coaching Style Preference: ${context.coachingStyle || 'Balanced'}`;
        }

        // Build conversation history for multi-turn
        const contents = [];
        if (history && history.length > 0) {
            history.forEach(h => {
                contents.push({ role: h.role, parts: [{ text: h.text }] });
            });
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const coachingTone = context?.coachingStyle === 'Strict'
            ? 'Be direct, firm, and no-nonsense. Call out bad habits directly.'
            : context?.coachingStyle === 'Motivational'
                ? 'Be very encouraging, positive, and celebratory. Focus on wins and progress.'
                : 'Be balanced — honest but supportive. Mix praise with constructive feedback.';

        const systemPrompt = `You are FitTrack Diet Coach, a premium AI nutrition coach. You have real-time access to the user's actual nutrition data.${contextStr}

COACHING RULES:
1. Always reference the user's REAL numbers in your responses (e.g., "You've eaten 910 of your 2000 kcal target today").
2. ${coachingTone}
3. Identify patterns and suggest specific, actionable improvements.
4. Keep responses concise (2-4 short paragraphs max). Use bullet points when listing suggestions.
5. If the user asks something unrelated to nutrition, diet, or health, politely redirect.
6. Use emoji sparingly for emphasis (🔥, 💪, ✅, ⚠️).
7. Never invent data — only reference the numbers provided above.`;

        const geminiBody = {
            contents: contents,
            systemInstruction: {
                role: "user",
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini Diet Coach Error:', errorText);
            return res.status(response.status).json({ error: 'Failed to fetch', details: errorText });
        }

        const data = await response.json();
        return res.status(200).json({
            text: data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error('Error in diet-coach API:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ==========================================
// AI FOOD SCANNER API
// ==========================================
app.post('/api/analyze-food', async (req, res) => {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('API key missing');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { imageBase64, mimeType, uid } = req.body;
        console.log(`[API] Received analyze request for UID: ${uid}`);
        if (!imageBase64 || !mimeType) return res.status(400).json({ error: 'Image data is required' });

        // Step 1: Query Gemini Vision
        console.log('[API] Querying Gemini Vision API...');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        const promptText = `
Analyze this food image and provide nutritional estimates.
Return a STRICTly formatted JSON object with no markdown wrappers, no backticks, and no extra text.
The JSON must have exactly these keys:
{
  "food": "Name of the food detected",
  "estimatedQuantity": "e.g., 1 bowl, 200g, 1 slice",
  "calories": number (estimated total calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams)
}
If there are multiple foods, combine their totals. If it's not food, set default 0s but describe what you see in the 'food' field.`;

        const geminiBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: imageBase64
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1 // Low variance for stricter JSON compliance
            }
        };

        const aiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error('Gemini Vision Error:', errorText);
            return res.status(aiRes.status).json({ error: 'Failed to analyze image' });
        }

        const data = await aiRes.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Strip out triple backticks if the model ignores the instruction
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedJson = JSON.parse(rawText);
        return res.status(200).json({ success: true, data: parsedJson });

    } catch (error) {
        console.error('Error in analyze-food API:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
