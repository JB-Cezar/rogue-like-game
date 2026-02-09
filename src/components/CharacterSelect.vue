<script setup>
    /**
     * CharacterSelect.vue - Tela de Seleção de Herói
     * Mostra as classes disponíveis do gameData e permite o jogador escolher uma.
     */
    import { gameData } from '../data/gameData';

    const emit = defineEmits(['select', 'back']);

    /**
     * Envia o herói escolhido para o componente pai (App.vue).
     */
    function selectHero(hero) {
        emit('select', hero);
    }
</script>


<template>
    <div class="screen active">
        <h2>Escolha seu Herói</h2>
        <div class="grid-container">
            <div v-for="hero in gameData.heroes" :key="hero.id" class="char-card" @click="selectHero(hero)">
                <img :src="hero.img" :alt="hero.name">
                <h3>{{ hero.name }}</h3>
                <p class="stats">HP: {{ hero.hp }} | Atk: {{ hero.atk }}</p>
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

    .grid-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        /* 3 columns for better layout */
        gap: 1rem;
        width: 100%;
        max-width: 700px;
        margin-bottom: 2rem;
        overflow-y: auto;
        padding: 10px;
    }

    .char-card {
        background-color: var(--secondary-color);
        padding: 1rem;
        border-radius: var(--border-radius);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .char-card img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        margin-bottom: 0.5rem;
    }

    .char-card:hover {
        border-color: var(--primary-color);
        background-color: #29292e;
        transform: scale(1.05);
    }

    .stats {
        font-size: 0.8rem;
        color: var(--text-dim);
        margin-top: 5px;
    }
</style>