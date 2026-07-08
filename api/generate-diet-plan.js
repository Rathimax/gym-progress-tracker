export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('[generate-diet-plan] GEMINI_API_KEY is not set.');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: API key not set.'
            });
        }

        const {
            uid,
            bmi,
            category,
            weight,
            height,
            age,
            sex,
            goal,
            dietType,
            strictness,
            specialRequirements
        } = req.body || {};

        if (!bmi || !weight || !height) {
            return res.status(400).json({
                success: false,
                error: 'Missing required physical data (bmi, weight, height).'
            });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const promptText = `Generate a personalized diet plan based on the following user data:
- BMI: ${bmi} (${category || 'Unknown'})
- Weight: ${weight} kg
- Height: ${height} cm
- Age: ${age || 'Unknown'}
- Sex: ${sex || 'Unknown'}
- Fitness Goal: ${goal || 'Maintain'}
- Diet Preference: ${dietType || 'Any'} (Veg/Non-Veg)
- strictness Level: ${strictness || 'Moderate'}
${specialRequirements ? `- Special Requirements / Allergies: ${specialRequirements}` : ''}

Create a plan tailored to their goal, diet preference, strictness level, and any special requirements. 

Return ONLY a STRICT JSON object with no markdown fences, no preamble, and no extra text, in this exact shape:
{
  "summary": "A 1-2 sentence encouraging summary of the plan strategy.",
  "dailyCalorieTarget": (number),
  "macros": {
    "protein_g": (number),
    "carbs_g": (number),
    "fats_g": (number)
  },
  "meals": [
    {
      "name": "Breakfast",
      "items": ["Item 1", "Item 2"],
      "approxCalories": (number)
    }
  ],
  "notes": ["Note 1", "Note 2"]
}`;

        const geminiBody = {
            contents: [{
                parts: [{ text: promptText }]
            }],
            generationConfig: {
                temperature: 0.3 // Low variance for JSON compliance, but a bit of creativity for meals
            }
        };

        const aiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error(`[generate-diet-plan] Gemini API returned non-OK status ${aiRes.status}:`, errorText);
            return res.status(aiRes.status).json({
                success: false,
                error: `Gemini API error (${aiRes.status})`,
                details: errorText
            });
        }

        const aiData = await aiRes.json();
        const parts = aiData.candidates?.[0]?.content?.parts || [];
        let rawText = parts.map(p => (p.text || '')).join(' ').trim();
        
        if (!rawText) {
            return res.status(500).json({
                success: false,
                error: 'Gemini returned an empty response.'
            });
        }

        // Defensive parsing
        rawText = rawText
            .replace(/```json\s*/gi, '')
            .replace(/```/g, '')
            .trim();

        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            rawText = rawText.slice(firstBrace, lastBrace + 1);
        }

        let parsedJson;
        try {
            parsedJson = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('[generate-diet-plan] JSON.parse failed. Raw text was:', rawText);
            return res.status(500).json({
                success: false,
                error: 'AI response was not valid JSON.',
                rawResponse: rawText
            });
        }

        // Basic validation
        if (!parsedJson.summary || typeof parsedJson.dailyCalorieTarget !== 'number' || !parsedJson.meals) {
             console.warn('[generate-diet-plan] JSON missing keys, but returning anyway.', parsedJson);
        }

        return res.status(200).json({ success: true, planData: parsedJson });
    } catch (error) {
        console.error('[generate-diet-plan] Unhandled error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during plan generation.',
            details: error.message
        });
    }
}
