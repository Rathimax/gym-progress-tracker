import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Per-endpoint rate limit configuration
// Each endpoint gets its own named bucket so hitting one limit
// does NOT block the user from other endpoints.
// ---------------------------------------------------------------------------
const ENDPOINT_CONFIGS = {
    'analyze-food':       { requests: 3,  window: '1 m'  },  // Heavy: vision model + large base64
    'refine-food':        { requests: 5,  window: '1 m'  },  // Moderate: text-only AI inference
    'generate-diet-plan': { requests: 3,  window: '1 m'  },  // Heavy: complex prompt, infrequent
    'chat':               { requests: 5,  window: '1 m'  },  // Light: Exercise AI (5 req/min)
    'diet-coach':         { requests: 8,  window: '1 m'  },  // Light: multi-turn chat
    'list-models':        { requests: 10, window: '5 m'  },  // Admin utility, should be rare
    'default':            { requests: 5,  window: '1 m'  },  // Safety fallback
};

// Map of endpointKey -> Ratelimit instance (lazy-initialized, reused across warm invocations)
const rateLimiters = new Map();

/**
 * Check rate limit for a specific endpoint.
 *
 * @param {object} req          - The incoming request object
 * @param {string} endpointKey  - Named key from ENDPOINT_CONFIGS (e.g. 'chat', 'analyze-food')
 * @returns {{ allowed: boolean, message?: string, retryAfter?: number }}
 */
export async function checkRateLimit(req, endpointKey = 'default') {
    const KV_REST_API_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
    const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    // No credentials → local dev, bypass with a warning
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
        console.warn('[rateLimit] Upstash Redis credentials are not set. Rate limiting is bypassed (local dev).');
        return { allowed: true };
    }

    // Lazy-init the limiter for this endpoint key
    if (!rateLimiters.has(endpointKey)) {
        const config = ENDPOINT_CONFIGS[endpointKey] || ENDPOINT_CONFIGS['default'];
        rateLimiters.set(endpointKey, new Ratelimit({
            redis: new Redis({
                url:   KV_REST_API_URL,
                token: KV_REST_API_TOKEN,
            }),
            limiter:   Ratelimit.slidingWindow(config.requests, config.window),
            analytics: true,
            prefix:    `rl:${endpointKey}`, // Namespaced Redis keys per endpoint
        }));
    }

    // ---------------------------------------------------------------------------
    // Sanitize x-forwarded-for: it can be a comma-separated proxy chain.
    // Only trust the first IP. Trim whitespace to avoid key collisions.
    // ---------------------------------------------------------------------------
    const rawForwarded = req.headers['x-forwarded-for'];
    const ip = (rawForwarded ? rawForwarded.split(',')[0].trim() : null)
                || req.socket?.remoteAddress
                || req.connection?.remoteAddress
                || '127.0.0.1';

    // Namespace the identifier with the endpoint so Redis keys don't collide
    const identifier = `${endpointKey}:${ip}`;

    try {
        const config = ENDPOINT_CONFIGS[endpointKey] || ENDPOINT_CONFIGS['default'];
        const maxLimit = config.requests;
        const { success, reset, limit: upstashLimit, remaining } = await rateLimiters.get(endpointKey).limit(identifier);

        const limitVal = upstashLimit || maxLimit;
        const remainingVal = typeof remaining === 'number' ? Math.max(0, remaining) : limitVal;

        if (!success) {
            // Compute seconds until the window resets (reset is a Unix ms timestamp)
            const retryAfter = reset ? Math.ceil((reset - Date.now()) / 1000) : 60;
            return {
                allowed:    false,
                retryAfter,
                limit:      limitVal,
                remaining:  0,
                message:    'You have reached the rate limit, try again after 10 minutes',
            };
        }

        return {
            allowed:   true,
            limit:     limitVal,
            remaining: remainingVal
        };

    } catch (error) {
        // Fail-open: a Redis outage should not block all users, but we log it prominently.
        console.error(`[rateLimit] Redis error for endpoint "${endpointKey}" — rate limiting is DISABLED for this request. Error:`, error?.message || error);
        return { allowed: true, limit: 5, remaining: 5 };
    }
}
