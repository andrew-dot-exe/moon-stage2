<script setup>
import { ref } from 'vue'

// controls import
// import colonizeButton from './controls/button-colonize.vue';

</script>

<template>
  <div class="logo-block">
    <div class="button-holder">
          <colonizeButton/>
    </div>
    <div class="logo">
      <div class="logo-main">
        <svg xmlns="http://www.w3.org/2000/svg" width="1320" height="282" viewBox="0 0 1320 282" fill="none">
          <path d="M1102 0L1236.58 159.478H1237.36V0H1320V281.85H1237.36L1102.78 122.372H1102V281.85H1019.36V0H1102Z" fill="white"/>
          <path d="M0 0H85.3208L178.112 179.611H178.898L271.69 0H357.011V281.85H274.442V154.347H273.656L203.669 281.85H153.342L83.3549 154.347H82.5685V281.85H0V0Z" fill="white"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M368.754 138.75C368.754 226.609 427.926 280.172 528.326 280.172L847.662 281.851C948.062 281.851 1007.62 229.967 1007.62 142.108C1007.62 53.8697 948.248 1.36309 847.853 0.307389C782.081 -0.384231 688.09 0.307449 688.09 0.307449H528.326C427.926 0.30473 368.754 50.5117 368.754 138.75ZM528.47 216.085C481.132 216.085 453.144 186.466 453.144 138.75C453.144 90.6543 481.133 65.7652 528.47 65.7652H847.9C895.619 65.7652 923.63 94.0122 923.63 142.108C923.63 189.824 895.619 216.085 847.9 216.085H528.47Z" fill="white"/>
          <path d="M735.16 65.7652H838.505L641.21 216.085L537.865 216.05L735.16 65.7652Z" fill="white"/>
        </svg>
      </div>
      <div class="moon">
        <img class="moon-photo" src="/src/assets/moon.png" alt="" srcset="" >
      </div>
    </div>
  </div>
</template>

<style scoped>

.logo-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}
.button-holder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
  align-self: stretch;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
}
.logo-main {
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  margin-bottom: -156px;
}
.logo-main svg {
  width: 100%;
  height: 100%;
}
.moon {
  /*
  display: flex;
  height: 400px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  */
  display: flex;
  width: 100%;
  max-width: 100vw;
  justify-content: center;
  align-items: center;
  height: 400px;
}
.moon-photo {
  /*
  width: 400px;
  height: 400px;
  flex-shrink: 0;
  object-fit: contain;
  */
  width: 100%;
  max-width: 350px;
  min-width: 0;
  height: auto;
  object-fit: contain;
  display: block;
}

.labels{
  margin-top: -120px;
  width: 300px;
}

.label-heading {
  align-self: stretch;
  color: #646464;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 20pt;
  line-height: normal;
  letter-spacing: 1px;
}

.label-description {
  align-self: stretch;
  color: #464646;
  font-family: 'Inter';
  font-weight: 300;
  font-size: 12pt;
  
}
@media (max-width: 900px) {
  .logo-main {
    margin-bottom: -12vw;
  }
  .logo-main,
  .moon {
    max-width: 80vw;
  }
  .moon-photo {
    max-width: 40vw;
    min-width: 80px;
  }
}

@media (max-width: 600px) {
  .logo-main {
    margin-bottom: -20vh;
  }
  .logo-main,
  .moon {
    max-width: 95vw;
  }
  .moon-photo {
    max-width: 30vw;
    min-width: 60px;
  }
}
/* 
@media (max-width: 768px) {
  .moon {
    height: auto;
    min-height: 120px;
    padding: 0;
  }
  .moon-photo {
    width: 80vw;
    max-width: 260px;
    min-width: 80px;
    margin: 0 auto;
    display: block;
  }
}
*/
</style>
