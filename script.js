// ==========================================
// 1. IMPORTS & FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    // 2. DOM ELEMENTS & STATE
    // ==========================================
    const elements = {
        // Main Form
        form: document.getElementById('workout-form'),
        exerciseSelect: document.getElementById('exercise-select'),
        exerciseText: document.getElementById('exercise-text'),
        toggleInputBtn: document.getElementById('toggle-input-btn'),
        rmDisplay: document.getElementById('rm-display'), // Real-time 1RM
        
        // Dedicated 1RM Calculator
        calcWeight: document.getElementById('calc-weight'),
        calcReps: document.getElementById('calc-reps'),
        btnCalculate: document.getElementById('btn-calculate-1rm'),
        calcResultsArea: document.getElementById('calc-results-area'),
        calcMaxDisplay: document.getElementById('calc-max-display'),
        percentageList: document.getElementById('percentage-list'),

        // Body Weight Form
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
        timerCancel: document.getElementById('timer-cancel')
    };

    // Application State
    let data = [];       // Workout Data
    let bwData = [];     // Body Weight Data
    let prMap = {};
    let prDates = {};
    let currentChartType = 'weight';
    let analyticsChart = null;
    let isCustomInput = false;
    
    // Timer State
    let timerInterval = null;
    let audioContext = null;
    
    // Dropdown State
    let customSelectContainer = null;
    let customSelectTrigger = null;

    const EXERCISE_INTENSITY_FACTORS = { 'Push Up': 4.5, 'Chest Press': 4.0, 'Incline Dumbbell Press': 4.0, 'Chest Fly': 2.5, 'Shoulder Press': 4.0, 'Lateral Raise': 2.5, 'Front Raise': 2.5, 'Rear Delt Fly': 2.5, 'Arnold Press': 4.5, 'Pull Up': 6.0, 'Barbell Row': 5.0, 'Seated Row': 3.5, 'Lat Pulldown': 3.5, 'Face Pull': 2.5, 'Squat': 6.0, 'Leg Press': 5.5, 'Lunges': 4.5, 'Leg Curl': 3.0, 'Calf Raise': 2.5, 'Bicep Curl': 2.5, 'Hammer Curl': 2.5, 'Concentration Curl': 2.0, 'Preacher Curl': 2.0, 'Reverse Curl': 2.5, 'Tricep Pushdown': 2.5, 'Skull Crushers': 3.0, 'Overhead Tricep Extension': 3.0, 'Dumbbell Tricep Kickback': 2.5, 'Close Grip Bench Press': 4.5, 'Plank': 3.0, 'Burpees': 9.0, 'Mountain Climbers': 7.0, 'default': 3.5 };

    // ==========================================
    // 3. HELPER FUNCTIONS
    // ==========================================
    const showNotification = (msg, type = 'success') => {
        elements.notification.textContent = msg;
        elements.notification.className = `notification show ${type}`;
        setTimeout(() => elements.notification.classList.remove('show'), 3000);
    };

    const hideLoader = () => {
        elements.loader.style.opacity = '0';
        setTimeout(() => elements.loader.style.visibility = 'hidden', 500);
    };

    const playBeep = () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine'; oscillator.frequency.value = 800; gainNode.gain.value = 0.1;
        oscillator.start(); setTimeout(() => oscillator.stop(), 200);
        setTimeout(() => { 
            const osc2 = audioContext.createOscillator(); 
            const gain2 = audioContext.createGain(); 
            osc2.connect(gain2); gain2.connect(audioContext.destination); 
            osc2.type = 'sine'; osc2.frequency.value = 800; gain2.gain.value = 0.1; 
            osc2.start(); setTimeout(() => osc2.stop(), 200); 
        }, 300);
    };

    // ==========================================
    // 4. SERVER FUNCTIONS (Firebase)
    // ==========================================
    const addWorkoutToServer = async (workout) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const docRef = await addDoc(collection(db, "workouts"), { ...workout, userId: user.uid });
        return docRef.id;
    };

    const addBodyWeightToServer = async (entry) => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
        const docRef = await addDoc(collection(db, "bodyweight"), { ...entry, userId: user.uid });
        return docRef.id;
    };

    const loadDataFromServer = async () => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. Load Workouts
        try {
            const q = query(collection(db, "workouts"), where("userId", "==", user.uid), orderBy("date"));
            const querySnapshot = await getDocs(q);
            data = [];
            querySnapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error loading workouts:", e);
            if (e.message.includes("indexes")) {
                showNotification("Database Index Required. Check Console.", "error");
                console.warn("⚠️ CLICK THIS LINK TO CREATE INDEX: " + e.message.match(/https:\/\/[^\s]+/)[0]);
            }
        }

        // 2. Load Body Weight
        try {
            const q2 = query(collection(db, "bodyweight"), where("userId", "==", user.uid), orderBy("date"));
            const snapshot2 = await getDocs(q2);
            bwData = [];
            snapshot2.forEach(doc => bwData.push({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error loading bodyweight:", e);
             if (e.message.includes("indexes")) {
                console.warn("⚠️ BODYWEIGHT INDEX REQUIRED: Check console logs.");
            }
        }
    };

    const deleteWorkoutFromServer = async (id) => {
        try { await deleteDoc(doc(db, "workouts", id)); return true; } catch (e) { showNotification("Failed to delete.", "error"); return false; }
    };

    const clearAllDataOnServer = async () => {
        showNotification("Deleting all data...", "info");
        try {
            for (const workout of data) await deleteDoc(doc(db, "workouts", workout.id));
            for (const bw of bwData) await deleteDoc(doc(db, "bodyweight", bw.id));
        } catch (e) { showNotification("Failed to delete some data.", "error"); }
    };

    // ==========================================
    // 5. CALCULATIONS & UI UPDATES
    // ==========================================
    const calculateCalories = (workout) => {
        const intensity = EXERCISE_INTENSITY_FACTORS[workout.exercise] || EXERCISE_INTENSITY_FACTORS['default'];
        let duration = (workout.durationMinutes || 0) + ((workout.durationSeconds || 0) / 60);
        if (duration === 0) duration = (workout.sets || 1) * 1.5;
        return duration * intensity;
    };

    // --- 1RM Calculation (Epley Formula) ---
    const calculate1RM = (weight, reps) => {
        if (!weight || !reps) return 0;
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    };

    const calculatePRs = () => {
        prMap = {}; prDates = {};
        data.forEach(w => {
            if (w.weight && (!prMap[w.exercise] || w.weight > prMap[w.exercise])) {
                prMap[w.exercise] = w.weight;
                prDates[w.exercise] = w.date;
            }
        });
    };

    const updateAllUI = () => {
        calculatePRs();
        updateDataStatus();
        updateStats();
        updateBodyWeightStats();
        updateHistory();
        updatePRSection();
        updateAnalyticsDropdown();
        updateChart();
    };

    const updateDataStatus = () => {
        const user = auth.currentUser;
        const shortId = user ? user.uid.substring(0, 5) + "..." : "Guest";
        elements.dataStatus.textContent = `${data.length} workouts • User: ${shortId}`;
    };

    const updateBodyWeightStats = () => {
        if (bwData.length === 0) {
            elements.bwCurrent.textContent = "--";
            elements.bwStart.textContent = "--";
            elements.bwChange.textContent = "--";
            return;
        }
        const current = bwData[bwData.length - 1].weight;
        const start = bwData[0].weight;
        const diff = (current - start).toFixed(1);
        const sign = diff > 0 ? "+" : "";
        
        elements.bwCurrent.textContent = `${current} kg`;
        elements.bwStart.textContent = `${start} kg`;
        elements.bwChange.textContent = `${sign}${diff} kg`;
    };

    const updateStats = () => {
        elements.totalWorkouts.textContent = data.length;
        elements.totalVolume.textContent = Math.round(data.reduce((s, w) => s + (w.reps || 0) * (w.sets || 0) * (w.weight || 0), 0));
        const totalMins = Math.round(data.reduce((s, w) => s + (w.durationMinutes || 0) * 60 + (w.durationSeconds || 0), 0) / 60);
        elements.totalTime.textContent = `${totalMins}m`;
        elements.avgSession.textContent = `${data.length ? Math.round(totalMins / data.length) : 0}m`;
        elements.caloriesBurned.textContent = Math.round(data.reduce((s, w) => s + calculateCalories(w), 0));
    };

    const updatePRSection = () => {
        if (Object.keys(prMap).length === 0) {
            elements.prList.innerHTML = '<li>Log a workout to see your Personal Records.</li>';
            return;
        }
        elements.prList.innerHTML = Object.entries(prMap).sort(([exA], [exB]) => exA.localeCompare(exB)).map(([ex, wt]) => {
            const date = prDates[ex] ? new Date(prDates[ex]).toLocaleDateString() : 'N/A';
            return `<li><strong>${ex}</strong><span>${wt} kg <em>(${date})</em></span></li>`;
        }).join('');
    };

    const updateHistory = () => {
        if (data.length === 0) {
            elements.historyControls.innerHTML = '';
            elements.historyList.innerHTML = '<p style="text-align:center; opacity:0.7;">No workouts logged yet.</p>';
            return;
        }
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        elements.historyControls.innerHTML = ` <label for="history-filter-exercise">Filter by Exercise:</label> <select id="history-filter-exercise"> <option value="">All Exercises</option> ${exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('')} </select>`;
        document.getElementById('history-filter-exercise').addEventListener('change', updateFilteredHistory);
        updateFilteredHistory();
    };

    const updateFilteredHistory = () => {
        const filter = document.getElementById('history-filter-exercise')?.value || '';
        const filtered = filter ? data.filter(d => d.exercise === filter) : data;

        if (!filtered.length) { elements.historyList.innerHTML = '<p style="text-align:center; opacity:0.7;">No entries.</p>'; return; }

        const grouped = filtered.reduce((acc, d) => {
            const dateStr = d.date.split('T')[0];
            (acc[dateStr] = acc[dateStr] || []).push(d);
            return acc;
        }, {});

        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        // Updated HTML with 1RM Tag
        elements.historyList.innerHTML = sortedDates.map(date => ` 
            <div class="history-date"> 
                <h3>${new Date(date).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</h3> 
                <table>
                    <thead><tr><th>Exercise</th><th>Reps</th><th>Sets</th><th>Weight</th><th>Duration</th><th>Action</th></tr></thead> 
                    <tbody>
                        ${grouped[date].map(e => `
                        <tr>
                            <td>${e.exercise}</td><td>${e.reps}</td><td>${e.sets}</td>
                            <td>${e.weight}<span class="rm-tag">(1RM: ${calculate1RM(e.weight, e.reps)})</span></td>
                            <td>${e.durationMinutes||0}m ${e.durationSeconds||0}s</td>
                            <td><button class="delete-item-btn" data-id="${e.id}" title="Delete workout">🗑️</button></td>
                        </tr>`).join('')}
                    </tbody> 
                </table>
            </div>`).join('');
    };

    const updateAnalyticsDropdown = () => {
        const exercises = [...new Set(data.map(d => d.exercise))].sort();
        const currentSelection = elements.analyticsExerciseSelect.value;
        elements.analyticsExerciseSelect.innerHTML = `<option value="All">All Exercises</option>${exercises.map(ex => `<option value="${ex}" ${ex === currentSelection ? 'selected' : ''}>${ex}</option>`).join('')}`;
    };

    const updateChart = () => {
        if (analyticsChart) analyticsChart.destroy();
        
        let selectedExercise = elements.analyticsExerciseSelect.value;
        const colors = { accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-start').trim(), info: getComputedStyle(document.documentElement).getPropertyValue('--info').trim(), text: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(), grid: getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim(), doughnutBg: document.body.classList.contains('dark-mode') ? '#141518' : '#ffffff', palette: ['#1abc9c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e'] };
        let config = {};
        
        // --- CHART TYPE LOGIC ---
        if (currentChartType === 'bodyweight') {
             if (bwData.length === 0) { showNotification("No body weight data yet.", "info"); return; }
             config = {
                type: 'line',
                data: {
                    labels: bwData.map(d => d.date),
                    datasets: [{
                        label: 'Body Weight (kg)',
                        data: bwData.map(d => d.weight),
                        backgroundColor: '#3498db',
                        borderColor: '#3498db',
                        fill: true,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } }, y: { beginAtZero: false, ticks: { color: colors.text }, grid: { color: colors.grid } } } }
            };
        }
        else if (currentChartType === 'exercises') {
            if (data.length === 0) return;
            const counts = data.reduce((acc, d) => { acc[d.exercise] = (acc[d.exercise] || 0) + 1; return acc; }, {});
            config = { type: 'doughnut', data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: colors.palette, borderColor: colors.doughnutBg, borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text } } } } };
        } 
        else if (currentChartType === 'weight' && selectedExercise !== 'All') {
            if (data.length === 0) return;
            const sorted = data.filter(d => d.exercise === selectedExercise).sort((a, b) => new Date(a.date) - new Date(b.date));
            const processedData = sorted.map((currentEntry, index) => { const pastWorkouts = sorted.slice(0, index + 1); const bestSoFar = Math.max(...pastWorkouts.map(w => w.weight || 0)); return { date: currentEntry.date, current: currentEntry.weight, best: bestSoFar }; });
            config = { type: 'line', data: { labels: processedData.map(d => d.date), datasets: [{ label: 'Weight Lifted', data: processedData.map(d => d.current), backgroundColor: colors.accent, borderColor: colors.accent, fill: false, tension: 0.1 }, { label: 'PB', data: processedData.map(d => d.best), backgroundColor: colors.info, borderColor: colors.info, fill: false, tension: 0.1, pointRadius: 0, borderDash: [5, 5] }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } }, y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } } }, plugins: { legend: { labels: { color: colors.text } } } } };
        } else {
             if (data.length === 0) return;
            const filteredData = data.filter(d => selectedExercise === 'All' || d.exercise === selectedExercise);
            const groupedByDate = filteredData.reduce((acc, d) => { const date = d.date.split('T')[0]; acc[date] = acc[date] || []; acc[date].push(d); return acc; }, {});
            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
            let chartData, label, barColor;
            if (currentChartType === 'volume') { label = 'Volume (kg)'; chartData = sortedDates.map(date => groupedByDate[date].reduce((sum, d) => sum + (d.reps || 0) * (d.sets || 0) * (d.weight || 0), 0)); barColor = colors.info; } 
            else { label = 'Duration (min)'; chartData = sortedDates.map(date => groupedByDate[date].reduce((sum, d) => sum + (d.durationMinutes || 0) + (d.durationSeconds || 0) / 60, 0)); barColor = '#9b59b6'; }
            config = { type: 'bar', data: { labels: sortedDates, datasets: [{ label, data: chartData, backgroundColor: barColor, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } }, y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } } }, plugins: { legend: { labels: { color: colors.text } } } } };
        }
        
        if(config.type) analyticsChart = new Chart(elements.ctx, config);
    };

    // ==========================================
    // 6. CUSTOM COMPONENT LOGIC
    // ==========================================

    // --- Searchable Dropdown ---
    const setupCustomDropdown = () => {
        const nativeSelect = elements.exerciseSelect;
        nativeSelect.classList.add('hidden-native');
        
        const existing = document.querySelector('.custom-select-container');
        if (existing) existing.remove();
        
        customSelectContainer = document.createElement('div');
        customSelectContainer.className = 'custom-select-container';
        
        customSelectTrigger = document.createElement('div');
        customSelectTrigger.className = 'custom-select-trigger';
        customSelectTrigger.textContent = 'Select an exercise';
        
        const customOptions = document.createElement('div');
        customOptions.className = 'custom-options';
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'dropdown-search-container';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'dropdown-search-input';
        searchInput.placeholder = '🔍 Search exercises...';
        
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const groups = customOptions.querySelectorAll('.custom-optgroup-wrapper');
            groups.forEach(group => {
                const options = group.querySelectorAll('.custom-option');
                let visibleCount = 0;
                options.forEach(opt => {
                    const text = opt.textContent.toLowerCase();
                    if (text.includes(term)) { opt.classList.remove('hidden-option'); visibleCount++; } 
                    else { opt.classList.add('hidden-option'); }
                });
                const label = group.querySelector('.custom-optgroup-label');
                if (visibleCount > 0) label.classList.remove('hidden-option');
                else label.classList.add('hidden-option');
            });
        });
        
        searchContainer.addEventListener('click', (e) => e.stopPropagation());
        searchContainer.appendChild(searchInput);
        customOptions.appendChild(searchContainer);
        
        Array.from(nativeSelect.children).forEach(child => {
            if(child.tagName === 'OPTGROUP') {
                const groupWrapper = document.createElement('div');
                groupWrapper.className = 'custom-optgroup-wrapper';
                const label = document.createElement('div');
                label.className = 'custom-optgroup-label';
                label.textContent = child.label;
                groupWrapper.appendChild(label);
                
                Array.from(child.children).forEach(opt => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'custom-option';
                    optionDiv.textContent = opt.textContent;
                    optionDiv.dataset.value = opt.value;
                    optionDiv.addEventListener('click', () => {
                        nativeSelect.value = opt.value;
                        nativeSelect.dispatchEvent(new Event('change'));
                        customSelectTrigger.textContent = opt.textContent;
                        customSelectContainer.classList.remove('open');
                        document.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                        optionDiv.classList.add('selected');
                        searchInput.value = ''; searchInput.dispatchEvent(new Event('input'));
                    });
                    groupWrapper.appendChild(optionDiv);
                });
                customOptions.appendChild(groupWrapper);
            }
        });
        
        customSelectTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelectContainer.classList.toggle('open');
            if (customSelectContainer.classList.contains('open')) setTimeout(() => searchInput.focus(), 100);
        });
        
        document.addEventListener('click', (e) => {
            if (customSelectContainer && !customSelectContainer.contains(e.target)) customSelectContainer.classList.remove('open');
        });
        
        customSelectContainer.appendChild(customSelectTrigger);
        customSelectContainer.appendChild(customOptions);
        nativeSelect.parentNode.insertBefore(customSelectContainer, nativeSelect);
    };

    // --- Auto Fill Logic ---
    const handleAutoFill = (exerciseName) => {
        if (!exerciseName) return;
        const history = data.filter(item => item.exercise.toLowerCase() === exerciseName.toLowerCase());
        if (history.length > 0) {
            const last = history[history.length - 1];
            elements.form.reps.value = last.reps;
            elements.form.sets.value = last.sets;
            elements.form.weight.value = last.weight;
            showNotification(`Values loaded from last ${exerciseName} session.`, "info");
            update1RM(); // Update 1RM after auto-fill
        } else {
            elements.form.reps.value = ''; elements.form.sets.value = ''; elements.form.weight.value = '';
            update1RM(); // Clear 1RM
        }
    };

    // --- Real-Time 1RM Estimator (Form) ---
    const update1RM = () => {
        const w = parseFloat(elements.form.weight.value);
        const r = parseInt(elements.form.reps.value);
        if (w && r) {
            const max = calculate1RM(w, r);
            elements.rmDisplay.querySelector('span').textContent = max;
            elements.rmDisplay.classList.remove('hidden');
        } else {
            elements.rmDisplay.classList.add('hidden');
        }
    };

    // --- Rest Timer ---
    const startTimer = (seconds) => {
        clearInterval(timerInterval);
        elements.timerDisplay.classList.remove('hidden');
        elements.timerCancel.classList.remove('hidden');
        elements.timerWidget.classList.add('timer-active');
        let timeLeft = seconds;
        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            elements.timerDisplay.textContent = `${m}:${s}`;
        };
        updateDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) { clearInterval(timerInterval); playBeep(); resetTimer(); showNotification("Rest time over!", "info"); } 
            else { updateDisplay(); }
        }, 1000);
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        elements.timerDisplay.textContent = "00:00";
        elements.timerDisplay.classList.add('hidden');
        elements.timerCancel.classList.add('hidden');
        elements.timerWidget.classList.remove('timer-active');
    };

    // ==========================================
    // 7. EVENT LISTENERS
    // ==========================================
    const setupEventListeners = () => {
        // Theme
        elements.themeToggle.addEventListener('change', () => { document.body.classList.toggle('dark-mode'); updateChart(); });

        // Timer
        elements.timerToggleIcon.addEventListener('click', () => elements.timerWidget.classList.toggle('open'));
        elements.timerBtns.forEach(btn => btn.addEventListener('click', () => startTimer(parseInt(btn.dataset.time))));
        elements.timerCancel.addEventListener('click', resetTimer);

        // Custom Toggle (Text vs List)
        elements.toggleInputBtn.addEventListener('click', () => {
            isCustomInput = !isCustomInput;
            elements.toggleInputBtn.classList.toggle('active');
            if (isCustomInput) {
                if(customSelectContainer) customSelectContainer.style.display = 'none';
                elements.exerciseSelect.removeAttribute('required');
                elements.exerciseText.classList.remove('hidden');
                elements.exerciseText.setAttribute('required', 'true');
                elements.exerciseText.focus();
            } else {
                elements.exerciseText.classList.add('hidden');
                elements.exerciseText.removeAttribute('required');
                if(customSelectContainer) customSelectContainer.style.display = 'block';
                elements.exerciseSelect.setAttribute('required', 'true');
            }
        });

        // Form Listeners
        elements.exerciseSelect.addEventListener('change', () => handleAutoFill(elements.exerciseSelect.value));
        elements.exerciseText.addEventListener('blur', () => handleAutoFill(elements.exerciseText.value));
        
        // 1RM Real-Time Listeners
        elements.form.weight.addEventListener('input', update1RM);
        elements.form.reps.addEventListener('input', update1RM);

        // --- NEW: Dedicated 1RM Calculator Logic ---
        elements.btnCalculate.addEventListener('click', () => {
            const w = parseFloat(elements.calcWeight.value);
            const r = parseInt(elements.calcReps.value);
            
            if (!w || !r) return showNotification("Please enter weight and reps.", "error");
            
            // Calculate Max
            const max = calculate1RM(w, r);
            
            // Update Main Display
            elements.calcMaxDisplay.textContent = `${max} kg`;
            elements.calcResultsArea.classList.remove('hidden');
            
            // Generate Percentage Table
            const percentages = [95, 90, 85, 80, 75, 70, 65, 60];
            elements.percentageList.innerHTML = percentages.map(pct => {
                const liftedWeight = Math.round(max * (pct / 100));
                let estReps = Math.round(30 * ((max / liftedWeight) - 1));
                if (estReps < 1) estReps = 1;
                
                return `
                    <tr>
                        <td><strong>${pct}%</strong></td>
                        <td>${liftedWeight} kg</td>
                        <td>~${estReps} reps</td>
                    </tr>
                `;
            }).join('');
            
            showNotification("Calculated!", "success");
        });

        // Delete Button
        elements.historyList.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-item-btn')) {
                if (confirm("Delete this single workout entry?")) {
                    const success = await deleteWorkoutFromServer(e.target.dataset.id);
                    if (success) { data = data.filter(item => item.id !== e.target.dataset.id); updateAllUI(); showNotification("Workout deleted.", "info"); }
                }
            }
        });

        // Body Weight Submit
        elements.bwForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const w = parseFloat(elements.bwInput.value);
            const d = elements.bwDate.value || new Date().toISOString().split('T')[0];
            if (!w) return;
            try {
                const id = await addBodyWeightToServer({ weight: w, date: d });
                bwData.push({ id, weight: w, date: d });
                bwData.sort((a,b) => new Date(a.date) - new Date(b.date));
                updateAllUI();
                showNotification("Body weight logged!", "success");
                elements.bwInput.value = '';
            } catch(e) { console.error(e); }
        });

        // Data Management
        elements.exportBtn.addEventListener('click', () => {
            if (!data.length && !bwData.length) return showNotification("No data to export.", "error");
            const exportData = { workouts: data, bodyweight: bwData };
            const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `fittrack-backup.json`; a.click();
        });

        elements.importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    showNotification("Importing...", "info");
                    
                    if (Array.isArray(imported)) {
                        for (const w of imported) await addWorkoutToServer(w);
                    } else {
                        if (imported.workouts) for (const w of imported.workouts) await addWorkoutToServer(w);
                        if (imported.bodyweight) for (const b of imported.bodyweight) await addBodyWeightToServer(b);
                    }
                    await loadDataFromServer();
                    updateAllUI();
                    showNotification("Import successful!");
                } catch (err) { console.error(err); showNotification("Import failed.", "error"); }
            };
            reader.readAsText(file);
        });
        elements.importBtn.addEventListener('click', () => elements.importInput.click());
        elements.clearBtn.addEventListener('click', async () => {
            if (confirm("Delete ALL data (Workouts & Weight)? This cannot be undone.")) {
                await clearAllDataOnServer();
                data = []; bwData = []; updateAllUI();
                showNotification("All data deleted.", "error");
            }
        });

        // Main Workout Submit
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let exerciseName = isCustomInput ? elements.exerciseText.value.trim() : elements.exerciseSelect.value;
            if (isCustomInput && exerciseName) exerciseName = exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1);
            if (!exerciseName) return showNotification("Please select exercise.", "error");

            const newWorkout = {
                exercise: exerciseName,
                reps: parseInt(elements.form.reps.value),
                sets: parseInt(elements.form.sets.value),
                weight: parseFloat(elements.form.weight.value),
                durationMinutes: parseInt(elements.form['duration-minutes'].value) || 0,
                durationSeconds: parseInt(elements.form['duration-seconds'].value) || 0,
                date: new Date().toISOString().split('T')[0]
            };

            if (isNaN(newWorkout.reps) || isNaN(newWorkout.sets) || isNaN(newWorkout.weight)) return showNotification("Check fields.", "error");
            const isNewPR = newWorkout.weight > (prMap[newWorkout.exercise] || 0);

            try {
                const docId = await addWorkoutToServer(newWorkout);
                data.push({ ...newWorkout, id: docId });
                updateAllUI();
                showNotification(isNewPR ? `🏆 New PR!` : "Workout added!");
                
                elements.form.reps.value = ''; elements.form.sets.value = ''; elements.form.weight.value = ''; elements.form['duration-minutes'].value = ''; elements.form['duration-seconds'].value = '';
                update1RM(); // Reset 1RM display
                if (isCustomInput) elements.exerciseText.focus();
                else if (customSelectTrigger) customSelectTrigger.textContent = 'Select an exercise';
            } catch (error) {}
        });

        // Chart Switching
        elements.chartTabs.forEach(tab => tab.addEventListener('click', () => {
            const chartType = tab.dataset.chart;
            if (elements.analyticsExerciseSelect.value === 'All' && chartType === 'weight') return showNotification("Select specific exercise first.", "error");
            document.querySelector('.chart-tab.active')?.classList.remove('active');
            tab.classList.add('active');
            currentChartType = chartType;
            updateChart();
        }));
        elements.analyticsExerciseSelect.addEventListener('change', updateChart);
        
        // Default Date
        elements.bwDate.value = new Date().toISOString().split('T')[0];
    };

    // ==========================================
    // 8. INITIALIZATION
    // ==========================================
    const init = async () => {
        try {
            await signInAnonymously(auth);
            await loadDataFromServer();
        } catch (error) {
            console.error("Init Error:", error);
            showNotification("Connection error.", "error");
        } finally {
            setupCustomDropdown();
            setupEventListeners();
            updateAllUI();
            hideLoader();
        }
    };

    init();
});