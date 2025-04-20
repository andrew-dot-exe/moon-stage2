<script setup>
// данная кнопка в таком стиле пока одна-единственная,
// так что пусть будет оформлена так.

function performClick(event) {
    console.log("got clickd");
}

</script>

<template>
    <button class="colonize-button" @click="performClick">
        <div class="button-contents">
            <span id="button-label">Колонизировать</span>
            <img src="/src/assets/arrow.svg">
        </div>

    </button>
</template>

<style>
.colonize-button {
    display: inline-flex;
    padding: 5px 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #BCFE37;
}

.button-contents {
    display: flex;
    align-items: center;
    gap: 20px;
    align-self: stretch;
}

#button-label {
    color: var(--, #000);
    font-feature-settings: 'dlig' on;
    font-family: "Feature Mono";
    font-size: 15px;
    font-style: normal;
    font-weight: 80;
    line-height: normal;
    letter-spacing: 0.75px;
}

#button-arrow {
    width: 10px;
    height: 10px;
    aspect-ratio: 1/1;
    fill: var(--, #000);
}
</style>