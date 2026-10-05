/**
 * API Route: /api/search-food
 * Searches Open Food Facts (over 4.5 million global & Indian products)
 * and USDA FoodData Central for whole foods and staples.
 * Returns normalized items compatible with FitTrack's foodDatabase schema.
 */

// Simple in-memory cache with 15-minute TTL to reduce outbound calls
const searchCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_SIZE = 250;

function getCached(key) {
    const item = searchCache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_TTL_MS) {
        searchCache.delete(key);
        return null;
    }
    return item.data;
}

function setCached(key, data) {
    if (searchCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = searchCache.keys().next().value;
        searchCache.delete(oldestKey);
    }
    searchCache.set(key, { data, timestamp: Date.now() });
}

function capitalizeWords(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default async function handler(req, res) {
    // Support both GET and POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const query = (req.method === 'GET' ? req.query?.q : req.body?.q) || '';
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery || cleanQuery.length < 2) {
        return res.json({ success: true, count: 0, foods: [] });
    }

    const cacheKey = cleanQuery;
    const cached = getCached(cacheKey);
    if (cached) {
        return res.json({ success: true, count: cached.length, foods: cached, cached: true });
    }

    const foods = [];
    const seenNames = new Set();

    // 1. Search Open Food Facts (Search-a-licious Elasticsearch API)
    try {
        const offUrl = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(cleanQuery)}&page_size=15`;
        const offRes = await fetch(offUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'FitTrack - GymTrackerApp - Web 1.0 (contact@fittrack.local)'
            },
            signal: AbortSignal.timeout(3500)
        });

        if (offRes.ok) {
            const data = await offRes.json();
            if (data.hits && Array.isArray(data.hits)) {
                for (const hit of data.hits) {
                    const rawName = hit.product_name || hit.product_name_en;
                    if (!rawName || rawName.trim().length < 2) continue;

                    const name = capitalizeWords(rawName.trim());
                    const nameKey = name.toLowerCase();
                    if (seenNames.has(nameKey)) continue;

                    const nut = hit.nutriments || {};
                    let kcal = nut['energy-kcal_100g'] ?? nut['energy-kcal'];
                    if ((kcal === undefined || isNaN(kcal)) && nut['energy-kj_100g']) {
                        kcal = Math.round(nut['energy-kj_100g'] / 4.184);
                    }
                    if (kcal === undefined || isNaN(kcal)) continue;

                    const protein = Math.round((nut['proteins_100g'] ?? 0) * 10) / 10;
                    const carbs = Math.round((nut['carbohydrates_100g'] ?? 0) * 10) / 10;
                    const fat = Math.round((nut['fat_100g'] ?? 0) * 10) / 10;

                    // Extract serving size in grams if specified
                    let servingGrams = 100;
                    if (hit.quantity) {
                        const m = hit.quantity.match(/(\d+(?:\.\d+)?)\s*g/i);
                        if (m) servingGrams = Math.min(Math.max(parseFloat(m[1]), 10), 500);
                    }
                    if (servingGrams === 100 && hit.serving_size) {
                        const m = hit.serving_size.match(/(\d+(?:\.\d+)?)\s*g/i);
                        if (m) servingGrams = Math.min(Math.max(parseFloat(m[1]), 10), 500);
                    }
                    servingGrams = Math.round(servingGrams);

                    const brand = Array.isArray(hit.brands) ? hit.brands.join(', ') : (hit.brands || '');
                    const brandClean = brand ? capitalizeWords(brand) : '';
                    const desc = brandClean
                        ? `${brandClean} • 1 serving (${servingGrams}g)`
                        : `Global Database • 1 serving (${servingGrams}g)`;

                    seenNames.add(nameKey);
                    foods.push({
                        id: 'off_' + (hit.code || Math.random().toString(36).slice(2)),
                        name,
                        brand: brandClean,
                        category: 'global',
                        state: 'Packaged',
                        source: 'Open Food Facts',
                        searchTerms: `${cleanQuery} ${name.toLowerCase()} ${brandClean.toLowerCase()}`,
                        description: desc,
                        image: hit.image_front_thumb_url || hit.image_thumb_url || null,
                        base100g: {
                            calories: Math.round(kcal),
                            protein,
                            carbs,
                            fat
                        },
                        servingUnits: [
                            {
                                id: 'serving',
                                name: `1 serving (~${servingGrams}g)`,
                                grams: servingGrams,
                                step: 1,
                                min: 0.5,
                                defaultQty: 1,
                                isDefault: true
                            },
                            {
                                id: 'g',
                                name: 'Grams (g)',
                                grams: 1,
                                step: 10,
                                min: 5,
                                defaultQty: servingGrams,
                                isDefault: false
                            }
                        ]
                    });

                    if (foods.length >= 12) break;
                }
            }
        }
    } catch (err) {
        console.warn('[search-food] Open Food Facts lookup warning:', err.message);
    }

    // 2. If results < 6, supplement with USDA FoodData Central (great for whole foods, produce, meats)
    if (foods.length < 6) {
        try {
            const usdaKey = process.env.USDA_API_KEY || 'DEMO_KEY';
            const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(cleanQuery)}&pageSize=8&api_key=${usdaKey}`;
            const usdaRes = await fetch(usdaUrl, { signal: AbortSignal.timeout(3500) });
            if (usdaRes.ok) {
                const data = await usdaRes.json();
                if (data.foods && Array.isArray(data.foods)) {
                    for (const f of data.foods) {
                        const rawName = f.description;
                        if (!rawName) continue;
                        const name = capitalizeWords(rawName);
                        const nameKey = name.toLowerCase();
                        if (seenNames.has(nameKey)) continue;

                        const getNut = (id) => f.foodNutrients?.find(n => n.nutrientId === id || n.nutrientNumber === id)?.value;
                        const kcal = getNut(1008) ?? getNut('208');
                        if (kcal === undefined || isNaN(kcal)) continue;

                        const protein = Math.round((getNut(1003) ?? getNut('203') ?? 0) * 10) / 10;
                        const carbs = Math.round((getNut(1005) ?? getNut('205') ?? 0) * 10) / 10;
                        const fat = Math.round((getNut(1004) ?? getNut('204') ?? 0) * 10) / 10;

                        const sSize = f.servingSize || 100;
                        const sUnit = (f.servingSizeUnit || 'g').toLowerCase();
                        const sGrams = Math.round(sUnit === 'g' ? sSize : 100);

                        const brand = f.brandName || f.brandOwner || '';
                        const brandClean = brand ? capitalizeWords(brand) : '';
                        const desc = brandClean
                            ? `${brandClean} • USDA FoodData`
                            : `Whole Food • USDA FoodData (~${sGrams}g)`;

                        seenNames.add(nameKey);
                        foods.push({
                            id: 'usda_' + f.fdcId,
                            name,
                            brand: brandClean,
                            category: 'global',
                            state: f.dataType === 'Branded' ? 'Packaged' : 'Whole Food',
                            source: 'USDA',
                            searchTerms: `${cleanQuery} ${name.toLowerCase()}`,
                            description: desc,
                            base100g: {
                                calories: Math.round(kcal),
                                protein,
                                carbs,
                                fat
                            },
                            servingUnits: [
                                {
                                    id: 'serving',
                                    name: f.householdServingFullText ? `1 serving (${f.householdServingFullText})` : `1 serving (~${sGrams}g)`,
                                    grams: sGrams,
                                    step: 1,
                                    min: 0.5,
                                    defaultQty: 1,
                                    isDefault: true
                                },
                                {
                                    id: 'g',
                                    name: 'Grams (g)',
                                    grams: 1,
                                    step: 10,
                                    min: 5,
                                    defaultQty: sGrams,
                                    isDefault: false
                                }
                            ]
                        });

                        if (foods.length >= 14) break;
                    }
                }
            }
        } catch (err) {
            console.warn('[search-food] USDA lookup warning:', err.message);
        }
    }

    setCached(cacheKey, foods);
    return res.json({ success: true, count: foods.length, foods });
}
