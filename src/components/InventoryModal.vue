<script setup>
    /**
     * InventoryModal.vue - Modal da Mochila / Inventário
     * Mostra o ouro e os itens que o herói possui. 
     * Permite usar itens (como poções) durante a aventura ou na cidade.
     */
    defineProps(['isOpen', 'gold', 'items']);
    const emit = defineEmits(['close', 'use-item']);
</script>


<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Mochila</h2>
                <button class="close-btn" @click="emit('close')">X</button>
            </div>

            <div class="assets-row">
                <span class="gold-display">💰 {{ gold }} Ouro</span>
            </div>

            <div class="items-list">
                <p v-if="items.length === 0" class="empty-msg">Sua mochila está vazia...</p>

                <div v-for="(item, index) in items" :key="index" class="item-card" @click="emit('use-item', index)">
                    <span class="item-icon">🧪</span>
                    <div class="item-info">
                        <span class="item-name">{{ item.name }}</span>
                        <span class="item-desc">{{ item.desc }}</span>
                    </div>
                    <button class="btn-use">Usar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 200;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: #202024;
        width: 90%;
        max-width: 400px;
        height: 70%;
        border-radius: 12px;
        border: 2px solid #8257e6;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }

    .close-btn {
        background: transparent;
        color: #e1e1e6;
        font-size: 1.2rem;
        padding: 5px 10px;
    }

    .assets-row {
        font-size: 1.2rem;
        color: #fbc531;
        font-weight: bold;
        margin-bottom: 15px;
        padding: 10px;
        background: #121214;
        border-radius: 8px;
        text-align: center;
    }

    .items-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .empty-msg {
        color: #666;
        text-align: center;
        margin-top: 20px;
    }

    .item-card {
        background: #2c2c31;
        padding: 10px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .item-card:hover {
        background: #323238;
    }

    .item-icon {
        font-size: 2rem;
    }

    .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .item-name {
        font-weight: bold;
        color: #e1e1e6;
    }

    .item-desc {
        font-size: 0.8rem;
        color: #a8a8b3;
    }

    .btn-use {
        padding: 5px 10px;
        font-size: 0.8rem;
        background: #8257e6;
        color: white;
        border-radius: 4px;
    }
</style>