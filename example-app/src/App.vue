<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <br/>
    <button @click="destroySocket">toggle socket components</button>
    <SocketDemo v-if="socketShow" msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SocketDemo from "./components/SocketInitDemo/index.vue";

@Component({
  components: {
    SocketDemo
  }
})
export default class App extends Vue {
  socketShow: boolean = false;
  destroySocket() {
    this.socketShow = !this.socketShow;
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
