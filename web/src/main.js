// main.js
import { createApp } from 'vue'
import App from './App.vue'

import './styles/main.css'
import { APP_SETTINGS } from './config/appSettings'
import { log } from './debug/functions'

if (APP_SETTINGS.debugPanel) {
	log('init', 'DEBUG MODE')
} else {
	log('init', 'PROD MODE')
}

// Create and mount the Vue app
const app = createApp(App)
app.mount('#app')