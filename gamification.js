export const MEDALS = [
    { id: 'first_workout', name: 'First Step', desc: 'Completed your first workout', icon: '🚀' },
    { id: 'routine_complete', name: 'Routine Master', desc: 'Completed a full routine', icon: '🏆' },
    { id: 'consistency_3', name: 'On Fire', desc: 'Logged workouts 3 days in a row', icon: '🔥' },
    { id: 'volume_10k', name: 'Heavy Lifter', desc: 'Lifted 10,000kg total volume', icon: '🦍' }
];

export const initGamification = () => {
    console.log("Gamification Module Initialized");

    // State
    let unlockedMedals = [];
    try {
        unlockedMedals = JSON.parse(localStorage.getItem('gymMedals')) || [];
    } catch (e) { unlockedMedals = []; }

    // Elements
    const modal = document.getElementById('modal-medal');
    const title = document.getElementById('medal-title');
    const desc = document.getElementById('medal-desc');
    const icon = document.getElementById('medal-icon');

    const save = () => localStorage.setItem('gymMedals', JSON.stringify(unlockedMedals));

    const showUnlock = (medal) => {
        if (!modal) return;
        title.textContent = "New Medal Unlocked!";
        desc.innerHTML = `You earned <strong>${medal.name}</strong><br>${medal.desc}`;
        icon.textContent = medal.icon;
        modal.classList.remove('hidden');
    };

    const showDetails = (medal, isUnlocked) => {
        if (!modal) return;
        title.textContent = isUnlocked ? "Medal Details" : "Locked Medal";
        desc.innerHTML = `<strong>${medal.name}</strong><br>${medal.desc}<br><br>${isUnlocked ? '✅ Achieved' : '🔒 Keep going!'}`;
        icon.textContent = medal.icon;
        modal.classList.remove('hidden');
    };

    return {
        unlock: (id) => {
            if (unlockedMedals.includes(id)) return false;
            const medal = MEDALS.find(m => m.id === id);
            if (!medal) return false;

            unlockedMedals.push(id);
            save();
            showUnlock(medal);
            return true;
        },
        getUnlocked: () => unlockedMedals,
        renderRewards: (container) => {
            if (!container) return;
            container.innerHTML = '<div class="medal-grid"></div>';
            const grid = container.querySelector('.medal-grid');

            MEDALS.forEach(medal => {
                const isUnlocked = unlockedMedals.includes(medal.id);
                const card = document.createElement('div');
                card.className = `medal-card ${isUnlocked ? '' : 'locked'}`;
                card.innerHTML = `
                    <div class="icon">${medal.icon}</div>
                    <div class="name">${medal.name}</div>
                    <div class="status">${isUnlocked ? 'Unlocked' : 'Locked'}</div>
                `;
                card.title = medal.desc;
                card.addEventListener('click', () => showDetails(medal, isUnlocked));
                grid.appendChild(card);
            });
        },
        checkMilestones: (history, currentSession) => {
            // Placeholder
        }
    };
};
