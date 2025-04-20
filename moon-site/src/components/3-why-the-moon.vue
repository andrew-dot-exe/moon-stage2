<script setup>
import { ref } from 'vue'

// controls import
// import colonizeButton from './controls/button-colonize.vue';

</script>

<template>
    <div>
        <h1>
        Почему луна?
        </h1>
        <p>
            Луна - это самая близкая к Земле планета. До нее можно долететь всего лишь за 4 дня. Это сравнительно небольшое расстояние, потому что до Марса лететь приблизительно полгода. Это важно, поскольку если в процессе миссии произойдут какие-либо непредвиденные обстоятельства, команда сможет достаточно быстро вернуться домой, на Землю.
        </p>
        <p>
            В будущем Луна может стать опорным пунктом для дальнейших космических исследований. Гравитация на Луне составляет 16% от гравитации Земли и сама Луна находтся ближе к другим планетам. Тем самым, Луну можно будет использовать как площадку для запуска космических кораблей на другие планеты, причем запуск будет более простым и экономным по топливу, ввиду меньшей гравитации.
        </p>
    </div>
</template>

<style scoped>
div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 64px;
    align-self: stretch;
}
h1 {
    color: #FFF;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 64px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 3.2px;
}
p {
    color: #FFF;
    text-align: justify;
    font-family: Inter;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 1px;
    text-indent: 50px; 
}
</style>