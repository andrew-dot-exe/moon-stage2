<script setup>
import { ref } from 'vue'
import ProjectButton from './controls/project-button.vue';

</script>

<template>
    <div class="template-holder">
        <div class="about-project-header">
            <h1>О проекте</h1>
            <hr class="delimeter">
        </div>
        <div class="about-holder">
            <div class="text-holder-620px">
                <span id="text">В рамках конкурса “Миссия: Луна” было разработано веб-решение, которое на основе
                    научного
                    подхода с
                    добавлением элементов геймификации позволяет смоделировать колонизацию Луны и изучить, как это может
                    происходить на основе научных источников.</span>
            </div>
            <div class="text-holder-620px">
                <span id="text">Колонизация в контексте веб решения - это процесс освоения и заселение планеты
                    человеком. В
                    процессе
                    колонизации человек заселяет планету и осваивает ее, тем самым, превращая планету в инструмент для
                    исследований и источник многих полезных веществ.</span>
            </div>
        </div>
        <ProjectButton/>
    </div>
</template>

<style scoped>
.template-holder {
    display: flex;
    flex-direction: column;
    gap: 50px;
}

h1 {
    color: #fff;
    font-family: 'Inter';
    font-size: 64px;
}

.about-holder {
    display: flex;
    align-self: center;
    align-items: center;
    justify-content: center;
    gap: 80px;
    flex-direction: row;
}

.text-holder-620px {
    width: 620px;
    text-align: justify;
    line-height: normal;
    letter-spacing: 0.8px;
}

span#text {
    color: #FFF;
    text-align: justify;
    font-family: 'Inter';
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.8px;
}
</style>