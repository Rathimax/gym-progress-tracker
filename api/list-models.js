import { checkRateLimit } from './rateLimit.js';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Rate limit: 10 requests per 5 minutes (admin utility, should be infrequent)
    const rateLimitResult = await checkRateLimit(req, 'list-models');
    if (!rateLimitResult.allowed) {
        res.setHeader('Retry-After', rateLimitResult.retryAfter ?? 60);
        return res.status(429).json({ error: rateLimitResult.message || 'Too Many Requests' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[list-models] Gemini API returned non-OK status ${response.status}:`, errorText);
            return res.status(response.status).json({
                error: `Gemini API error (${response.status})`,
                details: errorText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('[list-models] Unhandled error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
