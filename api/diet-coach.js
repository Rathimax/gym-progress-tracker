export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('API key missing');
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { message, context, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood! I'm ready to be your personal diet coach." }] },
                ...contents
            ]
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
}
