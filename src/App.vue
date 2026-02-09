<script setup>
  /**
   * App.vue - Ponto de entrada principal do componente Vue.
   * Gerencia o estado global do jogo, como o herói selecionado, 
   * a masmorra ativa e a navegação entre as telas.
   */
  import { ref } from 'vue';
  import MainMenu from './components/MainMenu.vue';
  import CharacterSelect from './components/CharacterSelect.vue';
  import DungeonSelect from './components/DungeonSelect.vue';
  import GameScreen from './components/GameScreen.vue';
  import TownScreen from './components/TownScreen.vue';

  // Estados reativos para controlar a navegação e o progresso
  const currentScreen = ref('menu'); // Telas: menu, character-select, town, dungeon-select, game
  const selectedHero = ref(null);    // Dados do herói atual
  const selectedDungeon = ref(null); // Dados da masmorra atual
  const activeSlot = ref(null);      // Slot de salvamento ativo (0, 1 ou 2)

  /**
   * Inicia um novo jogo em um slot específico.
   * Muda para a tela de seleção de personagem.
   */
  function onNewGame(slotIndex) {
    activeSlot.value = slotIndex;
    currentScreen.value = 'character-select';
  }

  /**
   * Carrega um jogo salvo de um slot.
   * Define o herói e leva o jogador para a cidade.
   */
  function onLoadGame(slotIndex, heroData) {
    activeSlot.value = slotIndex;
    selectedHero.value = heroData;
    currentScreen.value = 'town';
  }

  /**
   * Chamado quando um novo personagem é escolhido.
   * Define os atributos iniciais do herói.
   */
  function onHeroSelected(hero) {
    // Estado inicial para um novo herói
    selectedHero.value = {
      ...hero,
      gold: 100,
      xp: 0,
      level: 1,
      items: [
        { name: 'Poção de Vida', type: 'heal', value: 50, price: 20, desc: 'Recupera 50 HP' }
      ],
      weapon: hero.weapon,
      armor: hero.armor
    };
    saveGame(); // Salva imediatamente após a criação
    currentScreen.value = 'town';
  }

  // Navegação para a seleção de masmorra
  function onGoDungeon() {
    currentScreen.value = 'dungeon-select';
  }

  // Define a masmorra escolhida e inicia o jogo
  function onDungeonSelected(dungeon) {
    selectedDungeon.value = dungeon;
    currentScreen.value = 'game';
  }

  // Volta para a tela da cidade
  function onBackToTown() {
    currentScreen.value = 'town';
  }

  // Reseta o jogo e volta para o menu principal
  function onBackToMenu() {
    currentScreen.value = 'menu';
    selectedHero.value = null;
    activeSlot.value = null;
  }

  // Atualiza e salva o estado do herói (chamado pelo GameScreen)
  function onGameSaved(heroState) {
    if (heroState) selectedHero.value = heroState;
    saveGame();
  }

  /**
   * Salva os dados do herói no LocalStorage do navegador.
   */
  function saveGame() {
    if (activeSlot.value !== null && selectedHero.value) {
      localStorage.setItem(`rpg_save_slot_${activeSlot.value}`, JSON.stringify(selectedHero.value));
      console.log("Jogo salvo no Slot " + activeSlot.value);
    }
  }

  /**
   * Lógica de vitória: atualiza o herói, salva e volta para a cidade.
   */
  function onVictory(updatedHero) {
    selectedHero.value = updatedHero;
    saveGame();
    currentScreen.value = 'town';
  }

  /**
   * Lógica de morte (Permadeath): deleta o save e volta para o menu.
   */
  function onPermadeath() {
    if (activeSlot.value !== null) {
      localStorage.removeItem(`rpg_save_slot_${activeSlot.value}`);
    }
    alert("VOCÊ MORREU! Seu save foi deletado para sempre.");
    currentScreen.value = 'menu';
    selectedHero.value = null;
  }
</script>


<template>
  <main id="app-container">
    <Transition name="fade" mode="out-in">
      <MainMenu v-if="currentScreen === 'menu'" @start="onNewGame" @load-game="onLoadGame" />

      <CharacterSelect v-else-if="currentScreen === 'character-select'" @select="onHeroSelected" @back="onBackToMenu" />

      <TownScreen v-else-if="currentScreen === 'town'" :hero="selectedHero" @go-dungeon="onGoDungeon"
        @save-game="saveGame" />

      <DungeonSelect v-else-if="currentScreen === 'dungeon-select'" @select="onDungeonSelected" @back="onBackToTown" />

      <GameScreen v-else-if="currentScreen === 'game'" :hero="selectedHero" :dungeon="selectedDungeon"
        @victory="onVictory" @game-over="onPermadeath" />
    </Transition>
  </main>
</template>

<style>
  #app-container {
    width: 100vw;
    max-width: 800px;
    height: 90vh;
    background-color: var(--surface-color);
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>