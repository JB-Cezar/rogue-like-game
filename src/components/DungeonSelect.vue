<script setup>
    /**
     * DungeonSelect.vue - Tela de Seleção de Masmorras
     * Lista as masmorras disponíveis e permite ao jogador escolher onde se aventurar.
     */
    import { gameData } from '../data/gameData';

    const emit = defineEmits(['select', 'back']);
</script>


<template>
    <div class="screen active">
        <h2>Selecione a Masmorra</h2>
        <div class="list-container">
            <div v-for="dungeon in gameData.dungeons" :key="dungeon.id" class="dungeon-item"
                @click="emit('select', dungeon)">
                <div class="dungeon-info">
                    <span class="dungeon-name">{{ dungeon.name }}</span>
                    <span class="dungeon-rooms">{{ dungeon.rooms }} salas</span>
                </div>
                <span class="difficulty" :class="dungeon.difficulty">{{ dungeon.difficulty.toUpperCase() }}</span>
            </div>
        </div>
        <button class="btn-secondary" @click="emit('back')">Voltar</button>
    </div>
</template>

<style scoped>
    .screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 500px;
        margin-bottom: 2rem;
    }

    .dungeon-item {
        padding: 1.5rem;
        background-color: var(--secondary-color);
        border-radius: var(--border-radius);
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid transparent;
        transition: all 0.2s;
    }

    .dungeon-item:hover {
        background-color: #29292e;
        border-color: var(--text-dim);
    }

    .dungeon-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .dungeon-name {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--text-color);
    }

    .dungeon-rooms {
        font-size: 0.8rem;
        color: var(--text-dim);
    }

    .difficulty {
        font-size: 0.8rem;
        font-weight: bold;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .difficulty.easy {
        color: #4cd137;
        border: 1px solid #4cd137;
    }

    .difficulty.medium {
        color: #fbc531;
        border: 1px solid #fbc531;
    }

    .difficulty.hard {
        color: #e84118;
        border: 1px solid #e84118;
    }
</style>