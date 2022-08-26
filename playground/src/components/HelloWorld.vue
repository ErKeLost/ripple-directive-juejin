<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div>{{ msg }}</div>
  <div class="ripple-button">
    <div class="ripple-html-element" v-ripple="{ center: true }">
      {{ msg }} HTML元素中使用v-ripple
    </div>
  </div>
  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.ripple-button {
  margin-top: 1.5rem;
  display: flex;
}
.ripple-html-element {
  font-size: 1.5rem;
  font-weight: bold;
  width: 100%;
  height: 150px;
  text-align: center;
  line-height: 150px;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
    rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  user-select: none;
  padding: 0 30px;
}
</style>
