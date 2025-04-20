<script setup>
import logoButton from './components/1-1-logo-button.vue';  
import websiteContent from './components/website-content.vue';
import aboutTheProject from './components/about-the-project.vue';
import ourSolutions from './components/our-solutions.vue';
import whyTheMoon from './components/3-why-the-moon.vue';
</script>

<template>
    <div class="first-block">
        <logoButton></logoButton>
        <websiteContent></websiteContent>
    </div>
    <div class="block_ATP">
        <aboutTheProject></aboutTheProject>
        <ourSolutions></ourSolutions>
    </div>
    <whyTheMoon></whyTheMoon>

</template>

<style scoped>

.first-block{
    display: flex;
    min-height: 734px;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
}
.block_ATP {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 52px;
    align-self: stretch;
}
@media (max-width: 768px) {
    .first-block {
        min-height: unset;
        padding: 16px 8px;
        gap: 24px;
    }
    .block_ATP {
        gap: 24px;
        padding: 0 8px;
    }
}
</style>