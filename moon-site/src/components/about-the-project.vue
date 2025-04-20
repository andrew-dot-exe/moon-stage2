<script setup>
import { ref } from 'vue'

</script>

<template>
    <div class="info-block">
        <h1>О проекте</h1>
        <div class="paragrah">
            <div class="text">
                <p>
                    В рамках конкурса “Миссия: Луна” было разработано веб-решение, которое на основе научного подхода с добавлением элементов геймификации позволяет смоделировать колонизацию Луны и изучить, как это может происходить на основе научных источников.
                </p>
                <p>
                    Колонизация в контексте веб решения - это процесс освоения и заселение планеты человеком. В процессе колонизации человек заселяет планету и осваивает ее, тем самым, превращая планету в инструмент для исследований и источник многих полезных веществ
                </p>
            </div>
            <div class="button">
                <div class="button-text">
                    <p class="button-text-p">Страница конкурса</p>
                </div>
                <div class="button-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                        <path d="M0 26L21.0894 5.58334L20.6414 5.13534L0 4V2V0L26.7851 0.527344L29.729 3.47134L30 29.9994H28.0001H26.0002L25.1212 9.61534L24.6732 9.16734L3.99982 30L0 26Z" fill="#A3A3A3"/>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 48px;
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
    margin: 0;
}
.paragrah {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 28px;
    align-self: stretch;
}
.text {
    display: flex;
    align-items: flex-start;
    gap: 64px;
    align-self: stretch;
}
.text p{
    color: #FFF;
    text-align: justify;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.8px;
    margin: 0;
    text-indent: 50px; 
}
p {
    color: #FFF;
    text-align: justify;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: 0.8px;
    margin: 0;
}
.button {
    display: flex;
    align-items: center;
    align-self: stretch;
}
.button-text {
    display: flex;
    padding: 10px 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex: 1 0 0;
    border: 1px solid #A3A3A3;
}
.button-text-p {
    color: #A3A3A3;
    font-feature-settings: 'dlig' on;
    font-family: Inter;
    font-size: 15px;
    font-style: normal;
    font-weight: 900;
    line-height: normal;
    letter-spacing: 0.75px;
    text-transform: uppercase;
    margin: 0;
}
.button-icon {
    display: flex;
    padding: 0px 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-self: stretch;
    border-top: 1px solid#A3A3A3;
    border-right: 1px solid #A3A3A3;
    border-bottom: 1px solid #A3A3A3;
}

.button-icon svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    fill: #BCFE37;
}

@media (max-width: 768px) {
  .text {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .text p {
    flex: unset;
    min-width: 0;
    text-indent: 24px;
    font-size: 14px;
  }
  svg {
    width: 100%;
    height: auto;
    max-width: 180px;
  }
  .button-icon {
    padding: 0 8px;
  }
}
</style>