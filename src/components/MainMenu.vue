<script setup>
    /**
     * MainMenu.vue - Tela Inicial do Jogo
     * Gerencia os slots de salvamento (save slots) usando LocalStorage.
     */
    import { ref, onMounted } from 'vue';

    const emit = defineEmits(['start', 'load-game']);

    // Referência reativa para os 3 slots de salvamento
    const slots = ref([null, null, null]);

    // Carrega os slots assim que o componente é montado
    onMounted(() => {
        loadSlots();
    });

    /**
     * Busca os dados de salvamento no LocalStorage do navegador.
     */
    function loadSlots() {
        for (let i = 0; i < 3; i++) {
            const data = localStorage.getItem(`rpg_save_slot_${i}`);
            if (data) {
                slots.value[i] = JSON.parse(data);
            } else {
                slots.value[i] = null;
            }
        }
    }

    /**
     * Chamado ao clicar em um slot. Inicia um novo jogo ou carrega um existente.
     */
    function selectSlot(index) {
        if (slots.value[index]) {
            // Carrega jogo existente
            emit('load-game', index, slots.value[index]);
        } else {
            // Inicia novo jogo
            emit('start', index);
        }
    }

    /**
     * Deleta permanentemente um save do slot.
     */
    function deleteSlot(index, event) {
        event.stopPropagation(); // Impede que o clique no botão ative o clique no card (selectSlot)
        if (confirm("Tem certeza que deseja apagar este save?")) {
            localStorage.removeItem(`rpg_save_slot_${index}`);
            slots.value[index] = null;
        }
    }
</script>


<template>
    <div class="menu-container">
        <h1>Mini RPG Persistente</h1>

        <div class="slots-container">
            <div v-for="(slot, i) in slots" :key="i" class="slot-card" :class="{ 'empty': !slot }"
                @click="selectSlot(i)">
                <div class="slot-header">
                    <h3>Slot {{ i + 1 }}</h3>
                    <button v-if="slot" class="delete-btn" @click="deleteSlot(i, $event)">🗑️</button>
                </div>

                <div v-if="slot" class="slot-info">
                    <img :src="slot.img" class="slot-face">
                    <div>
                        <p class="slot-name">{{ slot.name }}</p>
                        <p>Nível {{ slot.level }} - {{ slot.gold }}g</p>
                    </div>
                </div>
                <div v-else class="new-game-text">
                    + Novo Jogo
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .menu-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #121214, #202024);
        color: white;
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 3rem;
        text-shadow: 0 0 10px #8257e6;
    }

    .slots-container {
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-width: 400px;
    }

    .slot-card {
        background: #2c2c31;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: transform 0.2s, border-color 0.2s;
    }

    .slot-card:hover {
        transform: scale(1.02);
        border-color: #8257e6;
    }

    .slot-card.empty {
        border-style: dashed;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100px;
        color: #666;
    }

    .slot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .delete-btn {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 5px;
    }

    .delete-btn:hover {
        background: #e74c3c;
        border-radius: 4px;
    }

    .slot-info {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .slot-face {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid #8257e6;
    }

    .slot-name {
        font-weight: bold;
        font-size: 1.1rem;
    }

    .new-game-text {
        font-size: 1.2rem;
        font-weight: bold;
    }
</style>