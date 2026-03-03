export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            console.error('[refine-food] GEMINI_API_KEY is not set in environment variables.');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: API key not set. Add GEMINI_API_KEY in Vercel project settings.'
            });
        }

        const {
            uid,
            currentFood,
            quantity,
            calories,
            protein,
            carbs,
            fat,
            correction
        } = req.body || {};

        if (!correction || !currentFood) {
            return res.status(400).json({
                success: false,
                error: 'Missing correction or currentFood in request body.'
            });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const baseJson = {
            food: currentFood,
            estimatedQuantity: quantity || '',
            calories: typeof calories === 'number' ? calories : 0,
            protein: typeof protein === 'number' ? protein : 0,
            carbs: typeof carbs === 'number' ? carbs : 0,
            fat: typeof fat === 'number' ? fat : 0
        };

        const promptText = `You previously estimated macros for a meal from an image using this JSON:
${JSON.stringify(baseJson, null, 2)}

The user says your detection is partially wrong or incomplete and has provided this correction:
"${correction}"

Update the JSON so that:
- "food" reflects the corrected meal name (e.g., "masala dosa" instead of "plain dosa").
- "estimatedQuantity" is updated if needed based on the correction.
- "calories", "protein", "carbs", and "fat" reflect the corrected dish as realistically as possible.

Return ONLY a STRICT JSON object with exactly these keys:
{
  "food": "Corrected food name",
  "estimatedQuantity": "Updated quantity string",
  "calories": (number - integer total kcal),
  "protein": (number - grams as decimal),
  "carbs": (number - grams as decimal),
  "fat": (number - grams as decimal)
}

Do not include any markdown, commentary, or text outside the JSON.`;

        const geminiBody = {
            contents: [{
                parts: [{ text: promptText }]
            }],
            generationConfig: {
                temperature: 0.2
            }
        };

        const aiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error(`[refine-food] Gemini API returned non-OK status ${aiRes.status}:`, errorText);
            return res.status(aiRes.status).json({
                success: false,
                error: `Gemini API error (${aiRes.status})`,
                details: errorText
            });
        }

        const aiData = await aiRes.json();

        // Concatenate all text parts in case the model split the JSON
        const parts = aiData.candidates?.[0]?.content?.parts || [];
        let rawText = parts.map(p => (p.text || '')).join(' ').trim();
        if (!rawText) {
            return res.status(500).json({
                success: false,
                error: 'Gemini returned an empty response for refinement.'
            });
        }

        rawText = rawText
            .replace(/```json\s*/gi, '')
            .replace(/```/g, '')
            .trim();

        // Defensive: extract the first JSON object if the model added any prose
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            rawText = rawText.slice(firstBrace, lastBrace + 1);
        }

        let parsedJson;
        try {
            parsedJson = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('[refine-food] JSON.parse failed. Raw text was:', rawText);
            return res.status(500).json({
                success: false,
                error: 'AI refinement response was not valid JSON.',
                rawResponse: rawText
            });
        }

        const requiredKeys = ['food', 'estimatedQuantity', 'calories', 'protein', 'carbs', 'fat'];
        const missingKeys = requiredKeys.filter(k => !(k in parsedJson));
        if (missingKeys.length > 0) {
            console.warn('[refine-food] Parsed JSON missing keys:', missingKeys, parsedJson);
            missingKeys.forEach(k => {
                parsedJson[k] = typeof parsedJson[k] === 'number'
                    ? 0
                    : (k === 'food' || k === 'estimatedQuantity') ? 'Unknown' : 0;
            });
        }

        return res.status(200).json({ success: true, data: parsedJson });
    } catch (error) {
        console.error('[refine-food] Unhandled error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during food refinement.',
            details: error.message
        });
    }
}

