import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export const MEDALS = [
    // --- FIRST STEPS ---
    { id: 'first_workout', name: 'First Log', desc: 'Logged your first workout', icon: 'ri-edit-circle-line', tier: 'easy' },
    { id: 'consistency_3', name: '3-Day Streak', desc: 'Logged workouts 3 days in a row', icon: 'ri-fire-fill', tier: 'easy' },
    { id: 'consistency_7', name: 'Consistency Champ', desc: 'Workout every day for 7 days', icon: 'ri-calendar-check-fill', tier: 'medium' },

    // --- TIME BASED ---
    { id: 'early_bird', name: 'Early Bird', desc: 'Workout before 7 AM', icon: 'ri-sun-foggy-fill', tier: 'easy' },
    { id: 'night_owl', name: 'Night Owl', desc: 'Workout after 9 PM', icon: 'ri-moon-clear-fill', tier: 'easy' },
    { id: 'midnight_grind', name: 'Midnight Grind', desc: 'Workout between 12 AM - 4 AM', icon: 'ri-moon-foggy-line', tier: 'medium' },

    // --- HABITS ---
    { id: 'routine_builder', name: 'Routine Builder', desc: 'Logged a workout 2 weeks in a row', icon: 'ri-building-4-line', tier: 'medium' },
    { id: 'never_miss_monday', name: 'Never Miss Monday', desc: 'Workout every Monday for 4 weeks', icon: 'ri-calendar-event-fill', tier: 'hard' },
    { id: 'comeback_kid', name: 'Comeback Kid', desc: 'Returned after a 7+ day break', icon: 'ri-repeat-line', tier: 'medium' },
    { id: 'month_strong', name: 'Month Strong', desc: '20+ workouts in a single month', icon: 'ri-calendar-fill', tier: 'hard' },

    // --- PERFORMANCE ---
    { id: 'personal_best', name: 'Personal Best', desc: 'Break a PR in any exercise', icon: 'ri-trophy-fill', tier: 'medium' },
    { id: 'heavy_day', name: 'Heavy Day', desc: 'Lifted over 100kg', icon: 'ri-dumbbell-fill', tier: 'hard' },
    { id: 'volume_monster', name: 'Volume Monster', desc: 'Over 10,000kg volume in one workout', icon: 'ri-bar-chart-grouped-fill', tier: 'hard' },
    { id: 'endurance_king', name: 'Endurance King', desc: 'Workout session longer than 90 mins', icon: 'ri-timer-flash-fill', tier: 'hard' },

    // --- MILESTONES ---
    { id: 'club_50', name: '50 Workouts Club', desc: 'Logged 50 total workouts', icon: 'ri-medal-fill', tier: 'medium' },
    { id: 'club_100', name: '100 Workouts Club', desc: 'Logged 100 total workouts', icon: 'ri-medal-2-fill', tier: 'hard' },
    { id: 'streak_30', name: 'One-Month Streak', desc: '30 consecutive workout days', icon: 'ri-fire-line', tier: 'hard' },
    { id: 'half_year', name: 'Half-Year Hustler', desc: 'consistent training for 6 months', icon: 'ri-brain-line', tier: 'hard' },

    // --- FUN & GAMIFIED ---
    { id: 'explorer', name: 'Explorer', desc: 'Logged 5 different exercise types', icon: 'ri-compass-3-fill', tier: 'easy' },
    { id: 'leg_day_survivor', name: 'Leg Day Survivor', desc: 'Completed 5 Leg workouts', icon: 'ri-walk-fill', tier: 'medium' },
    { id: 'no_excuses', name: 'No Excuses', desc: 'Workout on a weekend', icon: 'ri-snowy-fill', tier: 'easy' },
    { id: 'double_trouble', name: 'Double Trouble', desc: 'Two sessions in one day', icon: 'ri-sword-fill', tier: 'medium' },
    { id: 'consistency_motivation', name: 'Discipline', desc: ' returned after a short break', icon: 'ri-mental-health-line', tier: 'medium' },

    // Existing Legacy
    { id: 'routine_complete', name: 'Routine Master', desc: 'Completed a full routine', icon: 'ri-trophy-line', tier: 'medium' },
    { id: 'volume_10k', name: 'Volume Hunter', desc: 'Accumulated 10k volume', icon: 'ri-bar-chart-box-line', tier: 'hard' }
];

const MUSCLE_GROUPS = {
    'Chest': ['Push Up', 'Chest Press', 'Incline Dumbbell Press', 'Chest Fly', 'Bench Press'],
    'Shoulder': ['Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press'],
    'Back': ['Pull Up', 'Barbell Row', 'Seated Row', 'Lat Pulldown', 'Face Pull'],
    'Legs': ['Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Calf Raise', 'Deadlift'],
    'Arms': ['Bicep Curl', 'Hammer Curl', 'Concentration Curl', 'Preacher Curl', 'Reverse Curl', 'Tricep Pushdown', 'Skull Crushers', 'Overhead Tricep Extension', 'Dumbbell Tricep Kickback', 'Close Grip Bench Press'],
    'Core': ['Plank', 'Burpees', 'Mountain Climbers']
};

export const initGamification = (db, auth) => {
    // State
    let unlockedMedals = [];

    const loadGamificationFromServer = async (uid) => {
        if (!uid) return;
        try {
            // First migrate local -> server if needed
            const stored = localStorage.getItem('gymMedals');
            if (stored) {
                const parsed = JSON.parse(stored);
                unlockedMedals = parsed; // Optimistically set local
                if (parsed.length > 0) {
                    await setDoc(doc(db, 'userGamification', uid), { unlockedMedals: parsed }, { merge: true });
                }
            }

            const docSnap = await getDoc(doc(db, 'userGamification', uid));
            if (docSnap.exists() && docSnap.data().unlockedMedals) {
                unlockedMedals = docSnap.data().unlockedMedals;
                localStorage.setItem('gymMedals', JSON.stringify(unlockedMedals)); // Keep backup
            }
        } catch (e) {
            console.error("Failed to load medals from server, falling back to local:", e);
            const stored = localStorage.getItem('gymMedals');
            if (stored) unlockedMedals = JSON.parse(stored);
        }
    };

    // Elements
    const modal = document.getElementById('modal-medal');
    const title = document.getElementById('medal-title');
    const desc = document.getElementById('medal-desc');
    const icon = document.getElementById('medal-icon');

    const saveToServer = async () => {
        if (auth.currentUser) {
            try {
                await setDoc(doc(db, 'userGamification', auth.currentUser.uid), { unlockedMedals }, { merge: true });
                localStorage.setItem('gymMedals', JSON.stringify(unlockedMedals));
            } catch (e) {
                console.error("Failed to save medals:", e);
                localStorage.setItem('gymMedals', JSON.stringify(unlockedMedals));
            }
        } else {
            localStorage.setItem('gymMedals', JSON.stringify(unlockedMedals));
        }
    };

    const showUnlock = (medal) => {
        if (!modal) return;
        title.textContent = "New Medal Unlocked!";
        desc.innerHTML = `You earned <strong>${medal.name}</strong><br>${medal.desc}`;
        icon.innerHTML = `<i class="${medal.icon}"></i>`;

        modal.classList.remove('hidden');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }
    };

    const showDetails = (medal, isUnlocked) => {
        if (!modal) return;
        title.textContent = isUnlocked ? "Medal Details" : "Locked Medal";
        desc.innerHTML = `<strong>${medal.name}</strong><br>${medal.desc}<br><br>${isUnlocked ? '<i class="ri-checkbox-circle-fill"></i> Achieved' : '<i class="ri-lock-fill"></i> Keep going!'}`;
        icon.innerHTML = `<i class="${medal.icon}"></i>`;
        
        const btn = document.getElementById('medal-btn');
        if (btn) btn.innerText = isUnlocked ? 'Awesome!' : 'Understood';

        modal.classList.remove('hidden');
    };

    const unlock = (id) => {
        if (unlockedMedals.includes(id)) return false;
        const medal = MEDALS.find(m => m.id === id);
        if (!medal) return false;

        unlockedMedals.push(id);
        saveToServer();
        showUnlock(medal);
        return true;
    };

    const getDates = (data) => {
        const dates = [...new Set(data.map(d => d.date))].sort();
        return dates.map(d => new Date(d));
    };

    const countConsecutiveDays = (dates) => {
        if (dates.length === 0) return 0;
        let streak = 1;
        let maxStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const diffTime = Math.abs(dates[i] - dates[i - 1]);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streak++;
            } else {
                streak = 1;
            }
            if (streak > maxStreak) maxStreak = streak;
        }
        return maxStreak;
    };

    return {
        loadGamificationFromServer,
        unlock,
        getUnlocked: () => unlockedMedals,
        getProgress: () => {
            return {
                current: unlockedMedals.length,
                total: MEDALS.length
            };
        },
        renderRewards: (container) => {
            if (!container) return;
            container.innerHTML = ''; // Clear container

            const tiers = [
                { id: 'easy', title: 'Bronze (Easy)' },
                { id: 'medium', title: 'Silver (Medium)' },
                { id: 'hard', title: 'Gold (Hard)' }
            ];

            tiers.forEach(tier => {
                // Filter medals for this tier
                const tierMedals = MEDALS.filter(m => m.tier === tier.id);
                if (tierMedals.length === 0) return;

                // Sort: Unlocked first, then by ID
                const sortedMedals = tierMedals.sort((a, b) => {
                    const aUn = unlockedMedals.includes(a.id);
                    const bUn = unlockedMedals.includes(b.id);
                    if (aUn && !bUn) return -1;
                    if (!aUn && bUn) return 1;
                    return 0;
                });

                // Create tier section
                const section = document.createElement('div');
                section.className = 'tier-section';
                
                const header = document.createElement('h3');
                header.className = `tier-title tier-${tier.id}`;
                header.innerText = tier.title;
                section.appendChild(header);

                const grid = document.createElement('div');
                grid.className = 'medal-grid';

                sortedMedals.forEach(medal => {
                    const isUnlocked = unlockedMedals.includes(medal.id);
                    const card = document.createElement('div');
                    card.className = `medal-card ${isUnlocked ? '' : 'locked'}`;
                    card.innerHTML = `
                        <div class="icon"><i class="${medal.icon}"></i></div>
                        <div class="name">${medal.name}</div>
                        <div class="status">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
                    `;
                    card.title = medal.desc;
                    card.addEventListener('click', () => showDetails(medal, isUnlocked));
                    grid.appendChild(card);
                });

                section.appendChild(grid);
                container.appendChild(section);
            });
        },
        checkMilestones: (history, currentWorkout) => {
            if (!currentWorkout || !history) return;

            // 1. First Log
            if (history.length === 1) unlock('first_workout');

            // 2. Streaks
            const dates = getDates(history);
            const streak = countConsecutiveDays(dates);
            if (streak >= 3) unlock('consistency_3');
            if (streak >= 7) unlock('consistency_7');
            if (streak >= 30) unlock('streak_30');

            // 3. Time Based (Requires timestamp)
            if (currentWorkout.timestamp) {
                const date = new Date(currentWorkout.timestamp);
                const hour = date.getHours();
                if (hour < 7) unlock('early_bird');
                if (hour >= 21) unlock('night_owl');
                if (hour >= 0 && hour < 4) unlock('midnight_grind');
            }

            // 4. Counts
            if (history.length >= 50) unlock('club_50');
            if (history.length >= 100) unlock('club_100');

            // 5. Volume & Heavy
            if (currentWorkout.weight >= 100) unlock('heavy_day');

            // Calculate session volume
            const todayStr = currentWorkout.date;
            const sessionWorkouts = history.filter(h => h.date === todayStr);
            const sessionVolume = sessionWorkouts.reduce((s, w) => s + (w.weight * w.reps * w.sets), 0);
            if (sessionVolume > 10000) unlock('volume_monster');

            // 6. Endurance (Approximate based on manual inputs)
            const totalDuration = sessionWorkouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);
            if (totalDuration > 90) unlock('endurance_king');

            // 7. Variety
            const uniqueExercises = new Set(history.map(h => h.exercise));
            if (uniqueExercises.size >= 5) unlock('explorer');

            // 8. Leg Day
            const legExercises = MUSCLE_GROUPS['Legs'];
            const legCount = history.filter(h => legExercises.includes(h.exercise)).length;
            if (legCount >= 5) unlock('leg_day_survivor');

            // 9. Weekends
            const day = new Date(currentWorkout.date).getDay();
            if (day === 0 || day === 6) unlock('no_excuses');

            // 10. Double Trouble
            if (sessionWorkouts.length > 1) {
                if (sessionWorkouts.length >= 10) unlock('double_trouble');
            }

            // 11. Month Strong
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthCount = history.filter(h => h.date.startsWith(currentMonth)).length;
            if (monthCount >= 20) unlock('month_strong');

            // 12. Personal Best (Requires PR tracking, simplified here)
            const prHistory = history.filter(h => h.exercise === currentWorkout.exercise);
            const maxWeight = Math.max(...prHistory.map(h => h.weight));
            if (currentWorkout.weight > maxWeight) unlock('personal_best');

            // 13. Routine Complete (Requires routine tracking, simplified here)
                if (currentWorkout.routineComplete) unlock('routine_complete');

            // 14. Volume Hunter (Requires total volume tracking, simplified here)
                const totalVolume = history.reduce((s, w) => s + (w.weight * w.reps * w.sets), 0);
                if (totalVolume >= 10000) unlock('volume_10k');

        }
    };
};
