<script setup>
    /**
     * GameScreen.vue - O Coração do Jogo
     * Gerencia a exploração de masmorras, combate por turnos, 
     * sistema de loot, ganho de XP/Level Up e uso de habilidades.
     */
    import { ref, onMounted, reactive, computed } from 'vue';
    import { gameData } from '../data/gameData';
    import DiceRoller from './DiceRoller.vue';
    import InventoryModal from './InventoryModal.vue';

    const props = defineProps(['hero', 'dungeon']);
    const emit = defineEmits(['victory', 'game-over']);

    // --- ESTADO DO HERÓI (Estado Reativo Local) ---
    const heroState = reactive({
        baseDmg: 0,
        mp: 0,
        activeBuffs: [],
        ...JSON.parse(JSON.stringify(props.hero)) // Cópia profunda para não alterar a prop pai diretamente
    });

    // Inicialização de estados para saves antigos
    if (heroState.baseDmg === undefined) heroState.baseDmg = 0;
    if (!heroState.maxMp) {
        const classData = gameData.heroes.find(h => h.id === heroState.id);
        heroState.maxMp = classData ? classData.maxMp : 20;
    }
    if (heroState.mp === undefined) heroState.mp = heroState.maxMp;
    if (!heroState.activeBuffs) heroState.activeBuffs = [];

    // --- COMPUTADOS (Cálculos Automáticos) ---
    const currentWeapon = computed(() => gameData.weapons[heroState.weapon] || gameData.weapons.fists);
    const currentArmor = computed(() => gameData.armors[heroState.armor] || gameData.armors.none);

    // Controle de Progressão e UI
    const currentRoom = ref(1);      // Sala atual
    const currentEnemy = ref(null);  // Inimigo atual (null se a sala estiver vazia)
    const logs = ref([]);            // Histórico de mensagens
    const isPlayerTurn = ref(true);  // Controle de turno
    const gameResult = ref(null);    // 'win' ou 'loss'
    const isBusy = ref(false);       // Impede cliques durante animações
    const showDice = ref(false);     // Abre o modal do dado
    const showInventory = ref(false);// Abre a mochila
    const showSkills = ref(false);   // Abre o menu de magias
    const emptyRoomsCount = ref(0);  // Controle de salas vazias consecutivas


    const maxEmptyRooms = computed(() => {
        switch (props.dungeon.difficulty) {
            case 'easy': return 1;
            case 'medium': return 2;
            case 'hard': return 3;
            default: return 1;
        }
    });

    const heroHpPercent = computed(() => Math.max(0, (heroState.hp / heroState.maxHp) * 100));
    const heroXpPercent = computed(() => {
        return Math.max(0, (heroState.xp / heroState.maxXp) * 100);
    });
    const heroMpPercent = computed(() => {
        return Math.max(0, (heroState.mp / heroState.maxMp) * 100);
    });

    const enemyHpPercent = computed(() => {
        if (!currentEnemy.value) return 0;
        return (currentEnemy.value.hp / currentEnemy.value.maxHp) * 100;
    });

    const playerAC = computed(() => {
        let ac = currentArmor.value.ac;
        // Apply AC buffs
        const buff = heroState.activeBuffs.find(b => b.stat === 'ac');
        if (buff) ac += buff.value;
        return ac;
    });

    const availableSkills = computed(() => {
        const classSkills = gameData.skills[heroState.id] || [];
        return classSkills.filter(s => s.level <= heroState.level);
    });

    onMounted(() => {
        log(`Masmorra: ${props.dungeon.name}`);
        activeScaling();
        enterRoom();
    });

    function activeScaling() {
        // Formula: 25 * 2^(level - 1)
        // Lv 1: 25, Lv 2: 50, Lv 3: 100...
        heroState.maxXp = 25 * Math.pow(2, heroState.level - 1);
    }

    /**
     * Lógica disparada ao entrar em uma nova sala.
     * Sorteia entre Combate, Loot, Fogueira ou Sala Vazia.
     */
    function enterRoom() {
        isBusy.value = false;
        isPlayerTurn.value = true;

        // Verifica se é a última sala (BOSS)
        if (currentRoom.value === props.dungeon.rooms) {
            log("⚠️ CHEFE À VISTA!");
            spawnEnemy('boss');
            return;
        }

        const roll = Math.random();
        if (roll < 0.5) {
            triggerCombat(); // 50% chance de combate
        } else if (roll < 0.75) {
            findLoot();      // 25% chance de tesouro
        } else if (roll < 0.85) {
            foundCampfire(); // 10% chance de fogueira
        } else {
            // Regeneração passiva de MP ao caminhar
            heroState.mp = Math.min(heroState.maxMp, heroState.mp + 2);
            if (emptyRoomsCount.value < maxEmptyRooms.value) {
                emptyRoomsCount.value++;
                log("Sala Vazia (MP +2)");
            } else {
                // Força um encontro se tiver tido muitas salas vazias
                if (Math.random() > 0.5) triggerCombat();
                else findLoot();
            }
        }
    }


    function triggerCombat() {
        log("Inimigo encontrado!");
        spawnEnemy(props.dungeon.difficulty);
    }

    function foundCampfire() {
        log("🔥 Fogueira! HP e MP restaurados.");
        healHero(Math.floor(heroState.maxHp * 0.4));
        heroState.mp = Math.min(heroState.maxMp, heroState.mp + 20);
    }

    function spawnEnemy(difficulty) {
        let list = [];
        if (difficulty === 'boss') {
            list = gameData.monsters.boss;
        } else {
            list = gameData.monsters[difficulty] || gameData.monsters.easy;
        }
        const template = list[Math.floor(Math.random() * list.length)];
        let enemy = { ...template, maxHp: template.hp, hp: template.hp };

        // Scaling Logic
        if (difficulty === 'boss') {
            const dungeonDiff = props.dungeon.difficulty;
            let hpMult = 1.0;
            let acMod = 0;
            let dmgMult = 1.0;
            let xpMult = 1.0;

            if (dungeonDiff === 'easy') {
                hpMult = 0.2;
                acMod = -5;
                dmgMult = 0.2;
                xpMult = 0.1;
            } else if (dungeonDiff === 'medium') {
                hpMult = 0.5;
                acMod = -2;
                dmgMult = 0.5;
                xpMult = 0.4;
            }

            enemy.maxHp = Math.max(1, Math.floor(enemy.maxHp * hpMult));
            enemy.hp = enemy.maxHp;
            enemy.ac = Math.max(1, enemy.ac + acMod);

            enemy.minDmg = Math.max(1, Math.floor(enemy.minDmg * dmgMult));
            enemy.maxDmg = Math.max(enemy.minDmg, Math.floor(enemy.maxDmg * dmgMult));

            enemy.xp = Math.max(1, Math.floor((enemy.xp || 10) * xpMult));
        }

        currentEnemy.value = enemy;
    }

    function findLoot() {
        const lootRoll = Math.random();
        if (lootRoll < 0.6) {
            const goldFound = Math.floor(Math.random() * 40) + 10;
            heroState.gold += goldFound;
            log(`+${goldFound} Ouro.`);
        } else {
            log(`Item encontrado!`);
            heroState.items.push({ name: 'Poção de Vida', type: 'heal', value: 50, desc: 'Recupera 50 HP' });
        }
    }

    function nextRoom() {
        if (currentRoom.value < props.dungeon.rooms) {
            currentRoom.value++;
            enterRoom();
        } else {
            gameResult.value = 'win';
        }
    }

    function initiateAttack() {
        if (isBusy.value || !currentEnemy.value) return;
        showDice.value = true;
    }

    function onDiceResult(diceValue) {
        showDice.value = false;
        setTimeout(() => { performAttack(diceValue); }, 400);
    }

    /**
     * Realiza o ataque baseado no valor do dado.
     * Calcula acerto contra AC e aplica dano se acertar.
     */
    function performAttack(diceValue) {
        isPlayerTurn.value = false;
        isBusy.value = true;

        // Acerto = Dado + Bônus da Arma + Bônus do Nível
        const hitBonus = currentWeapon.value.hitBonus + heroState.baseHit;
        const totalHit = diceValue + hitBonus;

        log(`Rolagem: ${totalHit} (AC Alvo: ${currentEnemy.value.ac})`);

        if (totalHit >= currentEnemy.value.ac) {
            // Calcula dano sorteando entre o min e max da arma
            const min = currentWeapon.value.minDmg;
            const max = currentWeapon.value.maxDmg;
            const dmg = Math.floor(Math.random() * (max - min + 1)) + min + (heroState.baseDmg || 0);

            log(`Acertou! ${dmg} dano (Bônus: +${heroState.baseDmg || 0}).`);
            currentEnemy.value.hp -= dmg;
            triggerShake('enemy-display');

            if (currentEnemy.value.hp <= 0) {
                handleEnemyDefeat();
                return;
            }
        } else {
            log(`Errou!`);
        }
        // Aguarda 1s para o turno inimigo
        setTimeout(enemyTurn, 1000);
    }


    function handleEnemyDefeat() {
        setTimeout(() => {
            log(`Inimigo derrotado!`);
            gainXp(currentEnemy.value.xp || 10);
            heroState.gold += Math.floor(Math.random() * 10) + 5;
            currentEnemy.value = null;

            if (currentRoom.value === props.dungeon.rooms) {
                setTimeout(() => { gameResult.value = 'win'; }, 1000);
            } else {
                isBusy.value = false;
            }
        }, 500);
    }

    function gainXp(amount) {
        heroState.xp += amount;
        while (heroState.xp >= heroState.maxXp) {
            levelUp();
        }
    }

    /**
     * Sobe o nível do personagem e aumenta seus atributos.
     */
    function levelUp() {
        heroState.xp -= heroState.maxXp; // Sobra de XP vai para o próximo nível
        heroState.level++;


        // Atualiza o requisito para o próximo nível
        heroState.maxXp = 25 * Math.pow(2, heroState.level - 1);

        heroState.maxHp += 15;
        heroState.hp = heroState.maxHp;
        heroState.maxMp += 5;
        heroState.mp = heroState.maxMp;
        heroState.baseHit += 1; // Melhora precisão

        // Bônus de Dano Base por Classe ao subir de nível
        let dmgBonus = 1;
        switch (heroState.id) {
            case 'barbaro': dmgBonus = 5; break;
            case 'mago': dmgBonus = 3; break;
            case 'guerreiro': dmgBonus = 2; break;
            case 'arqueira': dmgBonus = 2; break;
            default: dmgBonus = 1;
        }

        heroState.baseDmg = (heroState.baseDmg || 0) + dmgBonus;
        log(`SUBIU DE NÍVEL! (Lv ${heroState.level}) - +HP, +MP, +${dmgBonus} Dano Base!`);
    }


    function enemyTurn() {
        if (!currentEnemy.value || gameResult.value) return;

        // Process Player Buffs Tick (End of Enemy Turn = Start of Player Turn effectively)
        heroState.activeBuffs.forEach(b => b.duration--);
        heroState.activeBuffs = heroState.activeBuffs.filter(b => b.duration > 0);

        const enemy = currentEnemy.value;
        const roll = Math.floor(Math.random() * 6) + 1;
        const totalHit = roll + enemy.hitBonus;

        if (totalHit >= playerAC.value) {
            let dmg = Math.floor(Math.random() * (enemy.maxDmg - enemy.minDmg + 1)) + enemy.minDmg;

            // Apply Thorns Buff logic (Druid)
            const thorns = heroState.activeBuffs.find(b => b.stat === 'thorns');
            if (thorns) {
                log(`${enemy.name} sofreu ${thorns.value} de espinhos!`);
                enemy.hp -= thorns.value;
                triggerShake('enemy-display');
                if (enemy.hp <= 0) {
                    handleEnemyDefeat();
                    return;
                }
            }

            heroState.hp -= dmg;
            log(`${enemy.name} acertou! ${dmg} dano.`);
            triggerShake('hero-display');

            if (heroState.hp <= 0) {
                setTimeout(() => { gameResult.value = 'loss'; }, 1000); // Trigger Loss
                return;
            }
        } else {
            log(`${enemy.name} errou!`);
        }

        isPlayerTurn.value = true;
        isBusy.value = false;
    }

    function useSkill(skill) {
        if (heroState.mp < skill.cost) {
            log("Mana insuficiente!");
            return;
        }

        heroState.mp -= skill.cost;
        showSkills.value = false;
        isPlayerTurn.value = false;
        isBusy.value = true;

        log(`Usou ${skill.name}!`);

        if (skill.type === 'damage') {
            // Direct Damage
            const dmg = skill.value; // Fixed damage for spells usually
            currentEnemy.value.hp -= dmg;
            log(`Causou ${dmg} de dano.`);
            triggerShake('enemy-display');
        } else if (skill.type === 'heal') {
            healHero(skill.value);
            log(`Curou ${skill.value} HP.`);
        } else if (skill.type === 'buff') {
            // Apply buff
            heroState.activeBuffs.push({ name: skill.name, stat: skill.stat, value: skill.value, duration: skill.duration });
            log(`Buff aplicado: ${skill.desc}`);
            // Check instant effect buffs (like rage cost 0)
        } else if (skill.type === 'damage_mod') {
            // Weapon attack with modifier
            // We need to roll dice for this? Or just auto hit?
            // Let's assume auto-hit for skills for now to simplify, or maybe logic similar to attack
            // For implementation simplicity: Auto-hit with weapon dmg * multiplier
            const min = currentWeapon.value.minDmg;
            const max = currentWeapon.value.maxDmg;
            const rawDmg = Math.floor(Math.random() * (max - min + 1)) + min + (heroState.baseDmg || 0);
            const finalDmg = Math.floor(rawDmg * skill.value);
            currentEnemy.value.hp -= finalDmg;
            log(`Ataque Devastador! ${finalDmg} dano.`);
            triggerShake('enemy-display');
        } else if (skill.type === 'damage_multi') {
            // Multi hit (Archer)
            let totalDmg = 0;
            const count = skill.count || 2;
            log(`Disparou ${count} vezes!`);
            for (let i = 0; i < count; i++) {
                const min = currentWeapon.value.minDmg;
                const max = currentWeapon.value.maxDmg;
                const dmg = Math.floor(Math.random() * (max - min + 1)) + min + (heroState.baseDmg || 0);
                totalDmg += dmg;
                setTimeout(() => {
                    triggerShake('enemy-display');
                }, i * 200);
            }
            currentEnemy.value.hp -= totalDmg;
            log(`Total: ${totalDmg} dano.`);
        }

        // Check death
        if (currentEnemy.value && currentEnemy.value.hp <= 0) {
            handleEnemyDefeat();
        } else {
            setTimeout(enemyTurn, 1000);
        }
    }

    function onUseItem(index) {
        const item = heroState.items[index];

        if (item.type === 'heal') {
            healHero(item.value);
            log(`Usou ${item.name}.`);
            heroState.items.splice(index, 1);
            if (currentEnemy.value) {
                showInventory.value = false;
                setTimeout(enemyTurn, 800);
            }
        } else if (item.type === 'damage' && currentEnemy.value) {
            // Bomb Logic
            log(`💥 Usou ${item.name}!`);
            currentEnemy.value.hp -= item.value;
            triggerShake('enemy-display');
            heroState.items.splice(index, 1);
            showInventory.value = false;

            if (currentEnemy.value.hp <= 0) {
                handleEnemyDefeat();
            } else {
                setTimeout(enemyTurn, 800);
            }
        }
    }



    function toggleInventory() {
        showInventory.value = !showInventory.value;
    }

    function toggleSkills() {
        showSkills.value = !showSkills.value;
    }

    function healHero(amount) {
        heroState.hp = Math.min(heroState.maxHp, heroState.hp + amount);
    }

    function log(msg) {
        logs.value.push(msg);
        if (logs.value.length > 5) logs.value.shift();
    }

    function triggerShake(elementId) {
        const el = document.getElementById(elementId);
        if (el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 400); }
    }

    function finishGame(result) {
        if (result === 'win') {
            emit('victory', heroState);
        } else {
            emit('game-over');
        }
    }
</script>

<template>
    <div class="game-container">
        <DiceRoller v-if="showDice" @result="onDiceResult" />

        <InventoryModal :isOpen="showInventory" :gold="heroState.gold" :items="heroState.items"
            @close="showInventory = false" @use-item="onUseItem" />

        <header class="game-header">
            <div class="stats-box">
                <div class="portrait">
                    <img :src="heroState.img" alt="Hero">
                    <div class="level-badge">{{ heroState.level }}</div>
                </div>
                <div class="bars">
                    <div class="level-display">
                        <span class="hero-name">{{ heroState.name }}</span>
                        <span style="font-size: 0.85rem; color: #aaa; margin-left: 10px;">Nv. {{ heroState.level
                            }}</span>
                    </div>
                    <div class="hp-row" style="display: flex; align-items: center; gap: 5px;">
                        <div class="bar-container hp-bar">
                            <div class="bar-fill" :style="{ width: heroHpPercent + '%' }"></div>
                        </div>
                        <span style="font-size: 0.75rem;">{{ Math.ceil(heroState.hp) }} / {{ heroState.maxHp }}</span>
                    </div>
                    <!-- MP Bar -->
                    <div class="bar-container mp-bar">
                        <div class="bar-fill mp-fill" :style="{ width: heroMpPercent + '%' }"></div>
                        <span class="bar-text">{{ Math.ceil(heroState.mp) }} / {{ heroState.maxMp }}</span>
                    </div>
                    <div class="xp-container">
                        <img src="/img/icons/top-up.png" class="icon-xp" alt="XP">
                        <div class="bar-container xp-bar">
                            <div class="bar-fill xp-fill" :style="{ width: heroXpPercent + '%' }"></div>
                        </div>
                    </div>
                    <div class="gear-info">
                        <span>⚔️ +{{ currentWeapon.hitBonus + heroState.baseHit }} (Dmg +{{ heroState.baseDmg }})</span>
                        <span>🛡️ {{ playerAC }}</span>
                        <span style="color: gold; margin-left: 5px;">💰 {{ heroState.gold }}</span>
                    </div>
                    <!-- Buffs Display -->
                    <div v-if="heroState.activeBuffs.length > 0" class="buffs-row">
                        <span v-for="(b, i) in heroState.activeBuffs" :key="i" class="buff-chip">
                            {{ b.name }} ({{ b.duration }})
                        </span>
                    </div>
                </div>
            </div>
            <div class="dungeon-info">
                <h3>{{ props.dungeon.name }}</h3>
                <span>Sala {{ currentRoom }} / {{ props.dungeon.rooms }}</span>
            </div>
        </header>

        <main class="scene">
            <div id="hero-display" class="character-display">
                <img :src="heroState.img" alt="Hero" class="battle-sprite hero-sprite">
            </div>

            <div v-if="currentEnemy" id="enemy-display" class="character-display">
                <div class="enemy-info">
                    <span>{{ currentEnemy.name }}</span>
                    <span class="enemy-stats">AC: {{ currentEnemy.ac }}</span>
                    <div class="bar-container enemy-bar">
                        <div class="bar-fill enemy-fill" :style="{ width: enemyHpPercent + '%' }"></div>
                    </div>
                </div>
                <img :src="currentEnemy.img" alt="Enemy" class="battle-sprite monster-sprite">
            </div>

            <div v-else class="empty-room">
                <p v-if="!gameResult" style="color: #aaa; text-align: center;">Explore...</p>
            </div>
        </main>

        <div class="log-box" id="log-box">
            <p v-for="(msg, i) in logs" :key="i">> {{ msg }}</p>
        </div>

        <footer class="controls">
            <div v-if="gameResult" class="result-modal">
                <h2>{{ gameResult === 'win' ? 'VITÓRIA' : 'GAME OVER' }}</h2>
                <button v-if="gameResult === 'win'" class="btn-primary" @click="finishGame('win')">Voltar à
                    Cidade</button>
                <button v-else class="btn-primary" @click="finishGame('loss')">Aceitar Destino</button>
            </div>

            <div v-else class="actions">
                <!-- Attack Button -->
                <button v-if="currentEnemy" class="btn-action attack-big" :disabled="!isPlayerTurn"
                    @click="initiateAttack">
                    <img src="/img/icons/swords.png" alt="Atk">
                    ATACAR ({{ currentWeapon.name }})
                </button>

                <button v-if="!currentEnemy" class="btn-primary" @click="nextRoom">Avançar</button>

                <button class="btn-action btn-bag" @click="toggleInventory">
                    🎒
                </button>
                <button class="btn-action btn-skill" @click="toggleSkills">
                    ⚡
                </button>
            </div>
            <!-- Skills Modal (Premium Style) -->
            <div v-if="showSkills" class="modal-overlay" @click.self="showSkills = false">
                <div class="modal-content skills-modal">
                    <header class="modal-header">
                        <h3>Habilidades</h3>
                        <div class="mp-available">Mana: <span>{{ heroState.mp }} / {{ heroState.maxMp }}</span></div>
                    </header>

                    <div class="skill-list">
                        <button v-for="skill in availableSkills" :key="skill.id" class="skill-card"
                            :disabled="heroState.mp < skill.cost" @click="useSkill(skill)">
                            <div class="skill-info">
                                <div class="skill-name-row">
                                    <span class="skill-name">{{ skill.name }}</span>
                                    <span class="skill-cost-tag">{{ skill.cost }} MP</span>
                                </div>
                                <p class="skill-desc">{{ skill.desc }}</p>
                            </div>
                            <div class="skill-action-icon">✨</div>
                        </button>
                        <div v-if="availableSkills.length === 0" class="empty-skills">
                            Nenhuma habilidade aprendida ainda. Alcance níveis maiores para desbloquear!
                        </div>
                    </div>

                    <button class="btn-close-modal" @click="showSkills = false">FECHAR</button>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
    /* Keeping same styles, just logic update. Simplified for brevity in this response but implies preserving CSS */
    .game-container {
        width: 100%;
        height: 100vh;
        /* OCCUPY FULL VIEWPORT */
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        /* NO PAGE SCROLL */
        background-color: #1a1a1a;
    }

    .game-header {
        background-color: rgba(0, 0, 0, 0.3);
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #444;
    }

    .scene {
        flex: 1;
        /* GROWS TO FILL SPACE */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
        padding: 10px 40px;
        background: radial-gradient(circle at bottom, #23232c 0%, transparent 70%);
        overflow: hidden;
    }

    .character-display {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 45%;
        /* ENSURE SIDE BY SIDE */
    }

    .enemy-info {
        text-align: center;
        margin-bottom: 10px;
        color: #ff6b6b;
    }

    .empty-room {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #aaa;
    }

    .log-box {
        height: 120px;
        /* FIXED HEIGHT */
        background: rgba(0, 0, 0, 0.6);
        margin: 10px;
        padding: 10px;
        border-radius: 4px;
        overflow-y: auto;
        /* SCROLLABLE */
        font-size: 0.9rem;
        color: #ddd;
        border: 1px solid #444;
    }

    .controls {
        padding: 15px;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        min-height: 80px;
        border-top: 1px solid #444;
        flex-shrink: 0;
        /* DON'T PUSH OFF SCREEN */
    }

    .level-badge {
        position: absolute;
        bottom: -5px;
        right: -5px;
        background: var(--primary-color);
        color: white;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.75rem;
        font-weight: bold;
        border: 2px solid #222;
    }

    .stats-box {
        display: flex;
        gap: 15px;
        /* Increased gap */
        align-items: center;
        /* Center align portrait with bars */
    }

    .portrait {
        position: relative;
        /* For badge positioning */
        width: 60px;
        height: 60px;
    }

    .portrait img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid var(--primary-color);
        background: #333;
        object-fit: cover;
    }

    .bars {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        /* Tighter gap for stacked bars */
    }

    .level-display {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
    }

    .hero-name {
        font-size: 1rem;
        font-weight: bold;
        color: white;
    }

    .hp-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .bar-container {
        width: 150px;
        height: 14px;
        background: #111;
        border-radius: 7px;
        overflow: hidden;
        position: relative;
        border: 1px solid #444;
    }

    .hp-bar .bar-fill {
        background-color: var(--health-color);
    }

    .mp-bar {
        height: 12px;
        margin-top: 2px;
        width: 150px;
        /* Ensure width is explicit */
    }

    .mp-fill {
        background-color: #3498db;
    }

    .xp-container {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 2px;
    }

    .xp-bar {
        height: 6px;
        width: 120px;
        border: none;
        /* Cleaner look */
        background: #222;
    }

    .xp-fill {
        background-color: #f1c40f;
    }

    .icon-xp {
        width: 12px;
        height: 12px;
    }

    .enemy-fill {
        background-color: #e53e3e;
        height: 100%;
        transition: width 0.3s;
    }

    .bar-fill {
        height: 100%;
        transition: width 0.3s ease;
    }

    .bar-text {
        position: absolute;
        width: 100%;
        text-align: center;
        font-size: 0.65rem;
        line-height: 14px;
        /* Center vertical */
        color: white;
        text-shadow: 1px 1px 2px black;
        top: 0;
        left: 0;
        font-weight: bold;
    }

    .gear-info {
        display: flex;
        gap: 10px;
        font-size: 0.75rem;
        color: #ccc;
        background: rgba(0, 0, 0, 0.4);
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
        white-space: nowrap;
        /* Prevent wrapping */
    }

    /* Sprite Fixes */
    .battle-sprite {
        max-height: 200px;
        /* Limit height */
        max-width: 250px;
        /* Limit width */
        width: auto;
        height: auto;
        filter: drop-shadow(0 0 10px black);
        object-fit: contain;
    }

    .hero-sprite {
        transform: scaleX(-1);
    }

    .monster-sprite {
        filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.3));
    }

    /* Ensure footer buttons don't squash */
    .actions {
        display: flex;
        gap: 15px;
        width: 100%;
        justify-content: center;
        align-items: center;
    }

    .btn-action {
        padding: 12px 24px;
        font-weight: bold;
        background: #2c3e50;
        color: white;
        border: 2px solid #34495e;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 0 #1a252f;
    }

    .btn-action:active {
        transform: translateY(4px);
        box-shadow: 0 0 0 transparent;
    }

    .btn-skill {
        background: #8e44ad;
        border-color: #9b59b6;
        box-shadow: 0 4px 0 #71368a;
        font-size: 1.8rem;
        /* ENLARGED */
        padding: 8px 16px;
    }

    .btn-bag {
        background: #d35400;
        border-color: #e67e22;
        box-shadow: 0 4px 0 #a04000;
        font-size: 1.8rem;
        /* ENLARGED */
        padding: 8px 16px;
    }

    .attack-big {
        flex: 2;
        background: #c0392b;
        border-color: #e74c3c;
        box-shadow: 0 4px 0 #922b21;
        font-size: 1.2rem;
        justify-content: center;
    }

    /* Modal & Skills Styles */
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .skills-modal {
        background: #23232c;
        border: 2px solid #8257e6;
        border-radius: 12px;
        width: 90%;
        max-width: 450px;
        padding: 0;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
        background: #2d2d35;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3e3e4a;
    }

    .modal-header h3 {
        margin: 0;
        color: #8257e6;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .mp-available {
        font-size: 0.9rem;
        color: #aaa;
    }

    .mp-available span {
        color: #3498db;
        font-weight: bold;
    }

    .skill-list {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 400px;
        overflow-y: auto;
    }

    .skill-card {
        background: #2d2d35;
        border: 1px solid #3e3e4a;
        border-radius: 8px;
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        color: white;
    }

    .skill-card:hover:not(:disabled) {
        border-color: #8257e6;
        background: #353540;
        transform: translateX(5px);
    }

    .skill-card:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(1);
    }

    .skill-info {
        flex: 1;
    }

    .skill-name-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .skill-name {
        font-weight: bold;
        color: #fff;
        font-size: 1rem;
    }

    .skill-cost-tag {
        font-size: 0.8rem;
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        padding: 2px 8px;
        border-radius: 10px;
        border: 1px solid rgba(52, 152, 219, 0.3);
    }

    .skill-desc {
        margin: 0;
        font-size: 0.85rem;
        color: #aaa;
        line-height: 1.2;
    }

    .skill-action-icon {
        font-size: 1.2rem;
        margin-left: 15px;
        opacity: 0.5;
    }

    .empty-skills {
        text-align: center;
        color: #666;
        padding: 20px;
        font-style: italic;
    }

    .btn-close-modal {
        width: 100%;
        padding: 15px;
        background: #2d2d35;
        border: none;
        border-top: 1px solid #3e3e4a;
        color: #ff5555;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-close-modal:hover {
        background: #353540;
        color: #ff7777;
    }

    /* Scrollbar for skill list */
    .skill-list::-webkit-scrollbar {
        width: 6px;
    }

    .skill-list::-webkit-scrollbar-track {
        background: #1a1a1a;
    }

    .skill-list::-webkit-scrollbar-thumb {
        background: #3e3e4a;
        border-radius: 3px;
    }

    .skill-list::-webkit-scrollbar-thumb:hover {
        background: #8257e6;
    }
</style>