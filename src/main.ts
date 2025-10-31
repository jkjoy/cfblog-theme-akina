import './assets/main.css'
import './assets/lazy.css'
import 'highlight.js/styles/atom-one-light.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registerDirectives } from './directives'

const app = createApp(App)

app.use(createPinia())
app.use(router)
registerDirectives(app)

app.mount('#app')
