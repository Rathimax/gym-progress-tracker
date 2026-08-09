import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// All route handlers now live in their canonical api/ files.
// server.js simply mounts them — no logic is duplicated here.
import chatHandler           from './api/chat.js';
import dietCoachHandler      from './api/diet-coach.js';
import analyzeFoodHandler    from './api/analyze-food.js';
import refineFoodHandler     from './api/refine-food.js';
import generateDietPlanHandler from './api/generate-diet-plan.js';
import listModelsHandler     from './api/list-models.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ==========================================
// AI ROUTES — delegated to api/ handlers
// Rate limiting, validation, and error handling
// are all handled inside each handler file.
// ==========================================
app.post('/api/chat',               chatHandler);
app.post('/api/diet-coach',         dietCoachHandler);
app.post('/api/analyze-food',       analyzeFoodHandler);
app.post('/api/refine-food',        refineFoodHandler);
app.post('/api/generate-diet-plan', generateDietPlanHandler);
app.get( '/api/list-models',        listModelsHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
