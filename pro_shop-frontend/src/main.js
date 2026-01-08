import { createApp } from 'vue'
import App from './views/App.vue'

import router from "./router"
import './assets/main.css';


const app = createApp(App).use(router).mount('#app')
