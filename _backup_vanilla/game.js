/* Game State */
const state = {
    hero: null,
    currentDungeon: null,
    currentRoom: 0,
    currentEnemy: null,
    isPlayerTurn: true,
    isDefending: false
};

/* DOM Elements */
const screens = {
    menu: document.getElementById('screen-menu'),
    charSelect: document.getElementById('screen-char-select'),
    dungeonSelect: document.getElementById('screen-dungeon-select'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

const ui = {
    charGrid: document.getElementById('char-grid'),
    dungeonList: document.getElementById('dungeon-list'),
    heroImg: document.getElementById('hero-img'),
    playerName: document.getElementById('player-name'),
    playerHpBar: document.getElementById('player-hp-bar'),
    playerHpText: document.getElementById('player-hp-text'),
    dungeonName: document.getElementById('dungeon-name'),
    roomCounter: document.getElementById('room-counter'),
    enemyDisplay: document.getElementById('enemy-display'),
    enemyImg: document.getElementById('enemy-img'),
    enemyName: document.getElementById('enemy-name'),
    enemyHpBar: document.getElementById('enemy-hp-bar'),
    combatLog: document.getElementById('combat-log'),
    combatActions: document.getElementById('combat-actions'),
    explorationActions: document.getElementById('exploration-actions'),
    resultTitle: document.getElementById('result-title'),
    resultMessage: document.getElementById('result-message')
};

/* Navigation Functions */
function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

/* Initialization */
document.getElementById('btn-start').addEventListener('click', () => {
    renderCharSelection();
    showScreen('charSelect');
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
    showScreen('menu');
});

document.getElementById('btn-back-char').addEventListener('click', () => {
    showScreen('charSelect');
});

document.getElementById('btn-restart').addEventListener('click', () => {
    showScreen('menu');
});

/* Character Selection */
function renderCharSelection() {
    ui.charGrid.innerHTML = '';
    DATA.heroes.forEach(hero => {
        const el = document.createElement('div');
        el.className = 'char-card';
        el.innerHTML = `
            <img src="${hero.img}" alt="${hero.name}">
            <h3>${hero.name}</h3>
            <p style="font-size: 0.8rem; color: #a8a8b3">HP: ${hero.hp} | Atk: ${hero.atk}</p>
        `;
        el.addEventListener('click', () => {
            selectHero(hero);
        });
        ui.charGrid.appendChild(el);
    });
}

function selectHero(heroData) {
    // Clone object to avoid modifying original reference
    state.hero = { ...heroData };
    renderDungeonSelection();
    showScreen('dungeonSelect');
}

/* Dungeon Selection */
function renderDungeonSelection() {
    ui.dungeonList.innerHTML = '';
    DATA.dungeons.forEach(dungeon => {
        const el = document.createElement('div');
        el.className = 'dungeon-item';
        el.innerHTML = `
            <span>${dungeon.name}</span>
            <span style="font-size: 0.8rem; color: #666">${dungeon.rooms} salas</span>
        `;
        el.addEventListener('click', () => {
            startDungeon(dungeon);
        });
        ui.dungeonList.appendChild(el);
    });
}

/* Game Logic */
function startDungeon(dungeonData) {
    state.currentDungeon = dungeonData;
    state.currentRoom = 1;
    state.currentEnemy = null;

    // Setup UI
    ui.playerName.innerText = state.hero.name;
    ui.heroImg.src = state.hero.img;
    ui.dungeonName.innerText = state.currentDungeon.name;
    updateStatsUI();

    log(`Você entrou em: ${state.currentDungeon.name}.`);
    showScreen('game');

    enterRoom();
}

function enterRoom() {
    ui.roomCounter.innerText = `Sala ${state.currentRoom}/${state.currentDungeon.rooms}`;
    state.currentEnemy = null;
    ui.enemyDisplay.classList.add('hidden');
    ui.combatActions.classList.add('hidden');
    ui.explorationActions.classList.remove('hidden');

    // Logic: 
    // Last room = BOSS
    // Chance of monster = 60%
    // Chance of treasure (auto-heal for now) = 30%
    // Nothing = 10%

    const isBossRoom = state.currentRoom === state.currentDungeon.rooms;

    if (isBossRoom) {
        log("CUIDADO! Você sente uma presença terrível. É o CHEFE!");
        spawnEnemy('boss');
    } else {
        const roll = Math.random();
        if (roll < 0.6) {
            log("Um monstro bloqueia seu caminho!");
            // Determine difficulty relative to dungeon
            spawnEnemy(state.currentDungeon.difficulty);
        } else if (roll < 0.9) {
            log("Você encontrou uma fonte de cura! Recuperou 30 HP.");
            healHero(30);
        } else {
            log("A sala está vazia e silenciosa...");
        }
    }
}

function spawnEnemy(difficulty) {
    ui.explorationActions.classList.add('hidden'); // Cannot leave
    ui.combatActions.classList.remove('hidden'); // Must fight

    // Pick random monster from difficulty list. If boss, pick from boss list.
    let list = [];
    if (difficulty === 'boss') {
        // Se a dungeon tem um boss especifico mapeado no data.dungeons (future proof), mas por enquanto pega do 'boss' array
        list = DATA.monsters.boss;
    } else {
        list = DATA.monsters[difficulty] || DATA.monsters.easy;
    }

    const template = list[Math.floor(Math.random() * list.length)];
    state.currentEnemy = { ...template, maxHp: template.hp };

    // UI Update
    ui.enemyName.innerText = state.currentEnemy.name;
    ui.enemyImg.src = state.currentEnemy.img;
    ui.enemyDisplay.classList.remove('hidden');
    updateStatsUI();
}

function updateStatsUI() {
    // Hero
    const heroPct = (state.hero.hp / state.hero.maxHp) * 100;
    ui.playerHpBar.style.width = `${Math.max(0, heroPct)}%`;
    ui.playerHpText.innerText = `${Math.ceil(state.hero.hp)}/${state.hero.maxHp}`;

    // Enemy
    if (state.currentEnemy) {
        const enemyPct = (state.currentEnemy.hp / state.currentEnemy.maxHp) * 100;
        ui.enemyHpBar.style.width = `${Math.max(0, enemyPct)}%`;
    }
}

function log(msg) {
    const p = document.createElement('p');
    p.innerText = `> ${msg}`;
    ui.combatLog.appendChild(p);
    ui.combatLog.scrollTop = ui.combatLog.scrollHeight;
}

function healHero(amount) {
    state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + amount);
    updateStatsUI();
}

/* Combat System */
document.getElementById('btn-attack').addEventListener('click', () => playerAction('attack'));
document.getElementById('btn-defend').addEventListener('click', () => playerAction('defend'));
document.getElementById('btn-special').addEventListener('click', () => playerAction('special'));

document.getElementById('btn-next-room').addEventListener('click', () => {
    state.currentRoom++;
    if (state.currentRoom > state.currentDungeon.rooms) {
        endGame(true);
    } else {
        enterRoom();
    }
});

function playerAction(action) {
    if (!state.currentEnemy) return;

    state.isDefending = false;

    // Player Turn
    let dmg = 0;

    // Visual anim
    document.getElementById('hero-display').classList.add('attack-anim');
    setTimeout(() => document.getElementById('hero-display').classList.remove('attack-anim'), 300);

    if (action === 'attack') {
        dmg = state.hero.atk + Math.floor(Math.random() * 5); // Base + variance
        log(`Você atacou ${state.currentEnemy.name} causando ${dmg} de dano!`);
    } else if (action === 'defend') {
        state.isDefending = true;
        log(`Você assume uma postura defensiva.`);
    } else if (action === 'special') {
        // Simple distinct logic: Double damage but 20% miss chance
        if (Math.random() > 0.2) {
            dmg = state.hero.atk * 2;
            log(`ESPECIAL! Você acertou um golpe crítico de ${dmg} de dano!`);
        } else {
            log(`Você errou o ataque especial!`);
        }
    }

    if (dmg > 0) {
        state.currentEnemy.hp -= dmg;
        // Enemy shake anim
        document.getElementById('enemy-display').classList.add('shake');
        setTimeout(() => document.getElementById('enemy-display').classList.remove('shake'), 400);
    }

    updateStatsUI();

    if (state.currentEnemy.hp <= 0) {
        // Victory
        log(`Você derrotou ${state.currentEnemy.name}!`);
        state.currentEnemy = null;
        ui.enemyDisplay.classList.add('hidden');
        ui.combatActions.classList.add('hidden');
        ui.explorationActions.classList.remove('hidden');

        if (state.currentRoom === state.currentDungeon.rooms) {
            setTimeout(() => endGame(true), 1000);
        }
        return;
    }

    // Enemy Turn (delayed slightly)
    setTimeout(enemyTurn, 800);
}

function enemyTurn() {
    if (!state.currentEnemy || !state.hero) return;

    let dmg = state.currentEnemy.atk + Math.floor(Math.random() * 3);

    if (state.isDefending) {
        dmg = Math.floor(dmg / 2);
        log(`${state.currentEnemy.name} atacou, mas você defendeu! Recebeu apenas ${dmg} de dano.`);
    } else {
        log(`${state.currentEnemy.name} atacou você causando ${dmg} de dano!`);
    }

    state.hero.hp -= dmg;

    // Hero shake
    document.getElementById('hero-display').classList.add('shake');
    setTimeout(() => document.getElementById('hero-display').classList.remove('shake'), 400);

    updateStatsUI();

    if (state.hero.hp <= 0) {
        setTimeout(() => endGame(false), 1000);
    }
}

function endGame(victory) {
    if (victory) {
        ui.resultTitle.innerText = "VITÓRIA!";
        ui.resultTitle.style.color = "#4cd137";
        ui.resultMessage.innerText = `Você completou ${state.currentDungeon.name} com bravura!`;
    } else {
        ui.resultTitle.innerText = "GAME OVER";
        ui.resultTitle.style.color = "#e84118";
        ui.resultMessage.innerText = `Você caiu na sala ${state.currentRoom}... Tente novamente.`;
    }
    showScreen('result');
}
