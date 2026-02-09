<script setup>
    /**
     * TownScreen.vue - Tela da Cidade (Hub Principal)
     * Permite ao jogador comprar equipamentos, consumir poções e 
     * descansar para restaurar HP antes de ir para as masmorras.
     */
    import { ref, computed } from 'vue';
    import { gameData } from '../data/gameData';

    const props = defineProps(['hero']);
    const emit = defineEmits(['go-dungeon', 'save-game']);

    const activeShop = ref(null); // Controla qual loja está aberta: 'blacksmith', 'alchemist', ou null
    const message = ref("Bem-vindo à Cidade de Valória!");

    // Imagens dos NPCs (Reaproveitando sprites dos heróis)
    const blacksmithImg = gameData.heroes.find(h => h.id === 'guerreiro').img;
    const alchemistImg = gameData.heroes.find(h => h.id === 'druida').img;

    // Listas filtradas de itens para as lojas (apenas itens com preço > 0)
    const weaponList = Object.values(gameData.weapons).filter(w => w.price > 0).sort((a, b) => a.price - b.price);
    const armorList = Object.values(gameData.armors).filter(a => a.price > 0).sort((a, b) => a.price - b.price);
    const consumableList = gameData.shopItems;

    /**
     * Tenta comprar um item. Verifica o ouro e equipa automaticamente se for arma/armadura.
     */
    function buyItem(item, type) {
        if (props.hero.gold >= item.price) {
            props.hero.gold -= item.price;
            message.value = `Comprou ${item.name}!`;

            if (type === 'weapon') {
                props.hero.weapon = item.id; // Equipa a arma nova na hora
                message.value += " (Equipado)";
            } else if (type === 'armor') {
                props.hero.armor = item.id; // Equipa a armadura nova na hora
                message.value += " (Equipado)";
            } else {
                // Item consumível (poção, bomba) vai para a mochila
                props.hero.items.push({ ...item });
            }
            emit('save-game'); // Salva o progresso após a compra
        } else {
            message.value = "Ouro insuficiente!";
        }
    }

    /**
     * Descansa na estalagem por 10 ouro para restaurar todo o HP.
     */
    function restAtInn() {
        if (props.hero.gold >= 10) {
            props.hero.gold -= 10;
            props.hero.hp = props.hero.maxHp;
            message.value = "Você dormiu bem. HP restaurado.";
            emit('save-game');
        } else {
            message.value = "Sem dinheiro para a estalagem (10g).";
        }
    }
</script>


<template>
    <div class="town-container">
        <header class="town-header">
            <h1>🏰 Cidade de Valória</h1>
            <div class="hero-status">
                <span class="gold">💰 {{ hero.gold }}</span>
                <span>❤️ {{ Math.ceil(hero.hp) }}/{{ hero.maxHp }}</span>
                <span>🎒 {{ hero.items.length }} itens</span>
            </div>
        </header>

        <main class="town-square">
            <div class="dialog-box">
                <p>{{ message }}</p>
            </div>

            <!-- Shops Interface -->
            <div v-if="activeShop === 'blacksmith'" class="shop-window">
                <div class="npc-header">
                    <img :src="blacksmithImg" class="npc-face">
                    <div>
                        <h3>Ferreiro Bóris</h3>
                        <p>"Aço forte para quem tem ouro!"</p>
                    </div>
                    <button class="close-btn" @click="activeShop = null">Sair</button>
                </div>
                <div class="shop-items">
                    <h4>Armas</h4>
                    <div v-for="w in weaponList" :key="w.id" class="shop-item" @click="buyItem(w, 'weapon')">
                        <span>{{ w.name }}</span>
                        <span>⚔️ +{{ w.hitBonus }}</span>
                        <span class="price">{{ w.price }}g</span>
                    </div>
                    <h4>Armaduras</h4>
                    <div v-for="a in armorList" :key="a.id" class="shop-item" @click="buyItem(a, 'armor')">
                        <span>{{ a.name }}</span>
                        <span>🛡️ {{ a.ac }}</span>
                        <span class="price">{{ a.price }}g</span>
                    </div>
                </div>
            </div>

            <div v-else-if="activeShop === 'alchemist'" class="shop-window">
                <div class="npc-header">
                    <img :src="alchemistImg" class="npc-face">
                    <div>
                        <h3>Alquimista Elara</h3>
                        <p>"Poções e mistérios..."</p>
                    </div>
                    <button class="close-btn" @click="activeShop = null">Sair</button>
                </div>
                <div class="shop-items">
                    <div v-for="(item, i) in consumableList" :key="i" class="shop-item"
                        @click="buyItem(item, 'consumable')">
                        <div>
                            <span style="font-weight:bold">{{ item.name }}</span>
                            <span style="font-size:0.8rem; display:block; color:#aaa">{{ item.desc }}</span>
                        </div>
                        <span class="price">{{ item.price }}g</span>
                    </div>
                </div>
            </div>

            <!-- Main Options -->
            <div v-else class="building-menu">
                <div class="building-card" @click="activeShop = 'blacksmith'">
                    <span class="icon">⚔️</span>
                    <h3>Ferreiro</h3>
                </div>
                <div class="building-card" @click="activeShop = 'alchemist'">
                    <span class="icon">🧪</span>
                    <h3>Alquimista</h3>
                </div>
                <div class="building-card" @click="restAtInn">
                    <span class="icon">🍺</span>
                    <h3>Estalagem (10g)</h3>
                </div>
                <div class="building-card adventure" @click="emit('go-dungeon')">
                    <span class="icon">💀</span>
                    <h3>Masmorras</h3>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
    .town-container {
        width: 100%;
        height: 100%;
        background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/img/wall.jpg');
        /* fallback if image missing */
        background-color: #2c3e50;
        display: flex;
        flex-direction: column;
        color: white;
    }

    .town-header {
        background: #1a1a1d;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #aaa;
    }

    .gold {
        color: gold;
        font-weight: bold;
    }

    .town-square {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .dialog-box {
        background: rgba(0, 0, 0, 0.6);
        padding: 10px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #555;
        min-width: 300px;
        text-align: center;
    }

    .building-menu {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        width: 100%;
        max-width: 600px;
    }

    .building-card {
        background: #34495e;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.2s;
        border: 2px solid #2c3e50;
    }

    .building-card:hover {
        transform: translateY(-5px);
        background: #415b76;
        border-color: #f1c40f;
    }

    .building-card.adventure {
        background: #c0392b;
        grid-column: span 2;
    }

    .icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 10px;
    }

    /* Shop Styles */
    .shop-window {
        background: #202024;
        width: 100%;
        max-width: 500px;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid #8257e6;
    }

    .npc-header {
        background: #2c2c31;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .npc-face {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid white;
    }

    .close-btn {
        margin-left: auto;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
    }

    .shop-items {
        padding: 15px;
        max-height: 300px;
        overflow-y: auto;
    }

    .shop-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #333;
        cursor: pointer;
    }

    .shop-item:hover {
        background: #333;
    }

    .price {
        color: gold;
        font-weight: bold;
    }
</style>