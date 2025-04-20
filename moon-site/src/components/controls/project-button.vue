<script setup>
// данная кнопка в таком стиле пока одна-единственная,
// так что пусть будет оформлена так.

function performClick(event) {
    console.log("got clickd");
}

</script>

<template>
    <button class="project-button" @click="performClick">
        <div class="project-btn-contents">
            <div class="btn-cont-text">
                <span id="project-btn-label">Страница проекта</span>
            </div>
            <div class="btn-cont-arrow">
                <img src="/src/assets/arrow52a3.svg">
            </div>

        </div>

    </button>
</template>

<style>
.project-btn-contents {
    display: flex;
    width: 1352px;
    height: 52px;
}

.project-button {
    display: flex;
    border: 1px solid #A3A3A3;
    background-color: #000;
    color: #fff;

}

.btn-cont-text {
    display: flex;
    align-items: center;
    height: 52px;
    justify-content: center;
    gap: 10px;
    flex: 1 0 0;
}

.btn-cont-arrow {
    /* border-top: 1px solid #A3A3A3;
    border-right: 1px solid #A3A3A3;
    border-bottom: 1px solid #A3A3A3; */
    display: flex;
    width: 52px;
    height: 52px;
    align-items: center;

    gap: 10px;
    flex-shrink: 0;
}

#btn-cont-arrow-image {
    width: 30px;
    height: 30px;
    fill: blue;
}

#project-btn-label {
    color: #A3A3A3;
    font-family: 'Inter';
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: 1px;
    text-transform: uppercase;
}
</style>