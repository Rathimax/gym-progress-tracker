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
      caloriesBurned: document.getElementById('calories-burned') // New element for calories
  };

  // --- State & Constants ---
  let data = [];
  let prMap = {};
  let prDates = {};
  let currentChartType = 'weight';
  let analyticsChart = null;

  // --- NEW: Calorie Estimation Model ---
  const EXERCISE_INTENSITY_FACTORS = {
      'Push Up': 4.5, 'Chest Press': 4.0, 'Incline Dumbbell Press': 4.0, 'Chest Fly': 2.5,
      'Shoulder Press': 4.0, 'Lateral Raise': 2.5, 'Front Raise': 2.5, 'Rear Delt Fly': 2.5, 'Arnold Press': 4.5,
      'Pull Up': 6.0, 'Barbell Row': 5.0, 'Seated Row': 3.5, 'Lat Pulldown': 3.5, 'Face Pull': 2.5,
      'Squat': 6.0, 'Leg Press': 5.5, 'Lunges': 4.5, 'Leg Curl': 3.0, 'Calf Raise': 2.5,
      'Bicep Curl': 2.5, 'Hammer Curl': 2.5, 'Concentration Curl': 2.0, 'Preacher Curl': 2.0, 'Reverse Curl': 2.5,
      'Tricep Pushdown': 2.5, 'Skull Crushers': 3.0, 'Overhead Tricep Extension': 3.0, 'Dumbbell Tricep Kickback': 2.5, 'Close Grip Bench Press': 4.5,
      'Plank': 3.0, 'Burpees': 9.0, 'Mountain Climbers': 7.0,
      'default': 3.5 // Fallback for unlisted exercises
  };
  
  // --- Core Functions ---
  const saveDataToLocalStorage = () => {
      localStorage.setItem('fitTrackData', JSON.stringify({ workouts: data, prs: prMap, prDates: prDates }));
  };

  const loadDataFromLocalStorage = () => {
      const saved = localStorage.getItem('fitTrackData');
      if (saved) {
          const obj = JSON.parse(saved);
          data = obj.workouts || [];
          prMap = obj.prs || {};
          prDates = obj.prDates || {};
      }
  };

  const showNotification = (msg = "Workout logged successfully!", type = 'success') => {
      elements.notification.textContent = msg;
      elements.notification.className = `notification show ${type}`;
      setTimeout(() => elements.notification.classList.remove('show'), 3000);
  };

  // --- Calorie Calculation ---
  const calculateCalories = (workout) => {
      const intensity = EXERCISE_INTENSITY_FACTORS[workout.exercise] || EXERCISE_INTENSITY_FACTORS['default'];
      let durationInMinutes = (workout.durationMinutes || 0) + ((workout.durationSeconds || 0) / 60);
      if (durationInMinutes === 0) {
          durationInMinutes = (workout.sets || 1) * 1.5; // Assume 1.5 minutes per set if no time is given
      }
      return durationInMinutes * intensity;
  };
  
  // --- UI Update Functions ---
  const updateAllUI = () => {
      updateDataStatus();
      updateStats();
      updateHistory();
      updatePRSection();
      updateAnalyticsDropdown();
      updateChart();
  };

  const updateDataStatus = () => {
      const count = data.length;
      const unique = new Set(data.map(d => d.exercise)).size;
      elements.dataStatus.textContent = `${count} workouts • ${unique} exercises • Stored in browser`;
  };

  const updateStats = () => {
      const totalWorkouts = data.length;
      const totalVolume = data.reduce((sum, w) => sum + (w.reps * w.sets * w.weight), 0);
      const totalDuration = data.reduce((s, w) => s + (w.durationMinutes || 0) * 60 + (w.durationSeconds || 0), 0);
      const totalTime = Math.round(totalDuration / 60);
      const avgSessionTime = totalWorkouts ? Math.round(totalDuration / totalWorkouts / 60) : 0;
      const totalCalories = data.reduce((sum, workout) => sum + calculateCalories(workout), 0);

      elements.totalWorkouts.textContent = totalWorkouts;
      elements.totalVolume.textContent = Math.round(totalVolume);
      elements.totalTime.textContent = `${totalTime}m`;
      elements.avgSession.textContent = `${avgSessionTime}m`;
      elements.caloriesBurned.textContent = Math.round(totalCalories); // Update calorie display
  };

  const updatePRSection = () => {
      if (Object.keys(prMap).length === 0) {
          elements.prList.innerHTML = '<li>No Personal Records set yet.</li>';
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
      elements.historyControls.innerHTML = `
          <label for="history-filter-exercise">Filter by Exercise:</label>
          <select id="history-filter-exercise">
              <option value="">All Exercises</option>
              ${exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('')}
          </select>`;
      document.getElementById('history-filter-exercise').addEventListener('change', updateFilteredHistory);
      updateFilteredHistory();
  };

  const updateFilteredHistory = () => {
      const filter = document.getElementById('history-filter-exercise')?.value || '';
      const filtered = filter ? data.filter(d => d.exercise === filter) : data;
      if (!filtered.length) {
          elements.historyList.innerHTML = '<p style="text-align:center; opacity:0.7;">No entries for this exercise.</p>';
          return;
      }
      const grouped = filtered.reduce((acc, d) => { (acc[d.date] = acc[d.date] || []).push(d); return acc; }, {});
      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
      elements.historyList.innerHTML = sortedDates.map(date => `
          <div class="history-date">
              <h3>${new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <table><thead><tr><th>Exercise</th><th>Reps</th><th>Sets</th><th>Weight (kg)</th><th>Duration</th></tr></thead>
              <tbody>${grouped[date].map(e => `<tr><td>${e.exercise}</td><td>${e.reps}</td><td>${e.sets}</td><td>${e.weight}</td><td>${e.durationMinutes||0}m ${e.durationSeconds||0}s</td></tr>`).join('')}</tbody>
              </table></div>`).join('');
  };

  const updateAnalyticsDropdown = () => {
      const exercises = [...new Set(data.map(d => d.exercise))].sort();
      const currentSelection = elements.analyticsExerciseSelect.value;
      elements.analyticsExerciseSelect.innerHTML = `<option value="All">All Exercises</option>${exercises.map(ex => `<option value="${ex}" ${ex === currentSelection ? 'selected' : ''}>${ex}</option>`).join('')}`;
  };

  // --- Charting Logic ---
  const updateChart = () => {
      if (analyticsChart) analyticsChart.destroy();
      if (data.length === 0) return;

      let selectedExercise = elements.analyticsExerciseSelect.value;
      if (selectedExercise === 'All' && currentChartType !== 'exercises') {
          currentChartType = 'exercises';
          document.querySelector('.chart-tab.active')?.classList.remove('active');
          document.querySelector('.chart-tab[data-chart="exercises"]').classList.add('active');
      }

      const isDarkMode = document.body.classList.contains('dark-mode');
      const colors = {
          accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-start').trim(),
          info: getComputedStyle(document.documentElement).getPropertyValue('--info').trim(),
          text: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
          grid: getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim(),
          doughnutBg: isDarkMode ? '#141518' : '#ffffff',
          average: '#f1c40f',
          palette: ['#1abc9c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e']
      };

      let config = {};
      
      if (currentChartType === 'exercises') {
          const counts = data.reduce((acc, d) => { acc[d.exercise] = (acc[d.exercise] || 0) + 1; return acc; }, {});
          config = {
              type: 'doughnut',
              data: {
                  labels: Object.keys(counts),
                  datasets: [{ data: Object.values(counts), backgroundColor: colors.palette, borderColor: colors.doughnutBg, borderWidth: 4 }]
              },
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.text } } } }
          };
      } else {
          const filteredData = data.filter(d => d.exercise === selectedExercise);
          const sorted = filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
          let historicalBest = 0;
          const processedData = sorted.map((entry, index) => {
              const sessionDate = new Date(entry.date);
              const weekAgo = new Date(new Date(entry.date).setDate(sessionDate.getDate() - 7));
              const workoutsToConsider = sorted.slice(0, index);

              const bestInPast = workoutsToConsider.length ? Math.max(...workoutsToConsider.map(w => w.weight)) : 0;
              historicalBest = Math.max(bestInPast, entry.weight);
              
              const recentWorkouts = workoutsToConsider.filter(d => new Date(d.date) >= weekAgo);
              const avgWeight = recentWorkouts.length ? recentWorkouts.reduce((sum, d) => sum + d.weight, 0) / recentWorkouts.length : 0;
              
              return {
                  date: entry.date,
                  current: entry.weight,
                  best: historicalBest,
                  average: avgWeight,
              };
          });
          
          config = {
              type: 'bar',
              data: {
                  labels: processedData.map(d => d.date),
                  datasets: [
                      { label: 'Current Lift', data: processedData.map(d => d.current), backgroundColor: colors.accent, borderRadius: 4 },
                      { label: 'Personal Best', data: processedData.map(d => d.best), backgroundColor: colors.info, borderRadius: 4 },
                      { label: '7-Day Average', data: processedData.map(d => d.average), backgroundColor: colors.average, borderRadius: 4 }
                  ]
              },
              options: {
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                      x: { type: 'time', time: { unit: 'day' }, ticks: { color: colors.text }, grid: { drawOnChartArea: false } },
                      y: { beginAtZero: true, ticks: { color: colors.text }, grid: { color: colors.grid } }
                  },
                  plugins: { legend: { labels: { color: colors.text } } }
              }
          };
      }
      analyticsChart = new Chart(elements.ctx, config);
  };

  // --- Initialization ---
  const init = () => {
      loadDataFromLocalStorage();

      elements.themeToggle.addEventListener('change', () => { document.body.classList.toggle('dark-mode'); updateChart(); });

      elements.exportBtn.addEventListener('click', () => { if (!data.length) return showNotification("No data to export.", "error"); const blob = new Blob([JSON.stringify({ workouts: data, prs: prMap, prDates: prDates })], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url); showNotification("Data exported successfully!"); });

      elements.importBtn.addEventListener('click', () => elements.importInput.click());
      elements.importInput.addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { try { const d = JSON.parse(e.target.result); if (Array.isArray(d.workouts)) { if (confirm("This will replace all current data. Are you sure?")) { data = d.workouts; prMap = d.prs || {}; prDates = d.prDates || {}; saveDataToLocalStorage(); updateAllUI(); showNotification("Data imported successfully!"); } } else { throw new Error("Invalid file format"); } } catch (err) { showNotification("Import failed. Check file.", "error"); console.error(err); } }; reader.readAsText(file); });

      elements.clearBtn.addEventListener('click', () => { if (confirm("Are you sure you want to delete ALL data? This cannot be undone.")) { data = []; prMap = {}; prDates = {}; saveDataToLocalStorage(); updateAllUI(); showNotification("All data has been cleared.", "error"); } });

      elements.form.addEventListener('submit', e => { e.preventDefault(); const exercise = elements.form.exercise.value, reps = parseInt(elements.form.reps.value), sets = parseInt(elements.form.sets.value), weight = parseFloat(elements.form.weight.value), durationMinutes = parseInt(elements.form['duration-minutes'].value) || 0, durationSeconds = parseInt(elements.form['duration-seconds'].value) || 0; if (!exercise || isNaN(reps) || isNaN(sets) || isNaN(weight)) return showNotification("Please fill all fields correctly.", "error"); const date = new Date().toISOString().split('T')[0]; data.push({ date, exercise, reps, sets, weight, durationMinutes, durationSeconds }); if (!prMap[exercise] || weight > prMap[exercise]) { prMap[exercise] = weight; prDates[exercise] = date; showNotification(`🏆 New PR in ${exercise}!`); } else { showNotification("Workout added!"); } saveDataToLocalStorage(); updateAllUI(); elements.form.reset(); elements.form.exercise.focus(); });

      elements.chartTabs.forEach(tab => tab.addEventListener('click', () => { if (elements.analyticsExerciseSelect.value === 'All' && tab.dataset.chart !== 'exercises') { showNotification("Please select a specific exercise to view this chart.", "error"); return; } document.querySelector('.chart-tab.active')?.classList.remove('active'); tab.classList.add('active'); currentChartType = tab.dataset.chart; updateChart(); }));
      
      elements.analyticsExerciseSelect.addEventListener('change', updateChart);
      
      updateAllUI();
      elements.loader.style.opacity = '0';
      elements.loader.style.visibility = 'hidden';
  };

  init();
});