<script setup>
import { ref } from 'vue'

// controls import


</script>

<template>
    <div class="block">
        <div class="block-text-1">
            <h1 class="h">О проекте</h1>
            <p class="p">В рамках какого конкурса был создан оект и кем</p>
        </div>
        <div class="block-text-2">
            <h1 class="h">Почему луна?</h1>
            <p class="p">Почему была выбрана луна и чем она может быть полезна для коллонизации</p>
        </div>
        <div class="block-text-3">
            <h1 class="h">Наш подход</h1>
            <p class="p">Чем мы в команде руководстовались при разработке и кто состоит в команде</p>
        </div>
    </div>
</template>

<style scoped>
.block {
    display: flex;
    width: 300px;
    flex-direction: column;
    align-items: flex-start;
    gap: 21px;
    margin-top: -124px;
}
.block-text-1, .block-text-2, .block-text-3 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    align-self: stretch;
}
h1 {
    align-self: stretch;
    color: #646464;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 1px;
    margin: 0;
}
p {
    align-self: stretch;
    color: #464646;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 0.75px;
    margin: 0;
    }
</style>
