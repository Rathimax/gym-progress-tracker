// ==========================================
// 1. IMPORTS & FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { initRoutines } from "./routines.js";
import { initGamification } from "./gamification.js";

const firebaseConfig = {
    apiKey: "AIzaSyD0hdb9-NZ3Et3owriYW5d6iEl6JIdqvV4",
    authDomain: "fittrack-app-f45d8.firebaseapp.com",
    projectId: "fittrack-app-f45d8",
    storageBucket: "fittrack-app-f45d8.firebasestorage.app",
    messagingSenderId: "152146874329",
    appId: "1:152146874329:web:1a036664f4f63d064a93c8",
    measurementId: "G-2NT6KDBYBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 2. DOM ELEMENTS
    // ==========================================
    const elements = {
        navOverlay: document.getElementById('nav-overlay'),
        sidebar: document.getElementById('sidebar'),
        hamburgerBtn: document.getElementById('hamburger-btn'),
        closeNavBtn: document.getElementById('close-nav-btn'),
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view-section'),

        // Forms & Inputs
        form: document.getElementById('workout-form'),
        exerciseSelect: document.getElementById('exercise-select'),
        exerciseText: document.getElementById('exercise-text'),
        toggleInputBtn: document.getElementById('toggle-input-btn'),
        rmDisplay: document.getElementById('rm-display'),
        exercisePreview: document.getElementById('exercise-preview'),
        previewLabel: document.getElementById('preview-label'),

        // 1RM Calculator
        calcWeight: document.getElementById('calc-weight'),
        calcReps: document.getElementById('calc-reps'),
        btnCalculate: document.getElementById('btn-calculate-1rm'),
        calcResultsArea: document.getElementById('calc-results-area'),
        calcMaxDisplay: document.getElementById('calc-max-display'),
        percentageList: document.getElementById('percentage-list'),

        // Body Weight
        bwForm: document.getElementById('bw-form'),
        bwInput: document.getElementById('bw-input'),
        bwDate: document.getElementById('bw-date'),
        bwCurrent: document.getElementById('bw-current'),
        bwStart: document.getElementById('bw-start'),
        bwChange: document.getElementById('bw-change'),

        // History & Data
        historyControls: document.getElementById('history-controls'),
        historyList: document.getElementById('history-list'),
        prList: document.getElementById('pr-list'),
        dataStatus: document.getElementById('data-status'),
        exportBtn: document.getElementById('export-btn'),
        importBtn: document.getElementById('import-btn'),
        importInput: document.getElementById('import-input'),
        clearBtn: document.getElementById('clear-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        loader: document.getElementById('loader'),
        notification: document.getElementById('notification'),

        // Analytics
        ctx: document.getElementById('analyticsChart').getContext('2d'),
        chartTabs: document.querySelectorAll('.chart-tab'),
        analyticsExerciseSelect: document.getElementById('analytics-exercise-select'),
        totalWorkouts: document.getElementById('total-workouts'),
        totalVolume: document.getElementById('total-volume'),
        totalTime: document.getElementById('total-time'),
        avgSession: document.getElementById('avg-session'),
        caloriesBurned: document.getElementById('calories-burned'),

        // Timer
        timerWidget: document.getElementById('timer-widget'),
        timerDisplay: document.getElementById('timer-display'),
        timerToggleIcon: document.getElementById('timer-toggle-icon'),
        timerBtns: document.querySelectorAll('.timer-btn[data-time]'),
        timerCancel: document.getElementById('timer-cancel'),

        // Achievements
        achievementsGrid: document.getElementById('achievements-grid-container'),
        achievementsProgress: document.getElementById('achievements-progress'),
        achievementsProgressBar: document.getElementById('achievements-progress-bar')
    };

    // State
    let data = [];
    let bwData = [];
    let prMap = {};
    let prDates = {};
    let currentChartType = 'weight';
    let analyticsChart = null;
    let isCustomInput = false;
    let timerInterval = null;
    let audioContext = null;

    // Preferences State
    let userPreferences = {
        font: 'modern',
        compactMode: false,
        units: 'kg', // 'kg' or 'lbs'
        avatar: null, // DataURL or null
        avatarType: 'image' // 'image' or 'emoji'
    };

    // Helper: Convert Weight
    const formatWeight = (kg) => {
        if (!kg) return 0;
        if (userPreferences.units === 'lbs') {
            return (kg * 2.20462).toFixed(1);
        }
        return parseFloat(kg).toFixed(1); // Ensure consistent decimal
    };

    const getUnitLabel = () => userPreferences.units.toUpperCase();

    const EXERCISE_INTENSITY_FACTORS = { 'Push Up': 4.5, 'Chest Press': 4.0, 'Incline Dumbbell Press': 4.0, 'Chest Fly': 2.5, 'Shoulder Press': 4.0, 'Lateral Raise': 2.5, 'Front Raise': 2.5, 'Rear Delt Fly': 2.5, 'Arnold Press': 4.5, 'Pull Up': 6.0, 'Barbell Row': 5.0, 'Seated Row': 3.5, 'Lat Pulldown': 3.5, 'Face Pull': 2.5, 'Squat': 6.0, 'Leg Press': 5.5, 'Lunges': 4.5, 'Leg Curl': 3.0, 'Calf Raise': 2.5, 'Bicep Curl': 2.5, 'Hammer Curl': 2.5, 'Concentration Curl': 2.0, 'Preacher Curl': 2.0, 'Reverse Curl': 2.5, 'Tricep Pushdown': 2.5, 'Skull Crushers': 3.0, 'Overhead Tricep Extension': 3.0, 'Dumbbell Tricep Kickback': 2.5, 'Close Grip Bench Press': 4.5, 'Plank': 3.0, 'Burpees': 9.0, 'Mountain Climbers': 7.0, 'default': 3.5 };

    const MUSCLE_IMAGES = {
        'Chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
        'Back': 'https://images.unsplash.com/photo-1603287681836-e566914d0957?auto=format&fit=crop&w=800&q=80',
        'Legs': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
        'Shoulder': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
        'Bicep': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
        'Tricep': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=800&q=80',
        'Fullbody': 'https://images.unsplash.com/photo-1517963879466-e925ac69aa18?auto=format&fit=crop&w=800&q=80',
        'Other': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    };

    const EXERCISE_MUSCLE_MAP = {
        'Push Up': ['Chest', 'Tricep', 'Shoulder'],
        'Chest Press': ['Chest', 'Tricep', 'Shoulder'],
        'Incline Dumbbell Press': ['Chest', 'Shoulder', 'Tricep'],
        'Chest Fly': ['Chest'],
        'Shoulder Press': ['Shoulder', 'Tricep', 'Traps'],
        'Lateral Raise': ['Shoulder', 'Traps'],
        'Front Raise': ['Shoulder'],
        'Rear Delt Fly': ['Shoulder', 'Traps'],
        'Arnold Press': ['Shoulder', 'Tricep'],
        'Pull Up': ['Lats', 'Bicep', 'Forearms', 'Traps'],
        'Barbell Row': ['Lats', 'Back', 'Bicep'],
        'Seated Row': ['Back', 'Lats', 'Bicep'],
        'Lat Pulldown': ['Lats', 'Bicep'],
        'Face Pull': ['Shoulder', 'Traps'],
        'Squat': ['Quads', 'Glutes', 'LowerBack'],
        'Leg Press': ['Quads', 'Glutes'],
        'Lunges': ['Quads', 'Glutes', 'Hamstrings'],
        'Leg Curl': ['Hamstrings'],
        'Calf Raise': ['Calves'],
        'Bicep Curl': ['Bicep', 'Forearms'],
        'Hammer Curl': ['Bicep', 'Forearms'],
        'Concentration Curl': ['Bicep'],
        'Preacher Curl': ['Bicep'],
        'Reverse Curl': ['Bicep', 'Forearms'],
        'Tricep Pushdown': ['Tricep'],
        'Skull Crushers': ['Tricep'],
        'Overhead Tricep Extension': ['Tricep'],
        'Dumbbell Tricep Kickback': ['Tricep'],
        'Close Grip Bench Press': ['Tricep', 'Chest'],
        'Plank': ['Abs', 'Obliques'],
        'Burpees': ['Chest', 'Quads', 'Glutes', 'Shoulder'],
        'Mountain Climbers': ['Abs', 'Shoulder']
    };

    // Fallback for unknown exercises: return array
    const getMuscleGroup = (exerciseName) => {
        if (EXERCISE_MUSCLE_MAP[exerciseName]) return EXERCISE_MUSCLE_MAP[exerciseName];
        // Heuristics
        const lower = exerciseName.toLowerCase();
        if (lower.includes('press')) return ['Chest', 'Tricep'];
        if (lower.includes('squat')) return ['Quads', 'Glutes'];
        if (lower.includes('leg')) return ['Quads', 'Hamstrings'];
        if (lower.includes('curl')) return ['Bicep'];
        if (lower.includes('row') || lower.includes('pull')) return ['Lats', 'Back'];
        return [];
    };

    // ==========================================
    // 3. HELPER FUNCTIONS
    // ==========================================
    const showNotification = (msg, type = 'success') => {
        elements.notification.textContent = msg;
        elements.notification.className = `notification show ${type}`;
        setTimeout(() => elements.notification.classList.remove('show'), 3000);
    };

    const hideLoader = () => { elements.loader.style.opacity = '0'; setTimeout(() => elements.loader.style.visibility = 'hidden', 500); };

    const playBeep = () => {
        try {
            if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
            oscillator.type = 'sine'; oscillator.frequency.value = 800; gainNode.gain.value = 0.1;
            oscillator.start(); setTimeout(() => oscillator.stop(), 200);
            setTimeout(() => { const osc2 = audioContext.createOscillator(); const gain2 = audioContext.createGain(); osc2.connect(gain2); gain2.connect(audioContext.destination); osc2.type = 'sine'; osc2.frequency.value = 800; gain2.gain.value = 0.1; osc2.start(); setTimeout(() => osc2.stop(), 200); }, 300);
        } catch (e) { console.warn("Audio blocked"); }
    };

    const triggerConfetti = () => {
        if (typeof confetti !== 'function') return;
        const count = 200; const defaults = { origin: { y: 0.7 } };
        function fire(particleRatio, opts) { confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) }); }
        fire(0.25, { spread: 26, startVelocity: 55 }); fire(0.2, { spread: 60 }); fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 }); fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 }); fire(0.1, { spread: 120, startVelocity: 45 });
    };

    const calculate1RM = (weight, reps) => { if (!weight || !reps) return 0; if (reps === 1) return weight; return Math.round(weight * (1 + reps / 30)); };

    // ==========================================
    // 4. DATABASE FUNCTIONS
    // ==========================================
    const addWorkoutToServer = async (workout) => { const user = auth.currentUser; if (!user) throw new Error("No user"); const docRef = await addDoc(collection(db, "workouts"), { ...workout, userId: user.uid }); return docRef.id; };
    const addBodyWeightToServer = async (entry) => { const user = auth.currentUser; if (!user) throw new Error("No user"); const docRef = await addDoc(collection(db, "bodyweight"), { ...entry, userId: user.uid }); return docRef.id; };
    const loadDataFromServer = async () => {
        const user = auth.currentUser; if (!user) return;
        try { const q = query(collection(db, "workouts"), where("userId", "==", user.uid), orderBy("date")); const s = await getDocs(q); data = []; s.forEach(doc => data.push({ id: doc.id, ...doc.data() })); } catch (e) { if (e.message.includes("indexes")) console.warn("Index Required for Workouts"); }
        try { const q2 = query(collection(db, "bodyweight"), where("userId", "==", user.uid), orderBy("date")); const s2 = await getDocs(q2); bwData = []; s2.forEach(doc => bwData.push({ id: doc.id, ...doc.data() })); } catch (e) { if (e.message.includes("indexes")) console.warn("Index Required for BodyWeight"); }
    };
    const deleteWorkoutFromServer = async (id) => { try { await deleteDoc(doc(db, "workouts", id)); return true; } catch (e) { return false; } };
    const clearAllDataOnServer = async () => { showNotification("Deleting...", "info"); for (const w of data) await deleteDoc(doc(db, "workouts", w.id)); for (const bw of bwData) await deleteDoc(doc(db, "bodyweight", bw.id)); };

    // ==========================================
    // 5. UI & CALCULATIONS
    // ==========================================
    const calculateCalories = (workout) => { const intensity = EXERCISE_INTENSITY_FACTORS[workout.exercise] || EXERCISE_INTENSITY_FACTORS['default']; let duration = (workout.durationMinutes || 0) + ((workout.durationSeconds || 0) / 60); if (duration === 0) duration = (workout.sets || 1) * 1.5; return duration * intensity; };
    const calculatePRs = () => { prMap = {}; prDates = {}; data.forEach(w => { if (w.weight && (!prMap[w.exercise] || w.weight > prMap[w.exercise])) { prMap[w.exercise] = w.weight; prDates[w.exercise] = w.date; } }); };

    const updateAllUI = () => { calculatePRs(); updateDataStatus(); updateStats(); updateBodyWeightStats(); updateHistory(); updatePRSection(); updateAnalyticsDropdown(); updateChart(); updateMuscleHeatmap(); };

    const updateMuscleHeatmap = () => {
        // 1. Calculate Volume for Last 7 Days per Muscle Group
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const muscleVolume = {};

        data.forEach(workout => {
            const wDate = new Date(workout.date);
            if (wDate >= oneWeekAgo) {
                const targets = getMuscleGroup(workout.exercise);
                // Handle both single string and array (though we moved to array, legacy check doesn't hurt)
                const list = Array.isArray(targets) ? targets : [targets];

                list.forEach(m => {
                    if (m) muscleVolume[m] = (muscleVolume[m] || 0) + (workout.sets || 1);
                });
            }
        });

        // 2. Render Heatmap (Opacity based on volume)
        // Thresholds: 1-4 sets = Low, 5-9 sets = Med, 10+ sets = High

        document.querySelectorAll('.body-part[data-muscle]').forEach(part => {
            const muscle = part.dataset.muscle;
            const vol = muscleVolume[muscle] || 0;

            // Reset
            part.style.backgroundColor = 'var(--input-bg)';
            part.style.opacity = '1';
            part.style.boxShadow = 'none';

            if (vol > 0) {
                part.style.backgroundColor = 'var(--accent-start)';
                if (vol < 5) {
                    part.style.opacity = '0.5';
                } else if (vol < 10) {
                    part.style.opacity = '0.8';
                } else {
                    part.style.backgroundColor = 'var(--accent-end)';
                    part.style.opacity = '1';
                    part.style.boxShadow = '0 0 10px var(--accent-end)';
                }
            }
        });
    };

    const updateDataStatus = () => { const user = auth.currentUser; elements.dataStatus.textContent = `${data.length} workouts • User: ${user ? user.uid.slice(0, 5) : 'Guest'}`; };
    const updateBodyWeightStats = () => {
        if (!bwData.length) {
            elements.bwCurrent.textContent = "--";
            elements.bwStart.textContent = "--";
            elements.bwChange.textContent = "--";
            return;
        }
        const current = bwData[bwData.length - 1].weight;
        const start = bwData[0].weight;
        const diff = (current - start);

        elements.bwCurrent.textContent = `${formatWeight(current)} ${getUnitLabel()}`;
        elements.bwStart.textContent = `${formatWeight(start)} ${getUnitLabel()}`;
        elements.bwChange.textContent = `${diff > 0 ? '+' : ''}${formatWeight(Math.abs(diff))} ${getUnitLabel()}`;
    };
    const updateStats = () => {
        elements.totalWorkouts.textContent = data.length;

        // Volume Calculation needs to account for units if we display it
        // We calculate raw KG volume first
        const rawVolume = data.reduce((s, w) => s + (w.reps * w.sets * w.weight), 0);
        elements.totalVolume.textContent = Math.round(userPreferences.units === 'lbs' ? rawVolume * 2.20462 : rawVolume).toLocaleString();

        const mins = Math.round(data.reduce((s, w) => s + (w.durationMinutes || 0) + (w.durationSeconds || 0) / 60, 0));
        elements.totalTime.textContent = `${mins}m`;
        elements.caloriesBurned.textContent = Math.round(data.reduce((s, w) => s + calculateCalories(w), 0));
    };

    const updateAchievementsUI = () => {
        if (!gamificationModule) return;
        gamificationModule.renderRewards(elements.achievementsGrid);

        const progress = gamificationModule.getProgress();
        if (progress) {
            elements.achievementsProgress.textContent = `${progress.current} / ${progress.total} Unlocked`;
            const pct = Math.round((progress.current / progress.total) * 100);
            elements.achievementsProgressBar.style.width = `${pct}%`;
        }
    };

    const updatePRSection = () => {
        if (Object.keys(prMap).length === 0) { elements.prList.innerHTML = `<div class="empty-state" style="padding:1rem; text-align:center;"><img src="https://cdn-icons-png.flaticon.com/512/7486/7486803.png" style="width:60px; display:block; margin:0 auto 0.5rem; opacity:0.6;"><p style="opacity:0.7;">Log a workout to earn your trophy! <i class="ri-trophy-line"></i></p></div>`; return; }
        elements.prList.innerHTML = Object.entries(prMap).sort(([exA], [exB]) => exA.localeCompare(exB)).map(([ex, wt]) => `<li><strong>${ex}</strong><span>${formatWeight(wt)} ${getUnitLabel()}</span></li>`).join('');
    };

    // --- HISTORY SECTION (WITH CUSTOM DROPDOWN FIX) ---
    const updateHistory = () => {
        const filter = document.getElementById('history-filter-exercise')?.value || '';
        const filtered = filter ? data.filter(d => d.exercise === filter) : data;

        // 1. Rebuild the Select HTML
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        elements.historyControls.innerHTML = ` <label for="history-filter-exercise">Filter by Exercise:</label> <select id="history-filter-exercise"> <option value="">All Exercises</option> ${exercises.map(ex => `<option value="${ex}" ${ex === filter ? 'selected' : ''}>${ex}</option>`).join('')} </select>`;

        // 2. APPLY CUSTOM DROPDOWN STYLE IMMEDIATELY
        const historySelect = document.getElementById('history-filter-exercise');
        applyCustomDropdown(historySelect);

        // 3. Re-attach listener to the NATIVE select (which the custom dropdown triggers)
        historySelect.addEventListener('change', updateFilteredHistory);

        if (!filtered.length) { elements.historyList.innerHTML = `<div class="empty-state" style="padding:2rem; text-align:center;"><img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" style="width:80px; display:block; margin:0 auto 1rem; opacity:0.6;"><p style="opacity:0.7;">No workouts yet. Go lift! 💪</p></div>`; return; }

        const grouped = filtered.reduce((acc, d) => { const date = d.date.split('T')[0]; (acc[date] = acc[date] || []).push(d); return acc; }, {});
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        elements.historyList.innerHTML = sortedDates.map(date => ` <div class="history-date"> <h3>${new Date(date).toLocaleDateString()}</h3> <table> <thead><tr><th>Exercise</th><th>Reps</th><th>Sets</th><th>Weight (${getUnitLabel()})</th><th>Time</th><th></th></tr></thead> <tbody> ${grouped[date].map(e => `<tr><td>${e.exercise}</td><td>${e.reps}</td><td>${e.sets}</td><td>${formatWeight(e.weight)} <span class="rm-tag">(1RM: ${formatWeight(calculate1RM(e.weight, e.reps))})</span></td><td>${e.durationMinutes}m</td><td><button class="delete-item-btn" data-id="${e.id}"><i class="ri-delete-bin-line"></i></button></td></tr>`).join('')} </tbody> </table> </div>`).join('');
    };

    const updateFilteredHistory = () => {
        // Just call updateHistory() - it will preserve the filter because it reads the value before rebuilding
        updateHistory();
    };

    // --- ANALYTICS DROPDOWN (WITH FIX) ---
    const updateAnalyticsDropdown = () => {
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        const sel = elements.analyticsExerciseSelect.value;
        elements.analyticsExerciseSelect.innerHTML = `<option value="All">All Exercises</option>${exercises.map(ex => `<option value="${ex}" ${ex === sel ? 'selected' : ''}>${ex}</option>`).join('')}`;

        // Apply Custom Style
        applyCustomDropdown(elements.analyticsExerciseSelect);
    };

    const updateChart = () => { if (analyticsChart) analyticsChart.destroy(); const sel = elements.analyticsExerciseSelect.value; let config = {}; if (currentChartType === 'bodyweight') { config = { type: 'line', data: { labels: bwData.map(d => d.date), datasets: [{ label: 'Body Weight', data: bwData.map(d => d.weight), borderColor: '#3498db', fill: true }] } }; } else if (currentChartType === 'weight' && sel !== 'All') { const sorted = data.filter(d => d.exercise === sel).sort((a, b) => new Date(a.date) - new Date(b.date)); config = { type: 'line', data: { labels: sorted.map(d => d.date), datasets: [{ label: 'Weight', data: sorted.map(d => d.weight), borderColor: '#10b981' }] } }; } else { config = { type: 'bar', data: { labels: ['No Data'], datasets: [{ label: 'Select Exercise for Progress', data: [] }] } }; } if (config.data && config.data.labels.length) analyticsChart = new Chart(elements.ctx, config); };

    // ==========================================
    // 6. REUSABLE CUSTOM DROPDOWN FUNCTION
    // ==========================================
    const applyCustomDropdown = (selectElement) => {
        if (!selectElement) return;

        // Hide native
        selectElement.classList.add('hidden-native');

        // Remove old wrapper
        let existingWrapper = selectElement.parentNode.querySelector('.custom-select-container');
        if (existingWrapper) existingWrapper.remove();

        // Build Container
        const container = document.createElement('div'); container.className = 'custom-select-container';
        const trigger = document.createElement('div'); trigger.className = 'custom-select-trigger';
        const selected = selectElement.options[selectElement.selectedIndex];
        trigger.textContent = selected ? selected.textContent : 'Select...';

        const optionsDiv = document.createElement('div'); optionsDiv.className = 'custom-options';

        // Search
        if (selectElement.options.length > 5) {
            const sBox = document.createElement('div'); sBox.className = 'dropdown-search-container';
            const sInp = document.createElement('input'); sInp.className = 'dropdown-search-input'; sInp.placeholder = '🔍 Search...';
            sInp.addEventListener('input', e => {
                const v = e.target.value.toLowerCase();
                optionsDiv.querySelectorAll('.custom-option').forEach(o => { if (o.textContent.toLowerCase().includes(v)) o.classList.remove('hidden-option'); else o.classList.add('hidden-option'); });
                optionsDiv.querySelectorAll('.custom-optgroup-wrapper').forEach(g => { let c = 0; g.querySelectorAll('.custom-option').forEach(o => { if (!o.classList.contains('hidden-option')) c++; }); g.querySelector('.custom-optgroup-label').classList.toggle('hidden-option', c === 0); });
            });
            sBox.addEventListener('click', e => e.stopPropagation()); sBox.appendChild(sInp); optionsDiv.appendChild(sBox);
        }

        // Build Items
        Array.from(selectElement.children).forEach(child => {
            if (child.tagName === 'OPTGROUP') {
                const grp = document.createElement('div'); grp.className = 'custom-optgroup-wrapper';
                const lbl = document.createElement('div'); lbl.className = 'custom-optgroup-label'; lbl.textContent = child.label; grp.appendChild(lbl);
                Array.from(child.children).forEach(opt => {
                    const div = document.createElement('div'); div.className = 'custom-option'; div.textContent = opt.textContent;
                    div.addEventListener('click', () => {
                        selectElement.value = opt.value; selectElement.dispatchEvent(new Event('change'));
                        trigger.textContent = opt.textContent; container.classList.remove('open');

                        // Specific Logic for Main Log Form
                        if (selectElement.id === 'exercise-select') {
                            handleAutoFill(opt.value);
                            // Update Image Preview
                            if (elements.exercisePreview && MUSCLE_IMAGES) {
                                const cat = child.label;
                                const img = MUSCLE_IMAGES[cat] || MUSCLE_IMAGES['default'];
                                elements.exercisePreview.style.backgroundImage = `url('${img}')`;
                                elements.previewLabel.textContent = `${cat} - ${opt.textContent}`;
                            }
                        }
                    });
                    grp.appendChild(div);
                });
                optionsDiv.appendChild(grp);
            } else if (child.tagName === 'OPTION') {
                const div = document.createElement('div'); div.className = 'custom-option'; div.textContent = child.textContent;
                div.addEventListener('click', () => {
                    selectElement.value = child.value; selectElement.dispatchEvent(new Event('change'));
                    trigger.textContent = child.textContent; container.classList.remove('open');
                    if (selectElement.id === 'exercise-select') handleAutoFill(child.value);
                });
                optionsDiv.appendChild(div);
            }
        });

        trigger.addEventListener('click', e => { e.stopPropagation(); document.querySelectorAll('.custom-select-container.open').forEach(c => c !== container && c.classList.remove('open')); container.classList.toggle('open'); if (container.classList.contains('open')) { const inp = container.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 100); } });
        document.addEventListener('click', e => { if (!container.contains(e.target)) container.classList.remove('open'); });

        container.appendChild(trigger); container.appendChild(optionsDiv);
        selectElement.parentNode.insertBefore(container, selectElement);
    };

    const handleAutoFill = (exerciseName) => {
        if (!exerciseName) return;
        const h = data.filter(item => item.exercise.toLowerCase() === exerciseName.toLowerCase());
        if (h.length > 0) {
            const l = h[h.length - 1];
            elements.form.reps.value = l.reps;
            elements.form.sets.value = l.sets;
            // Put raw KG in input, user sees KG. 
            // UX Decision: Always input in KG for now to avoid database mess, OR convert?
            // User requested: "switch the entire app to display lbs".
            // Ideally inputs should toggle too. 
            // COMPLEXITY: Converting input values on toggle.
            // SIMPLIFICATION: Input is always treated as raw value. Label changes.
            // If mode is LBS, we should autofill converted value?
            // Let's stick to raw for input to avoid double-conversion bugs for now, 
            // OR simply autofill raw. 
            // Better: Display converted value in placeholder/value if unit is LBS.
            let displayWeight = l.weight;
            if (userPreferences.units === 'lbs') displayWeight = (l.weight * 2.20462).toFixed(1);

            elements.form.weight.value = displayWeight;
            showNotification(`Values loaded.`, "info");
            update1RM();
        } else {
            elements.form.reps.value = '';
            elements.form.sets.value = '';
            elements.form.weight.value = '';
            update1RM();
        }
    };
    const update1RM = () => {
        let w = parseFloat(elements.form.weight.value);
        const r = parseInt(elements.form.reps.value);

        // If in LBS mode, we need to convert INPUT (lbs) back to KG for calculation?
        // Wait, 1RM formula works on any unit. The result will be in the same unit.
        // But if we want to store standard KG, we must convert input back.
        // Let's say we just calculate 1RM in CURRENT unit for display.

        if (w && r) {
            const rm = calculate1RM(w, r);
            elements.rmDisplay.querySelector('span').textContent = rm;
            elements.rmDisplay.classList.remove('hidden');
        } else elements.rmDisplay.classList.add('hidden');
    };
    const startTimer = (seconds) => { clearInterval(timerInterval); elements.timerDisplay.classList.remove('hidden'); elements.timerCancel.classList.remove('hidden'); elements.timerWidget.classList.add('timer-active'); let t = seconds; const tick = () => elements.timerDisplay.textContent = `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`; tick(); timerInterval = setInterval(() => { t--; if (t < 0) { clearInterval(timerInterval); playBeep(); elements.timerWidget.classList.remove('timer-active'); showNotification("Time's up!", "info"); } else tick(); }, 1000); };

    // ==========================================
    // 7. LISTENERS
    // ==========================================
    const setupEventListeners = () => {
        // REMOVED toggleMenu logic as per redesign (no hamburger)
        elements.navItems.forEach(item => item.addEventListener('click', () => {
            elements.views.forEach(v => v.classList.remove('active-view'));
            document.getElementById(item.dataset.target).classList.add('active-view');

            // Sync active state (Sidebar + Bottom Nav)
            const target = item.dataset.target;
            elements.navItems.forEach(n => n.classList.toggle('active', n.dataset.target === target));

            if (item.dataset.target === 'view-analytics') setTimeout(updateChart, 100);
            if (item.dataset.target === 'view-achievements') updateAchievementsUI();
        }));

        // Header Profile Click -> Open Settings
        const headerProfile = document.getElementById('header-profile');
        if (headerProfile) {
            headerProfile.addEventListener('click', () => {
                document.querySelector('.nav-item[data-target="view-settings"]').click();
            });
        }

        elements.themeToggle.addEventListener('change', () => { document.body.classList.toggle('dark-mode'); updateChart(); });
        elements.timerToggleIcon.addEventListener('click', () => elements.timerWidget.classList.toggle('open')); elements.timerBtns.forEach(btn => btn.addEventListener('click', () => startTimer(parseInt(btn.dataset.time)))); elements.timerCancel.addEventListener('click', () => { clearInterval(timerInterval); elements.timerDisplay.classList.add('hidden'); elements.timerCancel.classList.add('hidden'); elements.timerWidget.classList.remove('timer-active'); });

        // Custom Text Input Toggle
        elements.toggleInputBtn.addEventListener('click', () => {
            isCustomInput = !isCustomInput; elements.toggleInputBtn.classList.toggle('active');
            const customContainer = elements.exerciseSelect.parentNode.querySelector('.custom-select-container');
            if (isCustomInput) {
                if (customContainer) customContainer.style.display = 'none';
                elements.exerciseSelect.removeAttribute('required'); elements.exerciseText.classList.remove('hidden'); elements.exerciseText.setAttribute('required', 'true'); elements.exerciseText.focus();
            } else {
                elements.exerciseText.classList.add('hidden'); elements.exerciseText.removeAttribute('required');
                if (customContainer) customContainer.style.display = 'block';
                elements.exerciseSelect.setAttribute('required', 'true');
            }
        });

        elements.exerciseText.addEventListener('blur', () => handleAutoFill(elements.exerciseText.value));
        elements.exerciseText.addEventListener('blur', () => handleAutoFill(elements.exerciseText.value));
        elements.form.weight.addEventListener('input', update1RM); elements.form.reps.addEventListener('input', update1RM);

        elements.btnCalculate.addEventListener('click', () => {
            const w = parseFloat(elements.calcWeight.value);
            const r = parseInt(elements.calcReps.value);
            if (!w || !r) return showNotification("Enter values", "error");
            const max = calculate1RM(w, r);
            elements.calcMaxDisplay.textContent = `${max} ${getUnitLabel()}`;
            elements.calcResultsArea.classList.remove('hidden');
            elements.percentageList.innerHTML = [95, 90, 85, 80, 75, 70, 65, 60].map(p => `<tr><td>${p}%</td><td>${Math.round(max * (p / 100))} ${getUnitLabel()}</td><td>~${Math.max(1, Math.round(30 * ((max / (max * (p / 100))) - 1)))} reps</td></tr>`).join('');
        });
        elements.historyList.addEventListener('click', async (e) => { if (e.target.classList.contains('delete-item-btn') && confirm("Delete?")) { if (await deleteWorkoutFromServer(e.target.dataset.id)) { data = data.filter(i => i.id !== e.target.dataset.id); updateAllUI(); showNotification("Deleted."); } } });
        elements.bwForm.addEventListener('submit', async (e) => { e.preventDefault(); const w = parseFloat(elements.bwInput.value); if (w) { const id = await addBodyWeightToServer({ weight: w, date: elements.bwDate.value }); bwData.push({ id, weight: w, date: elements.bwDate.value }); bwData.sort((a, b) => new Date(a.date) - new Date(b.date)); updateAllUI(); showNotification("Logged."); } });
        elements.exportBtn.addEventListener('click', () => { if (!data.length) return showNotification("No data.", "error"); const blob = new Blob([JSON.stringify({ workouts: data, bodyweight: bwData })], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fittrack.json`; a.click(); });
        elements.importInput.addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = async (ev) => { try { const i = JSON.parse(ev.target.result); if (i.workouts) for (const w of i.workouts) await addWorkoutToServer(w); if (i.bodyweight) for (const b of i.bodyweight) await addBodyWeightToServer(b); await loadDataFromServer(); updateAllUI(); showNotification("Imported!"); } catch (err) { showNotification("Import failed", "error"); } }; r.readAsText(f); }); elements.importBtn.addEventListener('click', () => elements.importInput.click()); elements.clearBtn.addEventListener('click', async () => { if (confirm("Delete ALL?")) { await clearAllDataOnServer(); data = []; bwData = []; updateAllUI(); } });

        // MAIN SUBMIT
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let ex = isCustomInput ? elements.exerciseText.value.trim() : elements.exerciseSelect.value;
            if (isCustomInput && ex) ex = ex.charAt(0).toUpperCase() + ex.slice(1);
            if (!ex) return showNotification("Select exercise.", "error");

            // CONVERT INPUT WEIGHT TO KG IF IN LBS MODE
            let inputWeight = parseFloat(elements.form.weight.value);
            if (userPreferences.units === 'lbs') {
                inputWeight = inputWeight / 2.20462;
            }

            const nw = {
                exercise: ex,
                reps: parseInt(elements.form.reps.value),
                sets: parseInt(elements.form.sets.value),
                weight: parseFloat(inputWeight.toFixed(2)), // Store in KG
                durationMinutes: parseInt(elements.form['duration-minutes'].value) || 0,
                durationSeconds: parseInt(elements.form['duration-seconds'].value) || 0,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            const curMax = data.filter(d => d.exercise === ex).reduce((m, c) => Math.max(m, c.weight), 0);
            const isPR = nw.weight > curMax;
            try {
                const id = await addWorkoutToServer(nw); data.push({ ...nw, id }); updateAllUI();

                // Check Routine Progress
                if (routinesModule && routinesModule.checkProgress(ex)) {
                    triggerConfetti();
                    showNotification("Routine Complete!", "success");
                    if (gamificationModule) gamificationModule.unlock('routine_complete');
                }

                // Check Milestones
                if (gamificationModule) {
                    gamificationModule.checkMilestones(data, nw);
                }

                if (isPR) {
                    triggerConfetti();
                    playBeep();
                    showNotification(`🏆 NEW PR: ${formatWeight(nw.weight)} ${getUnitLabel()}!`, "success");
                } else {
                    showNotification("Added!", "info");
                }

                elements.form.reps.value = '';
                elements.form.sets.value = '';
                elements.form.weight.value = '';
                update1RM();
                if (!isCustomInput) { const trigger = document.querySelector('.custom-select-trigger'); if (trigger) trigger.textContent = 'Select an exercise'; }
            } catch (e) { }
        });

        elements.chartTabs.forEach(t => t.addEventListener('click', () => {
            document.querySelector('.chart-tab.active')?.classList.remove('active');
            t.classList.add('active');

            const type = t.dataset.chart;
            const medalsDiv = document.getElementById('medals-display');
            const chartsDiv = document.querySelector('.chart-container');

            if (type === 'awards') {
                chartsDiv.classList.add('hidden');
                medalsDiv.classList.remove('hidden');
                if (gamificationModule) gamificationModule.renderRewards(medalsDiv);
            } else {
                medalsDiv.classList.add('hidden');
                chartsDiv.classList.remove('hidden');
                currentChartType = type;
                updateChart();
            }
        }));
        elements.analyticsExerciseSelect.addEventListener('change', updateChart);
        elements.bwDate.value = new Date().toISOString().split('T')[0];
    };

    // ==========================================
    // THEME CUSTOMIZATION
    // ==========================================
    const THEMES = [
        { name: 'Megatron', start: '#c6ffdd', middle: '#fbd786', end: '#f7797d' },
        { name: 'Moonlit Astroid', start: '#0f2027', middle: '#203a43', end: '#2c5364' },
        { name: 'Cool Sky', start: '#2980b9', middle: '#6dd5fa', end: '#ffffff' },
        { name: 'Ultra Violet', start: '#654ea3', end: '#eaafc8' },
        { name: 'Burning Orange', start: '#ff416c', end: '#ff4b2b' },
        { name: 'Coal', start: '#eb5757', end: '#000000' },
        { name: 'Pidget', start: '#ee9ca7', end: '#ffdde1' }
    ];

    const initThemes = () => {
        const grid = document.getElementById('theme-grid');
        if (!grid) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            const theme = JSON.parse(savedTheme);
            applyTheme(theme, false); // Don't save again, just apply
        }

        grid.innerHTML = THEMES.map((theme, index) => {
            const gradient = theme.middle
                ? `linear-gradient(135deg, ${theme.start}, ${theme.middle}, ${theme.end})`
                : `linear-gradient(135deg, ${theme.start}, ${theme.end})`;

            return `
                <div class="theme-option" data-index="${index}">
                    <div class="theme-preview" style="background: ${gradient};"></div>
                    <div class="theme-name">${theme.name}</div>
                </div>
            `;
        }).join('');

        // Listeners
        grid.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const idx = opt.dataset.index;
                const theme = THEMES[idx];
                applyTheme(theme, true);

                // Update active state
                grid.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
    };

    const applyTheme = (theme, save = true) => {
        const root = document.documentElement;

        // Construct gradient string
        const gradient = theme.middle
            ? `linear-gradient(135deg, ${theme.start}, ${theme.middle}, ${theme.end})`
            : `linear-gradient(135deg, ${theme.start}, ${theme.end})`;

        // Set Variables
        root.style.setProperty('--accent-start', theme.start);
        root.style.setProperty('--accent-end', theme.end);
        root.style.setProperty('--accent-gradient', gradient);

        // Update Ambient Background (Opacity variations)
        // We use a little trick: convert hex to rgb for rgba usage or just use hex with opacity if browser supports it (modern browsers do #RRGGBBAA)
        // But for safety/consistency with existing code which used rgba(), we might stick to simple calc or just use the hex in the gradient as they are background images.
        // The existing CSS uses rgba(). Let's try to just update the colors in the radial gradient directly.
        // Actually, the CSS uses 'rgba(..., 0.15)'. We can approximate by just using the start/end colors 
        // and letting opacity be handled if we could, but CSS var interpolation in rgba() is tricky without broken-out r,g,b values.
        // For now, let's just update the accent variables as that covers 90% of the UI. 
        // For the ambient background, we can override the background-image property on body directly.

        document.body.style.backgroundImage = `
            radial-gradient(circle at 0% 0%, ${hexToRgba(theme.start, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, ${hexToRgba(theme.end, 0.15)} 0%, transparent 50%)
        `;

        if (save) {
            localStorage.setItem('appTheme', JSON.stringify(theme));
            showNotification(`Theme set to ${theme.name}`, 'success');
        }
    };

    // Preferences Logic ==============================
    const initPreferences = () => {
        const saved = localStorage.getItem('appPreferences');
        if (saved) userPreferences = { ...userPreferences, ...JSON.parse(saved) };

        // Apply Font
        applyFont(userPreferences.font || 'modern');
        // Apply Compact Mode
        applyCompactMode(userPreferences.compactMode || false);
        // Apply Units
        applyUnits(userPreferences.units || 'kg');
        // Apply Avatar
        applyAvatar(userPreferences.avatar, userPreferences.avatarType);

        setupPreferenceListeners();
    };

    const setupPreferenceListeners = () => {
        // Font
        document.querySelectorAll('.segment-btn[data-font]').forEach(btn => {
            btn.addEventListener('click', () => {
                const font = btn.dataset.font;
                userPreferences.font = font;
                applyFont(font);
                savePreferences();
            });
        });

        // Compact Mode
        const compactToggle = document.getElementById('compact-toggle');
        if (compactToggle) {
            compactToggle.checked = userPreferences.compactMode;
            compactToggle.addEventListener('change', (e) => {
                userPreferences.compactMode = e.target.checked;
                applyCompactMode(e.target.checked);
                savePreferences();
            });
        }

        // Units
        const unitToggle = document.getElementById('unit-toggle');
        if (unitToggle) {
            unitToggle.checked = userPreferences.units === 'lbs';
            unitToggle.addEventListener('change', (e) => {
                userPreferences.units = e.target.checked ? 'lbs' : 'kg';
                applyUnits(userPreferences.units);
                savePreferences();
            });
        }

        // Avatar Upload
        const fileInput = document.getElementById('avatar-upload');
        const uploadBtn = document.getElementById('btn-upload-avatar');
        const emojiBtn = document.getElementById('btn-emoji-avatar');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        userPreferences.avatar = ev.target.result;
                        userPreferences.avatarType = 'image';
                        applyAvatar(userPreferences.avatar, 'image');
                        savePreferences();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                const emoji = prompt("Enter an emoji for your avatar:", "🦁");
                if (emoji) {
                    userPreferences.avatar = emoji;
                    userPreferences.avatarType = 'emoji';
                    applyAvatar(emoji, 'emoji');
                    savePreferences();
                }
            });
        }
    };

    const applyFont = (font) => {
        document.body.classList.remove('font-modern', 'font-tech', 'font-classic');
        document.body.classList.add(`font-${font}`);

        // Update UI state
        document.querySelectorAll('.segment-btn[data-font]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === font);
        });
    };

    const applyCompactMode = (isCompact) => {
        document.body.classList.toggle('mode-compact', isCompact);
    };

    const applyUnits = (unit) => {
        const isLbs = unit === 'lbs';
        document.getElementById('unit-label-kg')?.classList.toggle('active', !isLbs);
        document.getElementById('unit-label-lbs')?.classList.toggle('active', isLbs);

        // Update labels throughout app
        const inputs = document.querySelectorAll('label[for="weight"]');
        inputs.forEach(l => l.innerHTML = `Weight (${unit}):`);
        const inputs2 = document.querySelectorAll('input[id*="weight"]');
        inputs2.forEach(i => i.placeholder = unit === 'lbs' ? 'Weight (lbs)' : 'Weight (kg)');

        // Refresh UI
        updateAllUI();
    };

    const applyAvatar = (content, type) => {
        if (!content) return;

        const headerAvatar = document.querySelector('.header-right .header-avatar');
        const headerProfileDiv = document.querySelector('.header-right .profile-pic');
        const preview = document.getElementById('avatar-preview-settings');

        if (type === 'image') {
            if (headerAvatar) {
                headerAvatar.src = content;
                headerAvatar.style.display = 'block';
            }
            if (headerProfileDiv) {
                headerProfileDiv.innerHTML = `<img class="header-avatar" src="${content}" style="width:100%; height:100%; object-fit:cover;">`;
            }

            if (preview) preview.src = content;
        } else {
            const emojiHTML = `<div style="font-size: 1.5rem; display:flex; justify-content:center; align-items:center; height:100%;">${content}</div>`;
            if (headerProfileDiv) {
                headerProfileDiv.innerHTML = emojiHTML;
            }
            if (preview) { preview.style.display = 'none'; preview.parentNode.insertAdjacentHTML('afterbegin', `<div id="emoji-preview" style="font-size: 2.5rem;">${content}</div>`); }
        }
    };

    const savePreferences = () => {
        localStorage.setItem('appPreferences', JSON.stringify(userPreferences));
    };


    // Helper to convert hex to rgba for the background glow
    const hexToRgba = (hex, alpha) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex; // Fallback
    };

    let routinesModule = null;
    let gamificationModule = null;

    // ==========================================
    // 8. INIT
    // ==========================================
    const init = async () => {
        try { await signInAnonymously(auth); await loadDataFromServer(); } catch (e) { console.error(e); } finally {
            applyCustomDropdown(elements.exerciseSelect);
            setupEventListeners();
            initThemes();
            initPreferences();

            // Init Modules
            routinesModule = initRoutines(app, db, auth, elements);
            gamificationModule = initGamification();

            updateAllUI();
            hideLoader();
            document.querySelector('.nav-item[data-target="view-home"]').click();

            // First Visit Award?
            if (data.length === 0) {
                // fresh user logic
            }
        }
    };
    init();
});