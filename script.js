// --- Import Firebase functions (with authentication) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// ***** PASTE YOUR FIREBASE CONFIGURATION FROM THE FIREBASE CONSOLE HERE *****
// Make sure to replace the placeholder values with your actual project keys
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // IMPORTANT: Replace with your actual API Key
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Get the auth instance

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const elements = {
        form: document.getElementById('workout-form'),
        historyControls: document.getElementById('history-controls'),
        historyList: document.getElementById('history-list'),
        prList: document.getElementById('pr-list'),
        ctx: document.getElementById('analyticsChart').getContext('2d'),
        themeToggle: document.getElementById('theme-toggle'),
        dataStatus: document.getElementById('data-status'),
        exportBtn: document.getElementById('export-btn'),
        importBtn: document.getElementById('import-btn'),
        importInput: document.getElementById('import-input'),
        clearBtn: document.getElementById('clear-btn'),
        chartTabs: document.querySelectorAll('.chart-tab'),
        loader: document.getElementById('loader'),
        notification: document.getElementById('notification'),
        analyticsExerciseSelect: document.getElementById('analytics-exercise-select'),
        totalWorkouts: document.getElementById('total-workouts'),
        totalVolume: document.getElementById('total-volume'),
        totalTime: document.getElementById('total-time'),
        avgSession: document.getElementById('avg-session'),
        caloriesBurned: document.getElementById('calories-burned')
    };

    // --- State & Constants ---
    let data = [];
    let prMap = {};
    let prDates = {};
    let currentChartType = 'weight';
    let analyticsChart = null;
    const EXERCISE_INTENSITY_FACTORS = { 'Push Up': 4.5, 'Chest Press': 4.0, 'Incline Dumbbell Press': 4.0, 'Chest Fly': 2.5, 'Shoulder Press': 4.0, 'Lateral Raise': 2.5, 'Front Raise': 2.5, 'Rear Delt Fly': 2.5, 'Arnold Press': 4.5, 'Pull Up': 6.0, 'Barbell Row': 5.0, 'Seated Row': 3.5, 'Lat Pulldown': 3.5, 'Face Pull': 2.5, 'Squat': 6.0, 'Leg Press': 5.5, 'Lunges': 4.5, 'Leg Curl': 3.0, 'Calf Raise': 2.5, 'Bicep Curl': 2.5, 'Hammer Curl': 2.5, 'Concentration Curl': 2.0, 'Preacher Curl': 2.0, 'Reverse Curl': 2.5, 'Tricep Pushdown': 2.5, 'Skull Crushers': 3.0, 'Overhead Tricep Extension': 3.0, 'Dumbbell Tricep Kickback': 2.5, 'Close Grip Bench Press': 4.5, 'Plank': 3.0, 'Burpees': 9.0, 'Mountain Climbers': 7.0, 'default': 3.5 };

    // --- Helper Functions ---
    const showNotification = (msg, type = 'success') => { elements.notification.textContent = msg; elements.notification.className = `notification show ${type}`; setTimeout(() => elements.notification.classList.remove('show'), 3000); };
    const hideLoader = () => { elements.loader.style.opacity = '0'; setTimeout(() => elements.loader.style.visibility = 'hidden', 500); };

    // --- Server Functions (Firebase) ---
    const addWorkoutToServer = async (workout) => { try { await addDoc(collection(db, "workouts"), workout); } catch (e) { console.error("Error adding document: ", e); showNotification("Failed to save workout.", "error"); } };
    const loadDataFromServer = async () => { try { const q = query(collection(db, "workouts"), orderBy("date")); const querySnapshot = await getDocs(q); data = []; querySnapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() })); } catch (e) { console.error("Error fetching data: ", e); showNotification("Could not load data from server.", "error"); throw e; } };
    const clearAllDataOnServer = async () => { showNotification("Deleting all data...", "info"); for (const workout of data) { await deleteDoc(doc(db, "workouts", workout.id)); } };

    // --- Core Functions ---
    const calculateCalories = (workout) => { const intensity = EXERCISE_INTENSITY_FACTORS[workout.exercise] || EXERCISE_INTENSITY_FACTORS['default']; let duration = (workout.durationMinutes || 0) + ((workout.durationSeconds || 0) / 60); if (duration === 0) duration = (workout.sets || 1) * 1.5; return duration * intensity; };
    
    // --- UI Update Functions ---
    const updateAllUI = () => { calculatePRs(); updateDataStatus(); updateStats(); updateHistory(); updatePRSection(); updateAnalyticsDropdown(); updateChart(); };
    const calculatePRs = () => { prMap = {}; prDates = {}; data.forEach(w => { if (w.weight && (!prMap[w.exercise] || w.weight > prMap[w.exercise])) { prMap[w.exercise] = w.weight; prDates[w.exercise] = w.date; } }); };
    const updateDataStatus = () => { elements.dataStatus.textContent = `${data.length} workouts • ${new Set(data.map(d => d.exercise)).size} exercises • Synced`; };
    const updateStats = () => { elements.totalWorkouts.textContent = data.length; elements.totalVolume.textContent = Math.round(data.reduce((s, w) => s + (w.reps || 0) * (w.sets || 0) * (w.weight || 0), 0)); const totalMins = Math.round(data.reduce((s, w) => s + (w.durationMinutes || 0) * 60 + (w.durationSeconds || 0), 0) / 60); elements.totalTime.textContent = `${totalMins}m`; elements.avgSession.textContent = `${data.length ? Math.round(totalMins / data.length) : 0}m`; elements.caloriesBurned.textContent = Math.round(data.reduce((s, w) => s + calculateCalories(w), 0)); };
    const updatePRSection = () => { if (Object.keys(prMap).length === 0) { elements.prList.innerHTML = '<li>Log a workout to see your Personal Records.</li>'; return; } elements.prList.innerHTML = Object.entries(prMap).sort(([exA], [exB]) => exA.localeCompare(exB)).map(([ex, wt]) => { const date = prDates[ex] ? new Date(prDates[ex]).toLocaleDateString() : 'N/A'; return `<li><strong>${ex}</strong><span>${wt} kg <em>(${date})</em></span></li>`; }).join(''); };
    const updateHistory = () => { if (data.length === 0) { elements.historyControls.innerHTML = ''; elements.historyList.innerHTML = '<p style="text-align:center; opacity:0.7;">No workouts logged yet.</p>'; return; } const exercises = [...new Set(data.map(d => d.exercise))].sort(); elements.historyControls.innerHTML = ` <label for="history-filter-exercise">Filter by Exercise:</label> <select id="history-filter-exercise"> <option value="">All Exercises</option> ${exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('')} </select>`; document.getElementById('history-filter-exercise').addEventListener('change', updateFilteredHistory); updateFilteredHistory(); };
    const updateFilteredHistory = () => { const filter = document.getElementById('history-filter-exercise')?.value || ''; const filtered = filter ? data.filter(d => d.exercise === filter) : data; if (!filtered.length) { elements.historyList.innerHTML = '<p style="text-align:center; opacity:0.7;">No entries for this exercise.</p>'; return; } const grouped = filtered.reduce((acc, d) => { const dateStr = d.date.split('T')[0]; (acc[dateStr] = acc[dateStr] || []).push(d); return acc; }, {}); const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)); elements.historyList.innerHTML = sortedDates.map(date => ` <div class="history-date"> <h3>${new Date(date).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</h3> <table><thead><tr><th>Exercise</th><th>Reps</th><th>Sets</th><th>Weight (kg)</th><th>Duration</th></tr></thead> <tbody>${grouped[date].map(e => `<tr><td>${e.exercise}</td><td>${e.reps}</td><td>${e.sets}</td><td>${e.weight}</td><td>${e.durationMinutes||0}m ${e.durationSeconds||0}s</td></tr>`).join('')}</tbody> </table></div>`).join(''); };
    const updateAnalyticsDropdown = () => { const exercises = [...new Set(data.map(d => d.exercise))].sort(); const currentSelection = elements.analyticsExerciseSelect.value; elements.analyticsExerciseSelect.innerHTML = `<option value="All">All Exercises</option>${exercises.map(ex => `<option value="${ex}" ${ex === currentSelection ? 'selected' : ''}>${ex}</option>`).join('')}`; };

    const updateChart = () => {
        if (analyticsChart) analyticsChart.destroy();
        if (data.length === 0) return;
        let selectedExercise = elements.analyticsExerciseSelect.value;
        if (selectedExercise === 'All' && !['exercises', 'volume', 'duration'].includes(currentChartType)) { currentChartType = 'exercises'; document.querySelector('.chart-tab.active')?.classList.remove('active'); document.querySelector('.chart-tab[data-chart="exercises"]').classList.add('active'); }
        const colors = { accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-start').trim(), info: getComputedStyle(document.documentElement).getPropertyValue('--info').trim(), text: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(), grid: getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim(), doughnutBg: document.body.classList.contains('dark-mode') ? '#141518' : '#ffffff', average: '#f1c40f', palette: ['#1abc9c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e'] };
        let config = {};
        if (currentChartType === 'exercises') {
            const counts = data.reduce((acc, d) => { acc[d.exercise] = (acc[d.exercise] || 0) + 1; return acc; }, {});
            config = { type: 'doughnut', data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: colors.palette, borderColor: colors.doughnutBg, borderWidth: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text } } } } };
        } else if (currentChartType === 'weight' && selectedExercise !== 'All') {
            const sorted = data.filter(d => d.exercise === selectedExercise).sort((a, b) => new Date(a.date) - new Date(b.date));
            const processedData = sorted.map((currentEntry, index) => { const pastWorkouts = sorted.slice(0, index + 1); const bestSoFar = Math.max(...pastWorkouts.map(w => w.weight || 0)); return { date: currentEntry.date, current: currentEntry.weight, best: bestSoFar }; });
            config = { type: 'line', data: { labels: processedData.map(d => d.date), datasets: [{ label: 'Weight Lifted (kg)', data: processedData.map(d => d.current), backgroundColor: colors.accent, borderColor: colors.accent, fill: false, tension: 0.1 }, { label: 'Personal Best', data: processedData.map(d => d.best), backgroundColor: colors.info, borderColor: colors.info, fill: false, tension: 0.1, pointRadius: 0, borderDash: [5, 5] }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } }, y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } } }, plugins: { legend: { labels: { color: colors.text } } } } };
        } else {
            const filteredData = data.filter(d => selectedExercise === 'All' || d.exercise === selectedExercise);
            const groupedByDate = filteredData.reduce((acc, d) => { const date = d.date.split('T')[0]; acc[date] = acc[date] || []; acc[date].push(d); return acc; }, {});
            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
            let chartData, label, barColor;
            if (currentChartType === 'volume') { label = 'Total Volume (kg)'; chartData = sortedDates.map(date => groupedByDate[date].reduce((sum, d) => sum + (d.reps || 0) * (d.sets || 0) * (d.weight || 0), 0)); barColor = colors.info; } 
            else { label = 'Total Duration (min)'; chartData = sortedDates.map(date => groupedByDate[date].reduce((sum, d) => sum + (d.durationMinutes || 0) + (d.durationSeconds || 0) / 60, 0)); barColor = '#9b59b6'; }
            config = { type: 'bar', data: { labels: sortedDates, datasets: [{ label, data: chartData, backgroundColor: barColor, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } }, y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } } }, plugins: { legend: { labels: { color: colors.text } } } } };
        }
        analyticsChart = new Chart(elements.ctx, config);
    };
    
    // --- Initialization ---
    const init = async () => {
        try {
            await signInAnonymously(auth); // Sign in first
            await loadDataFromServer(); // Then load data
        } catch (error) {
            console.error("Authentication or data loading failed:", error);
            showNotification("Could not connect to the server.", "error");
        } finally {
            setupEventListeners();
            updateAllUI();
            hideLoader(); // Hide loader regardless of success or failure
        }
    };
    
    const setupEventListeners = () => {
        elements.themeToggle.addEventListener('change', () => { document.body.classList.toggle('dark-mode'); updateChart(); });
        elements.exportBtn.addEventListener('click', () => { if (!data.length) return showNotification("No data to export.", "error"); const blob = new Blob([JSON.stringify(data.map(({id, ...rest}) => rest))], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); showNotification("Data exported successfully!"); });
        elements.clearBtn.addEventListener('click', async () => { if (confirm("Are you sure you want to DELETE all workout data permanently? This cannot be undone.")) { await clearAllDataOnServer(); data = []; updateAllUI(); showNotification("All data has been deleted.", "error"); } });
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newWorkout = { exercise: elements.form.exercise.value, reps: parseInt(elements.form.reps.value), sets: parseInt(elements.form.sets.value), weight: parseFloat(elements.form.weight.value), durationMinutes: parseInt(elements.form['duration-minutes'].value) || 0, durationSeconds: parseInt(elements.form['duration-seconds'].value) || 0, date: new Date().toISOString().split('T')[0] };
            if (!newWorkout.exercise || isNaN(newWorkout.reps) || isNaN(newWorkout.sets) || isNaN(newWorkout.weight)) return showNotification("Please fill all required fields.", "error");
            
            const isNewPR = newWorkout.weight > (prMap[newWorkout.exercise] || 0);
            await addWorkoutToServer(newWorkout); // Save to server first
            
            data.push(newWorkout); // Then update local state
            updateAllUI();
            
            showNotification(isNewPR ? `🏆 New PR in ${newWorkout.exercise}!` : "Workout added!");
            elements.form.reset();
            elements.form.exercise.focus();
        });
        
        elements.chartTabs.forEach(tab => tab.addEventListener('click', () => { if (elements.analyticsExerciseSelect.value === 'All' && tab.dataset.chart === 'weight') { showNotification("Please select a specific exercise to view weight progress.", "error"); return; } document.querySelector('.chart-tab.active')?.classList.remove('active'); tab.classList.add('active'); currentChartType = tab.dataset.chart; updateChart(); }));
        elements.analyticsExerciseSelect.addEventListener('change', updateChart);
    };

    init();
});