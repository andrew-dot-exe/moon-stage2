<script setup>
import GameStats from './GameStats.vue'
import FinishColonizationButton from './FinishColonizationButton.vue'
</script>

<template>
  <div class="game-interface">
    <GameStats />
    <FinishColonizationButton />
  </div>
</template>

<style>
.game-interface {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
</style>