import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

window.addEventListener('contextmenu', (event) => {
  event.preventDefault()
})

window.addEventListener('keydown', (event) => {
  const key = event.key.toUpperCase()
  if ((event.ctrlKey && key === 'R') || key === 'F5')
    event.preventDefault()
})

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')
