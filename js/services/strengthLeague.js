import { strengthStandards } from '../data/strengthStandards.js';

// Map UI exercise names to the config keys
function mapExerciseToConfigKey(exerciseName) {
  const name = exerciseName.toLowerCase();
  if (name.includes('squat') && !name.includes('split') && !name.includes('sissy') && !name.includes('pistol')) return 'squat';
  if (name.includes('bench press')) return 'benchPress';
  if (name.includes('deadlift') && !name.includes('romanian')) return 'deadlift';
  if (name.includes('overhead press')) return 'overheadPress';
  if (name.includes('lat pulldown')) return 'latPulldown';
  if (name.includes('row') && (name.includes('barbell') || name.includes('pendlay'))) return 'barbellRow';
  if (name.includes('tricep pushdown')) return 'tricepPushdown';
  if (name.includes('bicep curl')) return 'bicepCurl';
  if (name.includes('leg press')) return 'legPress';
  return null;
}

export function getLiftTier(exerciseName, liftWeightKg, bodyweightKg, standard) {
  const configKey = mapExerciseToConfigKey(exerciseName);
  
  if (!configKey || !bodyweightKg) {
      // Edge Case: Missing bodyweight or unmapped exercise.
      // If no bodyweight, return null
      if (!bodyweightKg) return null;
      
      // If unmapped exercise, fallback to benchPress * 0.4
      const fallbackConfig = { ...strengthStandards.benchPress[standard] };
      for (const k in fallbackConfig) {
          if (typeof fallbackConfig[k] === 'number') {
              fallbackConfig[k] = fallbackConfig[k] * 0.4;
          }
      }
      fallbackConfig.isFallback = true;
      return calculateTier(liftWeightKg, bodyweightKg, fallbackConfig);
  }

  const config = strengthStandards[configKey]?.[standard];
  if (!config) return null;

  return calculateTier(liftWeightKg, bodyweightKg, config);
}

function calculateTier(liftWeightKg, bodyweightKg, config) {
  const tierOrder = ["wood", "iron", "gold", "diamond", "netherite", "olympian", "inhuman"];
  const thresholds = {};
  
  ["wood", "iron", "gold", "diamond", "netherite"].forEach(t => {
    thresholds[t] = config[t] * bodyweightKg;
  });

  if (config.worldRecordKg) {
    thresholds.inhuman  = config.worldRecordKg;
    thresholds.olympian = config.worldRecordKg * 0.875;
  } else {
    thresholds.olympian = thresholds.netherite * 1.3;
    thresholds.inhuman  = thresholds.olympian * 1.2;
  }

  let currentTier = "unranked";
  for (const t of tierOrder) {
    if (liftWeightKg >= thresholds[t]) currentTier = t;
  }

  const idx = tierOrder.indexOf(currentTier);
  const nextTier = idx >= 0 && idx < tierOrder.length - 1 ? tierOrder[idx + 1] : null;
  const progressPct = nextTier
    ? Math.min(100, ((liftWeightKg - (thresholds[currentTier] || 0)) /
        (thresholds[nextTier] - (thresholds[currentTier] || 0))) * 100)
    : 100;

  return { currentTier, nextTier, progressPct, thresholds, isFallback: config.isFallback };
}
