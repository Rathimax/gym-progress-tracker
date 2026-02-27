export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        // 1. Validate API Key
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        console.log("ENV KEY EXISTS:", !!GEMINI_API_KEY);
        if (!GEMINI_API_KEY) {
            console.error('[analyze-food] GEMINI_API_KEY is not set in environment variables.');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: API key not set. Add GEMINI_API_KEY in Vercel project settings.'
            });
        }

        // 2. Validate request body
        const { imageBase64, mimeType, uid } = req.body || {};
        console.log(`[analyze-food] Request received. UID: ${uid}, mimeType: ${mimeType}, imageBase64 present: ${!!imageBase64}`);

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Missing imageBase64 in request body.' });
        }
        if (!mimeType) {
            return res.status(400).json({ success: false, error: 'Missing mimeType in request body.' });
        }

        // 3. Build Gemini request
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const promptText = `Analyze this food image and provide nutritional estimates.
Return a STRICTLY formatted JSON object with NO markdown wrappers, NO backticks, and NO extra text outside the JSON.
The JSON must have exactly these keys:
{
  "food": "Name of the food detected",
  "estimatedQuantity": "e.g., 1 bowl, 200g, 1 slice",
  "calories": (number - estimated total calories as integer),
  "protein": (number - grams as decimal),
  "carbs": (number - grams as decimal),
  "fat": (number - grams as decimal)
}
If there are multiple foods, combine their totals. If it's not food, set numeric values to 0 but describe what you see in the 'food' field. Output ONLY the JSON object.`;

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
                temperature: 0.1
            }
        };

        // 4. Call Gemini Vision API
        console.log('[analyze-food] Calling Gemini Vision API...');
        const aiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
        });

        if (!aiRes.ok) {
            const errorText = await aiRes.text();
            console.error(`[analyze-food] Gemini API returned non-OK status ${aiRes.status}:`, errorText);
            return res.status(aiRes.status).json({
                success: false,
                error: `Gemini API error (${aiRes.status})`,
                details: errorText
            });
        }

        const aiData = await aiRes.json();

        // 5. Extract raw text from Gemini response
        let rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('[analyze-food] RAW AI RESPONSE:', rawText);

        if (!rawText) {
            return res.status(500).json({
                success: false,
                error: 'Gemini returned an empty response. The image may be unclear or unsupported.'
            });
        }

        // 6. Clean up any markdown wrappers Gemini may have added
        rawText = rawText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        // 7. Parse JSON
        let parsedJson;
        try {
            parsedJson = JSON.parse(rawText);
        } catch (parseErr) {
            console.error('[analyze-food] JSON.parse failed. Raw text was:', rawText);
            return res.status(500).json({
                success: false,
                error: 'AI response was not valid JSON. Try a clearer food image.',
                rawResponse: rawText
            });
        }

        // 8. Validate required keys
        const requiredKeys = ['food', 'estimatedQuantity', 'calories', 'protein', 'carbs', 'fat'];
        const missingKeys = requiredKeys.filter(k => !(k in parsedJson));
        if (missingKeys.length > 0) {
            console.warn('[analyze-food] Parsed JSON missing keys:', missingKeys, parsedJson);
            // Fill missing numeric keys with 0, string keys with 'Unknown'
            missingKeys.forEach(k => {
                parsedJson[k] = typeof parsedJson[k] === 'number' ? 0 : (k === 'food' || k === 'estimatedQuantity') ? 'Unknown' : 0;
            });
        }

        console.log('[analyze-food] Successfully parsed:', parsedJson);
        return res.status(200).json({ success: true, data: parsedJson });

    } catch (error) {
        console.error('[analyze-food] Unhandled error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during food analysis.',
            details: error.message
        });
    }
}
