import { createApp } from 'vue'
import ripple from 'ripple'
import './style.css'
import App from './App.vue'
console.log(ripple)

createApp(App).use(ripple).mount('#app')
