<script setup>
    /**
     * DiceRoller.vue - Componente de Rolagem de Dados
     * Simula a rolagem de um dado de 6 faces (D6) com animação.
     */
    import { ref, onMounted } from 'vue';

    const emit = defineEmits(['result']);

    const currentFace = ref(1); // Face atual exibida
    const isRolling = ref(true); // Controla se o dado ainda está girando
    const faces = [
        'img/dados/dice-1.png',
        'img/dados/dice-2.png',
        'img/dados/dice-3.png',
        'img/dados/dice-4.png',
        'img/dados/dice-5.png',
        'img/dados/dice-6.png'
    ];

    onMounted(() => {
        roll();
    });

    /**
     * Inicia a animação de rolagem e sorteia o resultado final após 1 segundo.
     */
    function roll() {
        isRolling.value = true;
        let rolls = 0;
        const maxRolls = 10; // 10 trocas de face a cada 100ms = 1 segundo de animação

        const interval = setInterval(() => {
            currentFace.value = Math.floor(Math.random() * 6) + 1;
            rolls++;

            if (rolls >= maxRolls) {
                clearInterval(interval);
                isRolling.value = false;
                // Envia o resultado final para o componente pai
                emit('result', currentFace.value);
            }
        }, 100);
    }
</script>


<template>
    <div class="dice-container">
        <div class="dice-box" :class="{ 'shake': isRolling }">
            <img :src="faces[currentFace - 1]" alt="Dice" class="dice-img">
        </div>
        <p v-if="isRolling" class="status">Rolando...</p>
        <p v-else class="status result">Resultado: {{ currentFace }}</p>
    </div>
</template>

<style scoped>
    .dice-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .dice-box {
        background: white;
        padding: 20px;
        border-radius: 20px;
        box-shadow: 0 0 50px rgba(255, 255, 255, 0.2);
        transition: transform 0.1s;
    }

    .dice-img {
        width: 100px;
        height: 100px;
        object-fit: contain;
    }

    .status {
        color: white;
        font-size: 1.5rem;
        margin-top: 2rem;
        font-family: 'Cinzel', serif;
    }

    .result {
        color: #4cd137;
        font-weight: bold;
        transform: scale(1.2);
        animation: pop 0.3s;
    }

    .shake {
        animation: shake 0.2s infinite;
    }

    @keyframes shake {
        0% {
            transform: translate(1px, 1px) rotate(0deg);
        }

        10% {
            transform: translate(-1px, -2px) rotate(-1deg);
        }

        20% {
            transform: translate(-3px, 0px) rotate(1deg);
        }

        30% {
            transform: translate(3px, 2px) rotate(0deg);
        }

        40% {
            transform: translate(1px, -1px) rotate(1deg);
        }

        50% {
            transform: translate(-1px, 2px) rotate(-1deg);
        }

        60% {
            transform: translate(-3px, 1px) rotate(0deg);
        }

        70% {
            transform: translate(3px, 1px) rotate(-1deg);
        }

        80% {
            transform: translate(-1px, -1px) rotate(1deg);
        }

        90% {
            transform: translate(1px, 2px) rotate(0deg);
        }

        100% {
            transform: translate(1px, -2px) rotate(-1deg);
        }
    }

    @keyframes pop {
        0% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.5);
        }

        100% {
            transform: scale(1.2);
        }
    }
</style>