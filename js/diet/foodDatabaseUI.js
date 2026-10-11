import { FOOD_DATABASE, FOOD_CATEGORIES, calculateFoodNutrients } from '../data/foodDatabase.js';

export function initFoodDatabase({ db, auth, dietService, gamificationModule, showNotification, checkDietGamificationAsync }) {
    console.log("Food Database UI Initialized with", FOOD_DATABASE.length, "foods");

    // Containers & Elements
    const searchInput = document.getElementById('food-db-search');
    const clearSearchBtn = document.getElementById('food-db-search-clear');
    const categoriesContainer = document.getElementById('food-db-categories');
    const foodListContainer = document.getElementById('food-db-grid');
    const resultsCountEl = document.getElementById('food-db-count');
    const emptyStateEl = document.getElementById('food-db-empty');
    const liveIndicatorEl = document.getElementById('food-db-live-indicator');

    // Portion Modal Elements
    const modal = document.getElementById('modal-food-db-portion');
    const modalCloseBtn = document.getElementById('btn-close-food-db-modal');
    const modalCancelBtn = document.getElementById('btn-cancel-food-db-modal');
    const modalConfirmBtn = document.getElementById('btn-confirm-food-db-modal');
    const modalTitle = document.getElementById('food-db-modal-title');
    const modalSubtitle = document.getElementById('food-db-modal-subtitle');
    const modalStateBadge = document.getElementById('food-db-modal-state');
    const modalUnitsList = document.getElementById('food-db-modal-units');
    const modalQtyInput = document.getElementById('food-db-modal-qty');
    const modalBtnMinus = document.getElementById('btn-food-db-minus');
    const modalBtnPlus = document.getElementById('btn-food-db-plus');
    const modalQuickGrams = document.getElementById('food-db-quick-grams');
    const modalCalories = document.getElementById('food-db-modal-calories');
    const modalCaloriesHeader = document.getElementById('food-db-modal-calories-header');
    const modalMacroHeaderTitle = document.getElementById('food-db-macro-header-title');
    const modalProtein = document.getElementById('food-db-modal-protein');
    const modalCarbs = document.getElementById('food-db-modal-carbs');
    const modalFat = document.getElementById('food-db-modal-fat');
    const modalGramsLabel = document.getElementById('food-db-modal-grams-label');
    const modalMealPills = document.querySelectorAll('#modal-food-db-portion .lm-pill');

    // Delegated click listener on food grid (one efficient listener instead of 77 individual listeners)
    if (foodListContainer) {
        foodListContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.food-db-card:not(.food-db-skeleton)');
            if (!card) return;
            const foodId = card.dataset.foodId;
            const food = findFoodById(foodId);
            if (food) openPortionModal(food);
        });
    }

    // Local Storage Cache for Global Database Items
    function loadCachedGlobalFoods() {
        try {
            const raw = localStorage.getItem('gym_cached_global_foods');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCachedGlobalFood(food) {
        if (!food || !food.id) return;
        try {
            let list = loadCachedGlobalFoods();
            list = list.filter(f => f.id !== food.id && f.name.toLowerCase() !== food.name.toLowerCase());
            list.unshift(food);
            if (list.length > 80) list = list.slice(0, 80);
            localStorage.setItem('gym_cached_global_foods', JSON.stringify(list));
            cachedGlobalFoods = list;
        } catch (e) {
            console.warn("Could not save cached global food:", e);
        }
    }

    // State
    let currentCategory = 'all';
    let currentSearchQuery = '';
    let selectedFood = null;
    let selectedUnitId = null;
    let currentQuantity = 1;
    let selectedMealType = getDefaultMealType();

    let cachedGlobalFoods = loadCachedGlobalFoods();
    let liveGlobalFoods = [];
    let isFetchingGlobal = false;
    let globalSearchAbortController = null;

    function findFoodById(foodId) {
        return FOOD_DATABASE.find(f => f.id === foodId) ||
            liveGlobalFoods.find(f => f.id === foodId) ||
            cachedGlobalFoods.find(f => f.id === foodId);
    }

    function getDefaultMealType() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Breakfast';
        if (hour >= 11 && hour < 16) return 'Lunch';
        if (hour >= 16 && hour < 19) return 'Snack';
        return 'Dinner';
    }

    // Initialize Category Filters
    function renderCategories() {
        if (!categoriesContainer) return;
        categoriesContainer.innerHTML = FOOD_CATEGORIES.map(cat => `
            <button type="button" class="food-db-cat-pill ${cat.id === currentCategory ? 'active' : ''}" data-cat="${cat.id}">
                <i class="${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>
        `).join('');

        categoriesContainer.querySelectorAll('.food-db-cat-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                categoriesContainer.querySelectorAll('.food-db-cat-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.cat;
                if (currentCategory === 'global' && liveGlobalFoods.length === 0 && !currentSearchQuery) {
                    // Pre-fetch a popular sample of global foods if empty
                    performGlobalFoodSearch('protein');
                }
                renderFoodList();
            });
        });
    }

    // Filter Foods combining Local, Cached, and Live Global Results
    function getFilteredFoods() {
        const query = currentSearchQuery.trim().toLowerCase();
        let pool = [];

        if (currentCategory === 'global') {
            pool = [...liveGlobalFoods];
            cachedGlobalFoods.forEach(cf => {
                if (!pool.some(p => p.id === cf.id || p.name.toLowerCase() === cf.name.toLowerCase())) {
                    pool.push(cf);
                }
            });
        } else if (currentCategory === 'all') {
            pool = [...FOOD_DATABASE];
            if (query) {
                // When actively searching, append matching live global search results
                liveGlobalFoods.forEach(gf => {
                    if (!pool.some(p => p.id === gf.id || p.name.toLowerCase() === gf.name.toLowerCase())) {
                        pool.push(gf);
                    }
                });
                // And matching cached global foods
                cachedGlobalFoods.forEach(cf => {
                    if (!pool.some(p => p.id === cf.id || p.name.toLowerCase() === cf.name.toLowerCase())) {
                        pool.push(cf);
                    }
                });
            }
        } else {
            pool = FOOD_DATABASE.filter(food => food.category === currentCategory);
        }

        if (!query) {
            return pool;
        }

        return pool.filter(food => {
            const nameMatch = (food.name || '').toLowerCase().includes(query);
            const termsMatch = (food.searchTerms || '').toLowerCase().includes(query);
            const descMatch = (food.description || '').toLowerCase().includes(query);
            const brandMatch = (food.brand || '').toLowerCase().includes(query);
            return nameMatch || termsMatch || descMatch || brandMatch;
        });
    }

    // Skeleton Cards Placeholder Generator
    function renderSkeletonCards(count = 6) {
        const cardHtml = `
            <div class="food-db-card food-db-skeleton" aria-hidden="true">
                <div class="food-card-top-section">
                    <div class="food-card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div class="food-db-skel" style="width: 58%; height: 17px;"></div>
                        <div class="food-db-skel" style="width: 55px; height: 18px; border-radius: 99px;"></div>
                    </div>
                    <div class="food-db-skel" style="width: 35%; height: 11px; margin-top: 0.55rem;"></div>
                </div>

                <div class="food-card-macros" style="justify-content: space-around; padding: 0.75rem 0;">
                    <div class="food-macro-item" style="gap: 5px; align-items: center;">
                        <div class="food-db-skel" style="width: 32px; height: 16px;"></div>
                        <div class="food-db-skel" style="width: 24px; height: 10px;"></div>
                    </div>
                    <div class="food-macro-item" style="gap: 5px; align-items: center;">
                        <div class="food-db-skel" style="width: 32px; height: 16px;"></div>
                        <div class="food-db-skel" style="width: 24px; height: 10px;"></div>
                    </div>
                    <div class="food-macro-item" style="gap: 5px; align-items: center;">
                        <div class="food-db-skel" style="width: 32px; height: 16px;"></div>
                        <div class="food-db-skel" style="width: 24px; height: 10px;"></div>
                    </div>
                    <div class="food-macro-item" style="gap: 5px; align-items: center;">
                        <div class="food-db-skel" style="width: 32px; height: 16px;"></div>
                        <div class="food-db-skel" style="width: 24px; height: 10px;"></div>
                    </div>
                </div>

                <div class="food-card-action">
                    <div class="food-db-skel" style="width: 100%; height: 35px; border-radius: 11px;"></div>
                </div>
            </div>
        `;
        return Array(count).fill(cardHtml).join('');
    }

    // Cached macro SVGs for performance
    const ICON_CALORIES = '<svg viewBox="0 0 24 24" width="12" height="12" fill="#f59e0b" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    const ICON_PROTEIN = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    const ICON_CARBS = '<svg viewBox="0 0 24 24" width="12" height="12" fill="#a855f7" stroke="#a855f7" stroke-width="0.5" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1 4.94 0Z"/></svg>';
    const ICON_FAT = '<svg viewBox="0 0 24 24" width="12" height="12" fill="#ec4899" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';

    // Batch chunking configuration for smooth 60fps mobile rendering
    const PAGE_CHUNK = 24;
    let visibleLimit = PAGE_CHUNK;
    let gridObserver = null;

    function renderFoodCardHtml(food) {
        const defaultUnit = food.servingUnits.find(u => u.isDefault) || food.servingUnits[0];
        const defaultNutrients = calculateFoodNutrients(food, defaultUnit.defaultQty || 1, defaultUnit.id);

        let stateClass = 'cooked';
        let stateIcon = 'ri-fire-fill';
        if (food.state === 'Raw') {
            stateClass = 'raw';
            stateIcon = 'ri-leaf-line';
        } else if (food.state === 'Packaged' || food.source === 'Open Food Facts') {
            stateClass = 'packaged';
            stateIcon = 'ri-barcode-line';
        } else if (food.state === 'Whole Food' || food.source === 'USDA') {
            stateClass = 'whole-food';
            stateIcon = 'ri-seedling-line';
        } else if (food.category === 'global') {
            stateClass = 'global';
            stateIcon = 'ri-global-line';
        }

        const stateLabel = food.brand || food.source || food.state || 'Item';

        return `
            <div class="food-db-card" data-food-id="${food.id}">
                <div class="food-card-top-section">
                    <div class="food-card-header">
                        <h4 class="food-card-name" title="${food.name}">${food.name}</h4>
                        <span class="food-state-badge ${stateClass}" data-state="${food.state}">
                            <i class="${stateIcon}"></i> ${stateLabel}
                        </span>
                    </div>
                    <div class="food-card-weight">(${defaultNutrients.servingLabel})</div>
                </div>

                <div class="food-card-macros">
                    <div class="food-macro-item">
                        <span class="food-macro-val" style="color: #f59e0b;">${ICON_CALORIES}${defaultNutrients.calories}</span>
                        <span class="food-macro-lbl">kcal</span>
                    </div>
                    <div class="food-macro-item">
                        <span class="food-macro-val" style="color: #2563eb;">${ICON_PROTEIN}${defaultNutrients.protein}g</span>
                        <span class="food-macro-lbl">Protein</span>
                    </div>
                    <div class="food-macro-item">
                        <span class="food-macro-val" style="color: #a855f7;">${ICON_CARBS}${defaultNutrients.carbs}g</span>
                        <span class="food-macro-lbl">Carbs</span>
                    </div>
                    <div class="food-macro-item">
                        <span class="food-macro-val" style="color: #ec4899;">${ICON_FAT}${defaultNutrients.fat}g</span>
                        <span class="food-macro-lbl">Fat</span>
                    </div>
                </div>

                <div class="food-card-action">
                    <button type="button" class="btn-primary btn-select-food" data-food-id="${food.id}">
                        <i class="ri-add-circle-line"></i> Select & Adjust
                    </button>
                </div>
            </div>
        `;
    }

    // Render Food Cards with Progressive Batching
    function renderFoodList(resetLimit = true) {
        if (!foodListContainer) return;

        if (resetLimit) {
            visibleLimit = PAGE_CHUNK;
        }

        if (gridObserver) {
            gridObserver.disconnect();
            gridObserver = null;
        }

        const filtered = getFilteredFoods();

        // Case 1: Actively fetching from global database and no local results available yet -> SHOW SKELETON SCREEN
        if (filtered.length === 0 && isFetchingGlobal) {
            foodListContainer.style.display = 'grid';
            if (emptyStateEl) emptyStateEl.style.display = 'none';
            if (resultsCountEl) {
                resultsCountEl.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Searching global database...`;
            }
            foodListContainer.innerHTML = renderSkeletonCards(6);
            return;
        }

        // Case 2: No results found anywhere (after search completes or local 0)
        if (filtered.length === 0) {
            foodListContainer.style.display = 'none';
            if (emptyStateEl) {
                emptyStateEl.style.display = 'flex';
                emptyStateEl.innerHTML = `
                    <i class="ri-search-eye-line"></i>
                    <h3>No matching food found</h3>
                    <p>Try another search or enter custom calories in Manual Entry.</p>
                    <button type="button" class="btn-primary" style="width: auto; padding: 0.5rem 1.25rem; font-size: 0.85rem;" onclick="document.querySelector('.add-meal-toggle-btn[data-subview=\\'manual\\']')?.click()">
                        Switch to Manual Entry
                    </button>
                `;
            }
            if (resultsCountEl) {
                resultsCountEl.textContent = '0 foods found';
            }
            return;
        }

        // Case 3: We have matching foods to display
        foodListContainer.style.display = 'grid';
        if (emptyStateEl) emptyStateEl.style.display = 'none';

        if (resultsCountEl) {
            if (currentSearchQuery.trim()) {
                resultsCountEl.textContent = `${filtered.length} food${filtered.length === 1 ? '' : 's'} found`;
            } else if (currentCategory === 'global') {
                resultsCountEl.textContent = `Global Database (${filtered.length} loaded)`;
            } else {
                resultsCountEl.textContent = `${FOOD_DATABASE.length} curated foods + Global Search ready`;
            }
        }

        const visibleItems = filtered.slice(0, visibleLimit);
        let cardsHtml = visibleItems.map(renderFoodCardHtml).join('');

        // If actively fetching more global items while some local items exist, append subtle skeletons at end
        if (isFetchingGlobal) {
            cardsHtml += renderSkeletonCards(2);
        }

        const hasMore = visibleLimit < filtered.length;
        if (hasMore) {
            cardsHtml += `
                <div id="food-db-sentinel" style="grid-column: 1 / -1; height: 38px; display: flex; align-items: center; justify-content: center; opacity: 0.65; font-size: 0.78rem;">
                    <i class="ri-loader-4-line ri-spin" style="margin-right: 6px;"></i> Loading more foods...
                </div>
            `;
        }

        foodListContainer.innerHTML = cardsHtml;

        // Auto-observe sentinel for progressive lazy-loading next batch without frame drops
        if (hasMore) {
            const sentinel = document.getElementById('food-db-sentinel');
            if (sentinel && 'IntersectionObserver' in window) {
                gridObserver = new IntersectionObserver((entries) => {
                    if (entries[0] && entries[0].isIntersecting) {
                        gridObserver.disconnect();
                        visibleLimit += PAGE_CHUNK;
                        renderFoodList(false);
                    }
                }, { rootMargin: '250px' });
                gridObserver.observe(sentinel);
            }
        }
    }

    // Async Search function for Public Global Foods
    async function performGlobalFoodSearch(query) {
        const cleanQ = (query || '').trim();
        if (!cleanQ || cleanQ.length < 2) {
            liveGlobalFoods = [];
            if (liveIndicatorEl) liveIndicatorEl.style.display = 'none';
            renderFoodList();
            return;
        }

        if (globalSearchAbortController) {
            globalSearchAbortController.abort();
        }
        globalSearchAbortController = new AbortController();

        isFetchingGlobal = true;
        if (liveIndicatorEl) {
            liveIndicatorEl.style.display = 'flex';
            liveIndicatorEl.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Searching global database for "${cleanQ}"...</span>`;
        }
        renderFoodList();

        try {
            const res = await fetch(`/api/search-food?q=${encodeURIComponent(cleanQ)}`, {
                signal: globalSearchAbortController.signal
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.foods)) {
                    // Verify query is still current
                    if (currentSearchQuery.trim().toLowerCase() === cleanQ.toLowerCase() || currentCategory === 'global') {
                        liveGlobalFoods = data.foods;
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn("Global food search warning:", err);
            }
        } finally {
            isFetchingGlobal = false;
            if (liveIndicatorEl) liveIndicatorEl.style.display = 'none';
            renderFoodList();
        }
    }

    // Open Portion Adjustment Modal
    function openPortionModal(food) {
        selectedFood = food;
        const defaultUnit = food.servingUnits.find(u => u.isDefault) || food.servingUnits[0];
        selectedUnitId = defaultUnit.id;
        currentQuantity = defaultUnit.defaultQty || 1;

        if (modalTitle) modalTitle.textContent = food.name;
        if (modalSubtitle) modalSubtitle.textContent = food.description || '';

        if (modalStateBadge) {
            const isCooked = food.state === 'Cooked';
            modalStateBadge.className = `food-state-badge ${isCooked ? 'cooked' : 'raw'}`;
            modalStateBadge.innerHTML = `<i class="${isCooked ? 'ri-fire-fill' : 'ri-leaf-line'}"></i> ${food.state}`;
        }

        if (modalQuickGrams) modalQuickGrams.dataset.mode = '';
        renderServingUnits();
        updateModalCalculation();
        syncMealTypePills();

        if (modal) {
            modal.classList.remove('hidden');
            document.documentElement.classList.add('no-scroll');
            document.body.classList.add('no-scroll');
        }
    }

    function closePortionModal() {
        if (modal) {
            modal.classList.add('hidden');
            document.documentElement.classList.remove('no-scroll');
            document.body.classList.remove('no-scroll');
        }
        selectedFood = null;
    }

    // Render Unit Selector Pills
    function renderServingUnits() {
        if (!modalUnitsList || !selectedFood) return;

        modalUnitsList.innerHTML = selectedFood.servingUnits.map(unit => `
            <button type="button" class="food-unit-pill ${unit.id === selectedUnitId ? 'active' : ''}" data-unit-id="${unit.id}">
                ${unit.name}
            </button>
        `).join('');

        modalUnitsList.querySelectorAll('.food-unit-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                modalUnitsList.querySelectorAll('.food-unit-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedUnitId = btn.dataset.unitId;

                const unitObj = selectedFood.servingUnits.find(u => u.id === selectedUnitId);
                if (unitObj) {
                    currentQuantity = unitObj.defaultQty || 1;
                }
                updateModalCalculation();
            });
        });
    }

    // Sync Meal Type Selection in Modal
    function syncMealTypePills() {
        if (!modalMealPills) return;
        modalMealPills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.meal === selectedMealType);
            pill.onclick = () => {
                modalMealPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedMealType = pill.dataset.meal;
            };
        });
    }

    // Recalculate Live Nutrients
    function updateModalCalculation() {
        if (!selectedFood) return;

        const unitObj = selectedFood.servingUnits.find(u => u.id === selectedUnitId) || selectedFood.servingUnits[0];
        const step = unitObj.step || 1;
        const minVal = unitObj.min || 0.1;

        // Ensure currentQuantity is valid
        if (isNaN(currentQuantity) || currentQuantity < minVal) {
            currentQuantity = minVal;
        }

        if (modalQtyInput) {
            modalQtyInput.value = Number.isInteger(currentQuantity) ? currentQuantity : currentQuantity.toFixed(1);
            modalQtyInput.step = step;
            modalQtyInput.min = minVal;
        }

        // Render quick suggestion shortcuts consistently for both grams and whole units (prevents UI shift)
        renderQuickShortcuts(unitObj);

        const calculated = calculateFoodNutrients(selectedFood, currentQuantity, selectedUnitId);

        if (modalCalories) modalCalories.textContent = calculated.calories;
        if (modalCaloriesHeader) modalCaloriesHeader.textContent = calculated.calories;
        if (modalProtein) modalProtein.textContent = `${calculated.protein}g`;
        if (modalCarbs) modalCarbs.textContent = `${calculated.carbs}g`;
        if (modalFat) modalFat.textContent = `${calculated.fat}g`;
        if (modalGramsLabel) {
            modalGramsLabel.textContent = `Total weight: ~${calculated.totalGrams}g (${calculated.servingLabel})`;
        }
        if (modalMacroHeaderTitle) {
            const rawLabel = (calculated.servingLabel || '').trim();
            const formatted = rawLabel.toUpperCase().startsWith('PER ') ? rawLabel.toUpperCase() : `PER ${rawLabel.toUpperCase()}`;
            modalMacroHeaderTitle.textContent = `NUTRITION (${formatted})`;
        }

        if (modalConfirmBtn) {
            modalConfirmBtn.innerHTML = `
                <i class="ri-check-line"></i>
                <span>Log Meal</span>
            `;
        }
    }

    // Render Quick Shortcuts for both Grams and Whole Items
    function renderQuickShortcuts(unitObj) {
        if (!modalQuickGrams) return;
        const isGramMode = (unitObj.id === 'g' || unitObj.id === 'ml');
        const modeKey = isGramMode ? 'gram' : 'whole';

        if (modalQuickGrams.dataset.mode !== modeKey) {
            modalQuickGrams.dataset.mode = modeKey;
            modalQuickGrams.style.display = 'flex';
            modalQuickGrams.classList.remove('hidden');

            if (isGramMode) {
                modalQuickGrams.innerHTML = `
                    <button type="button" class="quick-gram-btn" data-set="50">50g</button>
                    <button type="button" class="quick-gram-btn" data-set="100">100g</button>
                    <button type="button" class="quick-gram-btn" data-set="150">150g</button>
                    <button type="button" class="quick-gram-btn" data-set="200">200g</button>
                    <button type="button" class="quick-gram-btn" data-add="25">+25g</button>
                    <button type="button" class="quick-gram-btn" data-add="50">+50g</button>
                `;
            } else {
                modalQuickGrams.innerHTML = `
                    <button type="button" class="quick-gram-btn" data-set="1">1</button>
                    <button type="button" class="quick-gram-btn" data-set="2">2</button>
                    <button type="button" class="quick-gram-btn" data-set="3">3</button>
                    <button type="button" class="quick-gram-btn" data-set="4">4</button>
                    <button type="button" class="quick-gram-btn" data-add="1">+1</button>
                    <button type="button" class="quick-gram-btn" data-add="2">+2</button>
                `;
            }
        }

        // Highlight active preset button if quantity matches exactly
        modalQuickGrams.querySelectorAll('.quick-gram-btn').forEach(btn => {
            if (btn.dataset.set) {
                const val = parseFloat(btn.dataset.set);
                btn.classList.toggle('active', val === currentQuantity);
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Setup Stepper Buttons
    if (modalBtnMinus) {
        modalBtnMinus.addEventListener('click', () => {
            if (!selectedFood) return;
            const unitObj = selectedFood.servingUnits.find(u => u.id === selectedUnitId) || selectedFood.servingUnits[0];
            const step = unitObj.step || 1;
            const minVal = unitObj.min || 0.1;
            currentQuantity = Math.max(minVal, Math.round((currentQuantity - step) * 10) / 10);
            updateModalCalculation();
        });
    }

    if (modalBtnPlus) {
        modalBtnPlus.addEventListener('click', () => {
            if (!selectedFood) return;
            const unitObj = selectedFood.servingUnits.find(u => u.id === selectedUnitId) || selectedFood.servingUnits[0];
            const step = unitObj.step || 1;
            currentQuantity = Math.round((currentQuantity + step) * 10) / 10;
            updateModalCalculation();
        });
    }

    if (modalQtyInput) {
        modalQtyInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val > 0) {
                currentQuantity = val;
                updateModalCalculation();
            }
        });
    }

    // Quick Portion Buttons (Delegated listener supporting both whole items and grams)
    if (modalQuickGrams) {
        modalQuickGrams.addEventListener('click', (e) => {
            const btn = e.target.closest('.quick-gram-btn');
            if (!btn) return;
            const setAmount = parseFloat(btn.dataset.set);
            const addAmount = parseFloat(btn.dataset.add);
            if (!isNaN(setAmount)) {
                currentQuantity = setAmount;
            } else if (!isNaN(addAmount)) {
                currentQuantity = Math.round(((currentQuantity || 0) + addAmount) * 10) / 10;
            }
            updateModalCalculation();
        });
    }

    // Close Modal Listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePortionModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closePortionModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePortionModal();
        });

        // Prevent background page scrolling while modal is open
        modal.addEventListener('wheel', (e) => {
            if (!e.target.closest('.food-db-modal-card')) {
                e.preventDefault();
            }
        }, { passive: false });

        modal.addEventListener('touchmove', (e) => {
            if (!e.target.closest('.food-db-modal-card')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Confirm & Log to Diary
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', async () => {
            if (!selectedFood) return;

            const user = auth.currentUser;
            if (!user) {
                if (typeof showNotification === 'function') {
                    showNotification('Please log in with Google to add foods to your diary.', 'error');
                }
                return;
            }

            const calculated = calculateFoodNutrients(selectedFood, currentQuantity, selectedUnitId);
            const today = typeof window.getLocalDateString === 'function' 
                ? window.getLocalDateString() 
                : new Date().toLocaleDateString('en-CA');

            const mealData = {
                mealType: selectedMealType || 'Lunch',
                foodName: `${selectedFood.name} (${calculated.servingLabel})`,
                quantity: calculated.servingLabel,
                quantityType: (selectedUnitId === 'g' || selectedUnitId === 'ml') ? 'gram' : 'portion',
                calories: calculated.calories,
                protein: calculated.protein,
                carbs: calculated.carbs,
                fat: calculated.fat
            };

            const originalBtnContent = modalConfirmBtn.innerHTML;
            modalConfirmBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding to Diary...';
            modalConfirmBtn.disabled = true;

            try {
                const result = await dietService.addMeal(db, user.uid, today, mealData);
                if (result.success) {
                    if (gamificationModule && typeof gamificationModule.logDailyDiet === 'function') {
                        gamificationModule.logDailyDiet(today);
                    }
                    if (typeof showNotification === 'function') {
                        showNotification(`Logged ${mealData.calories} kcal for ${mealData.mealType}! 🍎`, 'success');
                    }

                    // Auto-cache global food so it's instantly available offline
                    if (selectedFood && (selectedFood.source || selectedFood.id.startsWith('off_') || selectedFood.id.startsWith('usda_') || selectedFood.category === 'global')) {
                        saveCachedGlobalFood(selectedFood);
                    }

                    closePortionModal();

                    // Instantly refresh dashboard & history without page refresh
                    if (window.updateDietDashboard) window.updateDietDashboard();
                    if (window.updateDietHistory) window.updateDietHistory(today);
                    if (window.clearWeeklyDietCache) window.clearWeeklyDietCache();
                    if (typeof checkDietGamificationAsync === 'function') checkDietGamificationAsync();
                } else {
                    throw new Error(result.error || 'Failed to add meal.');
                }
            } catch (err) {
                console.error("Food Database Add Meal Error:", err);
                if (typeof showNotification === 'function') {
                    showNotification('Failed to add food to diary. Please try again.', 'error');
                }
            } finally {
                modalConfirmBtn.innerHTML = originalBtnContent;
                modalConfirmBtn.disabled = false;
            }
        });
    }

    // Search Input Listener with Instant Local + Debounced Global Query (Lag-free on Mobile)
    let searchDebounceTimer = null;
    let localSearchRaf = null;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
            }

            clearTimeout(searchDebounceTimer);
            if (localSearchRaf) cancelAnimationFrame(localSearchRaf);

            localSearchRaf = requestAnimationFrame(() => {
                const q = currentSearchQuery.trim();
                if (q.length >= 2) {
                    const localMatches = FOOD_DATABASE.filter(f => {
                        const nameMatch = (f.name || '').toLowerCase().includes(q.toLowerCase());
                        const termsMatch = (f.searchTerms || '').toLowerCase().includes(q.toLowerCase());
                        return nameMatch || termsMatch;
                    });

                    if (localMatches.length === 0) {
                        isFetchingGlobal = true;
                        if (liveIndicatorEl) {
                            liveIndicatorEl.style.display = 'flex';
                            liveIndicatorEl.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> <span>Searching global database for "${q}"...</span>`;
                        }
                    } else {
                        isFetchingGlobal = false;
                        if (liveIndicatorEl) liveIndicatorEl.style.display = 'none';
                    }

                    renderFoodList(true);

                    searchDebounceTimer = setTimeout(() => {
                        performGlobalFoodSearch(q);
                    }, 300);
                } else {
                    isFetchingGlobal = false;
                    liveGlobalFoods = [];
                    if (liveIndicatorEl) liveIndicatorEl.style.display = 'none';
                    renderFoodList(true);
                }
            });
        });

        // Instant trigger on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchDebounceTimer);
                if (localSearchRaf) cancelAnimationFrame(localSearchRaf);
                const q = currentSearchQuery.trim();
                if (q.length >= 2) {
                    performGlobalFoodSearch(q);
                }
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentSearchQuery = '';
            isFetchingGlobal = false;
            if (globalSearchAbortController) {
                globalSearchAbortController.abort();
            }
            liveGlobalFoods = [];
            if (liveIndicatorEl) liveIndicatorEl.style.display = 'none';
            clearSearchBtn.style.display = 'none';
            renderFoodList();
            searchInput.focus();
        });
    }

    // Setup Category buttons
    renderCategories();
    renderFoodList();

    // Expose global helper to switch to database view and optionally search
    window.openFoodDatabase = (prefillQuery = '') => {
        // Navigate to view-diet-add-meal if not already there
        const addMealNavItem = document.querySelector('.nav-item[data-target="view-diet-add-meal"]');
        if (addMealNavItem) addMealNavItem.click();

        const toggleBtn = document.querySelector('.add-meal-toggle-btn[data-subview="food-db"]');
        if (toggleBtn) toggleBtn.click();

        if (prefillQuery && searchInput) {
            searchInput.value = prefillQuery;
            currentSearchQuery = prefillQuery;
            if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
            renderFoodList();
            if (prefillQuery.trim().length >= 2) {
                performGlobalFoodSearch(prefillQuery.trim());
            }
        }
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 100);
    };
}
