export const initRoutines = (app, db, auth, elements) => {
    console.log("Routines Module Initialized");

    // Elements
    const modal = document.getElementById('modal-routines');
    const btnOpen = document.getElementById('btn-open-routines');
    const btnClose = document.getElementById('close-routines-modal');
    const listView = document.getElementById('routines-list-view');
    const createView = document.getElementById('create-routine-view');
    const btnNew = document.getElementById('btn-new-routine');
    const btnSave = document.getElementById('btn-save-routine');
    const btnCancelCreate = document.getElementById('btn-cancel-create');
    const listContainer = document.getElementById('saved-routines-list');
    const selectionList = document.getElementById('exercise-selection-list');
    const nameInput = document.getElementById('new-routine-name');

    const widget = document.getElementById('routine-widget');
    const activeName = document.getElementById('active-routine-name');
    const checklist = document.getElementById('routine-checklist');
    const btnQuit = document.getElementById('btn-quit-routine');

    // State
    let activeRoutine = null;
    let localRoutines = []; // Cache

    // TODO: Load Routines from Firebase

    // Listeners
    if (btnOpen) btnOpen.addEventListener('click', () => { modal.classList.remove('hidden'); });
    if (btnClose) btnClose.addEventListener('click', () => { modal.classList.add('hidden'); });
    if (btnNew) btnNew.addEventListener('click', () => {
        listView.classList.add('hidden');
        createView.classList.remove('hidden');
        populateExerciseSelection();
    });
    if (btnCancelCreate) btnCancelCreate.addEventListener('click', () => {
        createView.classList.add('hidden');
        listView.classList.remove('hidden');
    });

    if (btnQuit) btnQuit.addEventListener('click', () => {
        widget.classList.add('hidden');
        activeRoutine = null;
    });

    // Helper: Populate Exercises from DOM Select
    const populateExerciseSelection = () => {
        selectionList.innerHTML = '';
        const select = document.getElementById('exercise-select');
        if (!select) return;

        Array.from(select.querySelectorAll('optgroup')).forEach(group => {
            const grpLabel = document.createElement('div');
            grpLabel.textContent = group.label;
            grpLabel.style.gridColumn = "1 / -1";
            grpLabel.style.fontWeight = "bold";
            grpLabel.style.fontSize = "0.75rem";
            grpLabel.style.marginTop = "0.5rem";
            grpLabel.style.color = "var(--accent-end)";
            selectionList.appendChild(grpLabel);

            Array.from(group.querySelectorAll('option')).forEach(opt => {
                const mask = document.createElement('label');
                mask.className = 'selection-item';
                mask.innerHTML = `<input type="checkbox" value="${opt.value}"> ${opt.textContent}`;
                selectionList.appendChild(mask);
            });
        });
    };

    // --- LOGIC ---
    const loadRoutines = () => {
        try {
            const stored = localStorage.getItem('gymRoutines');
            if (stored) localRoutines = JSON.parse(stored);
        } catch (e) { localRoutines = []; }
        renderList();
    };

    const saveRoutineToStorage = () => {
        localStorage.setItem('gymRoutines', JSON.stringify(localRoutines));
        renderList();
    };

    const renderList = () => {
        listContainer.innerHTML = '';
        if (localRoutines.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; opacity:0.6; font-size:0.9rem;">No saved routines.</p>';
            return;
        }
        localRoutines.forEach(routine => {
            const div = document.createElement('div');
            div.className = 'routine-card-item';
            div.innerHTML = `<strong>${routine.name}</strong> <span style="font-size:0.8rem; opacity:0.7;">${routine.exercises.length} Exercises</span>`;
            div.addEventListener('click', () => {
                startRoutine(routine);
                modal.classList.add('hidden');
            });

            // Delete support
            // (Simpler to just click to load for now, maybe add delete btn later)
            listContainer.appendChild(div);
        });
    };

    const startRoutine = (routine) => {
        activeRoutine = { ...routine, progress: [] }; // progress tracks completed exercises
        widget.classList.remove('hidden');
        activeName.textContent = routine.name;
        renderChecklist();
    };

    const renderChecklist = () => {
        checklist.innerHTML = '';
        if (!activeRoutine) return;
        activeRoutine.exercises.forEach(ex => {
            const isDone = activeRoutine.progress.includes(ex);
            const tag = document.createElement('div');
            tag.className = `checklist-item ${isDone ? 'done' : ''}`;
            tag.textContent = ex;
            tag.style.cursor = 'pointer'; // Make it look clickable

            // Interaction: Click to load into form
            tag.addEventListener('click', () => {
                const select = document.getElementById('exercise-select');
                if (select) {
                    select.value = ex;
                    // Trigger change for script.js listeners (auto-fill weight/reps)
                    select.dispatchEvent(new Event('change', { bubbles: true }));

                    // Update Custom Dropdown UI if present
                    const trigger = document.querySelector('.custom-select-trigger');
                    if (trigger) trigger.textContent = ex;

                    // Scroll to form
                    document.querySelector('.card-log-workout').scrollIntoView({ behavior: 'smooth' });

                    // Highlight the tag momentarily
                    tag.style.transform = 'scale(1.1)';
                    setTimeout(() => tag.style.transform = 'scale(1)', 200);
                }
            });

            checklist.appendChild(tag);
        });

        // Auto-quit if all done?
        if (activeRoutine.progress.length === activeRoutine.exercises.length && activeRoutine.exercises.length > 0) {
            // Optional: Celebration
        }
    };

    // Save Routine Button
    if (btnSave) btnSave.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return alert("Enter a name");

        const selected = [];
        selectionList.querySelectorAll('input:checked').forEach(cb => selected.push(cb.value));

        if (selected.length === 0) return alert("Select at least one exercise");

        localRoutines.push({ id: Date.now(), name, exercises: selected });
        saveRoutineToStorage();

        // Reset and Go Back
        nameInput.value = '';
        createView.classList.add('hidden');
        listView.classList.remove('hidden');
    });

    // Init Load
    loadRoutines();

    // Exported method to check progress (called primarily from script.js)
    return {
        checkProgress: (exerciseName) => {
            if (!activeRoutine) return false;
            // Normalize
            const target = activeRoutine.exercises.find(e => e.toLowerCase() === exerciseName.toLowerCase());
            if (target && !activeRoutine.progress.includes(target)) {
                activeRoutine.progress.push(target);
                renderChecklist();

                // Check Completion
                if (activeRoutine.progress.length === activeRoutine.exercises.length) {
                    activeRoutine = null;
                    widget.classList.add('hidden');
                    return true; // Routine Completed
                }
            }
            return false;
        }
    };
};
