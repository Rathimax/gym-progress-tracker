import { checkRateLimit } from './rateLimit.js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const rateLimitResult = await checkRateLimit(req, 'analyze-food');
        if (!rateLimitResult.allowed) {
            res.setHeader('Retry-After', rateLimitResult.retryAfter ?? 60);
            return res.status(429).json({ success: false, error: rateLimitResult.message || 'Too Many Requests' });
        }

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
        const { imageBase64, mimeType, uid, userNotes, quantityHint, details } = req.body || {};
        console.log(`[analyze-food] Request received. UID: ${uid}, mimeType: ${mimeType}, imageBase64 present: ${!!imageBase64}, quantityHint: ${quantityHint || 'none'}, userNotes: ${userNotes || details || 'none'}`);

        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Missing imageBase64 in request body.' });
        }
        if (!mimeType) {
            return res.status(400).json({ success: false, error: 'Missing mimeType in request body.' });
        }
        // Guard against oversized payloads before calling Gemini (~3.7MB raw image after base64 encoding)
        if (imageBase64.length > 5_000_000) {
            return res.status(413).json({ success: false, error: 'Image is too large. Please use an image under ~3.7MB.' });
        }

        // 3. Build Gemini request
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        // Build additional context from user notes if provided
        const contextLines = [];
        if (quantityHint && quantityHint.trim()) {
            contextLines.push(`- User-specified portion/quantity: "${quantityHint.trim()}"`);
        }
        const extraNotes = (userNotes || details || '').trim();
        if (extraNotes) {
            contextLines.push(`- User meal/cooking details & ingredients: "${extraNotes}"`);
        }

        let contextPrompt = '';
        if (contextLines.length > 0) {
            contextPrompt = `\n\nUSER-PROVIDED MEAL DETAILS:\n${contextLines.join('\n')}\n\nIMPORTANT: Use the user-provided portion size, ingredients, and preparation details above to calibrate your estimation with high accuracy. If the user specified an exact quantity (e.g. "200g", "2 pieces", "1 bowl") or cooking method (e.g. "olive oil", "no sugar"), calculate the calories and macronutrients strictly tailored to that specific portion and recipe. Set "estimatedQuantity" to match or refine the user's quantity.\n`;
        }

        const promptText = `Analyze this food image and provide nutritional estimates.${contextPrompt}
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

        // 3. Candidate models with automatic fallback on 503 high-demand or transient errors
        const candidateModels = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];

        let rawText = '';
        let lastStatus = 0;
        let lastErrorText = '';

        for (const model of candidateModels) {
            console.log(`[analyze-food] Calling Gemini Vision API with model: ${model}...`);
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

            try {
                const aiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiBody)
                });

                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (rawText) {
                        console.log(`[analyze-food] Successfully received response from ${model}`);
                        break;
                    }
                } else {
                    lastStatus = aiRes.status;
                    lastErrorText = await aiRes.text();
                    console.warn(`[analyze-food] Model ${model} returned non-OK status ${lastStatus}:`, lastErrorText);

                    // If transient/demand error, try the next model
                    if (lastStatus === 503 || lastStatus === 429 || lastStatus === 500 || lastStatus === 502) {
                        continue;
                    } else {
                        break;
                    }
                }
            } catch (networkErr) {
                console.warn(`[analyze-food] Network error with ${model}:`, networkErr.message);
            }
        }

        if (!rawText) {
            const isDemandSpike = lastStatus === 503 || lastErrorText.includes('high demand') || lastErrorText.includes('UNAVAILABLE');
            const message = isDemandSpike
                ? 'Gemini AI is currently experiencing high demand. Please try again in a few moments.'
                : 'AI Engine failed to parse image. Please try again.';

            return res.status(502).json({
                success: false,
                error: message,
                details: lastErrorText
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
