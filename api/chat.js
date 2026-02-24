export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call Gemini API using native fetch
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const geminiBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
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
            console.error("Gemini API Error:", errorText);
            return res.status(response.status).json({ error: 'Failed to fetch from Gemini API', details: errorText });
        }

        const data = await response.json();
        return res.status(200).json({
            text: data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error('Error in chat API:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
