import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    const createViewTitle = document.getElementById('create-routine-title');

    const widget = document.getElementById('routine-widget');
    const activeName = document.getElementById('active-routine-name');
    const checklist = document.getElementById('routine-checklist');
    const btnQuit = document.getElementById('btn-quit-routine');

    // State
    let activeRoutine = null;
    let localRoutines = [];
    let editingRoutineId = null; // null = creating new, id = editing existing

    // Listeners
    if (btnOpen) btnOpen.addEventListener('click', () => { modal.classList.remove('hidden'); });
    if (btnClose) btnClose.addEventListener('click', () => { modal.classList.add('hidden'); });
    if (btnNew) btnNew.addEventListener('click', () => {
        editingRoutineId = null;
        if (createViewTitle) createViewTitle.textContent = 'Create Routine';
        btnSave.textContent = 'Save Routine';
        nameInput.value = '';
        listView.classList.add('hidden');
        createView.classList.remove('hidden');
        populateExerciseSelection([]);
    });
    if (btnCancelCreate) btnCancelCreate.addEventListener('click', () => {
        createView.classList.add('hidden');
        listView.classList.remove('hidden');
        editingRoutineId = null;
    });

    if (btnQuit) btnQuit.addEventListener('click', () => {
        widget.classList.add('hidden');
        activeRoutine = null;
    });

    // Helper: Populate Exercises from DOM Select
    // preSelected = array of exercise names to pre-check (for edit mode)
    const populateExerciseSelection = (preSelected = []) => {
        selectionList.innerHTML = '';

        // ── Search box ──
        const searchWrapper = document.createElement('div');
        searchWrapper.style.cssText = 'position:sticky; top:0; background:var(--card-bg); padding:0.5rem 0 0.5rem 0; z-index:10; margin-bottom:0.5rem;';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 Search exercises...';
        searchInput.style.cssText = 'width:100%; padding:0.6rem 1rem; border-radius:12px; border:1px solid var(--card-border); background:var(--input-bg); color:var(--text); font-size:0.9rem;';
        searchWrapper.appendChild(searchInput);
        selectionList.appendChild(searchWrapper);

        const select = document.getElementById('exercise-select');
        if (!select) return;

        const standardExercises = new Set();

        Array.from(select.querySelectorAll('optgroup')).forEach(group => {
            const grpLabel = document.createElement('div');
            grpLabel.className = 'routine-group-label';
            grpLabel.textContent = group.label;
            grpLabel.style.cssText = 'grid-column:1/-1; font-weight:bold; font-size:0.75rem; margin-top:0.5rem; color:var(--accent-end);';
            selectionList.appendChild(grpLabel);

            Array.from(group.querySelectorAll('option')).forEach(opt => {
                standardExercises.add(opt.value);
                const mask = document.createElement('label');
                mask.className = 'selection-item';
                const checked = preSelected.includes(opt.value) ? 'checked' : '';
                mask.innerHTML = `<input type="checkbox" value="${opt.value}" ${checked}> ${opt.textContent}`;
                mask.dataset.name = opt.textContent.toLowerCase();
                selectionList.appendChild(mask);
            });
        });

        // ── Custom Exercises from Pre-selected ──
        const customExercises = preSelected.filter(ex => !standardExercises.has(ex));
        if (customExercises.length > 0) {
            const grpLabel = document.createElement('div');
            grpLabel.className = 'routine-group-label custom-group-label';
            grpLabel.textContent = 'Custom';
            grpLabel.style.cssText = 'grid-column:1/-1; font-weight:bold; font-size:0.75rem; margin-top:0.5rem; color:var(--accent-end);';
            selectionList.appendChild(grpLabel);

            customExercises.forEach(ex => {
                const mask = document.createElement('label');
                mask.className = 'selection-item custom-item';
                mask.innerHTML = `<input type="checkbox" value="${ex}" checked> ${ex}`;
                mask.dataset.name = ex.toLowerCase();
                selectionList.appendChild(mask);
            });
        }

        // Live filter
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase().trim();
            selectionList.querySelectorAll('.selection-item').forEach(item => {
                item.style.display = (!q || item.dataset.name.includes(q)) ? '' : 'none';
            });
            selectionList.querySelectorAll('.routine-group-label').forEach(lbl => {
                // Hide group label if all its items are hidden
                let next = lbl.nextSibling;
                let hasVisible = false;
                while (next && !next.classList?.contains('routine-group-label')) {
                    if (next.classList?.contains('selection-item') && next.style.display !== 'none') hasVisible = true;
                    next = next.nextSibling;
                }
                lbl.style.display = hasVisible ? '' : 'none';
            });
        });

        // ── Hook up the custom exercise input ──
        const customInput = document.getElementById('routine-custom-exercise-input');
        const btnAddCustom = document.getElementById('btn-add-routine-custom-exercise');
        if (customInput && btnAddCustom) {
            // Remove previous event listeners by replacing the element
            const newBtnAddCustom = btnAddCustom.cloneNode(true);
            btnAddCustom.parentNode.replaceChild(newBtnAddCustom, btnAddCustom);
            
            newBtnAddCustom.addEventListener('click', () => {
                const val = customInput.value.trim();
                if (!val) return;
                
                // Add to custom group, create if doesn't exist
                let customGrp = selectionList.querySelector('.custom-group-label');
                if (!customGrp) {
                    customGrp = document.createElement('div');
                    customGrp.className = 'routine-group-label custom-group-label';
                    customGrp.textContent = 'Custom';
                    customGrp.style.cssText = 'grid-column:1/-1; font-weight:bold; font-size:0.75rem; margin-top:0.5rem; color:var(--accent-end);';
                    selectionList.appendChild(customGrp);
                }
                
                const mask = document.createElement('label');
                mask.className = 'selection-item custom-item';
                mask.innerHTML = `<input type="checkbox" value="${val}" checked> ${val}`;
                mask.dataset.name = val.toLowerCase();
                selectionList.appendChild(mask);
                
                customInput.value = ''; // clear input
            });
        }
    };

    // --- LOGIC ---
    const loadRoutinesFromServer = async (uid) => {
        if (!uid) return;
        try {
            // First migrate local -> server if needed
            const stored = localStorage.getItem('gymRoutines');
            if (stored) {
                const parsed = JSON.parse(stored);
                localRoutines = parsed; // Optimistically set local
                if (parsed.length > 0) {
                    await setDoc(doc(db, 'userRoutines', uid), { routines: parsed }, { merge: true });
                }
            }

            const docSnap = await getDoc(doc(db, 'userRoutines', uid));
            if (docSnap.exists() && docSnap.data().routines) {
                localRoutines = docSnap.data().routines;
                localStorage.setItem('gymRoutines', JSON.stringify(localRoutines)); // Keep backup
            }
        } catch (e) {
            console.error("Failed to load routines from server, falling back to local:", e);
            const stored = localStorage.getItem('gymRoutines');
            if (stored) localRoutines = JSON.parse(stored);
        }
        renderList();
    };

    const saveRoutineToServer = async () => {
        renderList();
        if (auth.currentUser) {
            try {
                await setDoc(doc(db, 'userRoutines', auth.currentUser.uid), { routines: localRoutines }, { merge: true });
                localStorage.setItem('gymRoutines', JSON.stringify(localRoutines)); // Keep local sync as backup
            } catch (e) {
                console.error("Failed to save routine:", e);
                // Fallback to local storage if Firestore rules block it or offline
                localStorage.setItem('gymRoutines', JSON.stringify(localRoutines));
            }
        } else {
            // Not logged in fallback
            localStorage.setItem('gymRoutines', JSON.stringify(localRoutines));
        }
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
            div.innerHTML = `
                <div class="routine-card-info" style="flex:1; cursor:pointer;">
                    <strong>${routine.name}</strong>
                    <span style="font-size:0.8rem; opacity:0.7;">${routine.exercises.length} Exercises</span>
                </div>
                <div class="routine-card-actions" style="display:flex; gap:0.4rem; flex-shrink:0;">
                    <button class="btn-edit-routine" data-id="${routine.id}" title="Edit" style="width:auto; padding:0.3rem 0.7rem; font-size:0.8rem; background:var(--input-bg); color:var(--accent-end); border-radius:12px; box-shadow:none; border:1px solid var(--card-border);">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="btn-delete-routine" data-id="${routine.id}" title="Delete" style="width:auto; padding:0.3rem 0.7rem; font-size:0.8rem; background:rgba(255,107,107,0.1); color:var(--danger); border-radius:12px; box-shadow:none; border:1px solid rgba(255,107,107,0.3);">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;

            // Click on name/info area → start routine
            div.querySelector('.routine-card-info').addEventListener('click', () => {
                startRoutine(routine);
                modal.classList.add('hidden');
            });

            // Edit button
            div.querySelector('.btn-edit-routine').addEventListener('click', (e) => {
                e.stopPropagation();
                openEditView(routine);
            });

            // Delete button
            div.querySelector('.btn-delete-routine').addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.showConfirmDialog) {
                    window.showConfirmDialog("Delete Routine?", `Are you sure you want to delete "${routine.name}"?`, () => {
                        localRoutines = localRoutines.filter(r => r.id !== routine.id);
                        saveRoutineToServer();
                        // If the deleted routine was being edited, reset the create view
                        if (editingRoutineId === routine.id) {
                            editingRoutineId = null;
                            nameInput.value = '';
                            if (createViewTitle) createViewTitle.textContent = 'Create Routine';
                            btnSave.textContent = 'Save Routine';
                            createView.classList.add('hidden');
                            listView.classList.remove('hidden');
                        }
                    });
                } else {
                    if (confirm(`Delete "${routine.name}"?`)) {
                        localRoutines = localRoutines.filter(r => r.id !== routine.id);
                        saveRoutineToServer();
                        // If the deleted routine was being edited, reset the create view
                        if (editingRoutineId === routine.id) {
                            editingRoutineId = null;
                            nameInput.value = '';
                            if (createViewTitle) createViewTitle.textContent = 'Create Routine';
                            btnSave.textContent = 'Save Routine';
                            createView.classList.add('hidden');
                            listView.classList.remove('hidden');
                        }
                    }
                }
            });

            listContainer.appendChild(div);
        });
    };

    const openEditView = (routine) => {
        editingRoutineId = routine.id;
        if (createViewTitle) createViewTitle.textContent = 'Edit Routine';
        btnSave.textContent = 'Update Routine';
        nameInput.value = routine.name;
        listView.classList.add('hidden');
        createView.classList.remove('hidden');
        populateExerciseSelection(routine.exercises);
    };

    const startRoutine = (routine) => {
        activeRoutine = { ...routine, progress: [] };
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
            tag.style.cursor = 'pointer';

            tag.addEventListener('click', () => {
                const select = document.getElementById('exercise-select');
                const customInput = document.getElementById('exercise-text');
                const toggleBtn = document.getElementById('toggle-input-btn');
                
                if (select) {
                    const isStandard = Array.from(select.options).some(opt => opt.value === ex);
                    
                    if (isStandard) {
                        // Standard exercise: ensure standard mode is active
                        if (toggleBtn && toggleBtn.classList.contains('active')) {
                            toggleBtn.click();
                        }
                        select.value = ex;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        const trigger = document.querySelector('.custom-select-trigger');
                        if (trigger) trigger.textContent = ex;
                    } else {
                        // Custom exercise: ensure custom mode is active
                        if (toggleBtn && !toggleBtn.classList.contains('active')) {
                            toggleBtn.click();
                        }
                        if (customInput) {
                            customInput.value = ex;
                            // Trigger blur or input events if needed by script.js
                            customInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                    
                    document.querySelector('.card-log-workout').scrollIntoView({ behavior: 'smooth' });
                    tag.style.transform = 'scale(1.1)';
                    setTimeout(() => tag.style.transform = 'scale(1)', 200);
                }
            });

            checklist.appendChild(tag);
        });
    };

    // Save / Update Routine Button
    if (btnSave) btnSave.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) return alert("Enter a name");

        const selected = [];
        selectionList.querySelectorAll('input:checked').forEach(cb => selected.push(cb.value));
        if (selected.length === 0) return alert("Select at least one exercise");

        if (editingRoutineId !== null) {
            // UPDATE existing
            localRoutines = localRoutines.map(r =>
                r.id === editingRoutineId ? { ...r, name, exercises: selected } : r
            );
            editingRoutineId = null;
        } else {
            // CREATE new
            localRoutines.push({ id: Date.now(), name, exercises: selected });
        }

        saveRoutineToServer();

        nameInput.value = '';
        createView.classList.add('hidden');
        listView.classList.remove('hidden');
        if (btnSave) btnSave.textContent = 'Save Routine';
    });

    return {
        loadRoutinesFromServer,
        checkProgress: (exerciseName) => {
            if (!activeRoutine) return false;
            const target = activeRoutine.exercises.find(e => e.toLowerCase() === exerciseName.toLowerCase());
            if (target && !activeRoutine.progress.includes(target)) {
                activeRoutine.progress.push(target);
                renderChecklist();
                if (activeRoutine.progress.length === activeRoutine.exercises.length) {
                    activeRoutine = null;
                    widget.classList.add('hidden');
                    return true;
                }
            }
            return false;
        }
    };
};
