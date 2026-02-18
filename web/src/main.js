// main.js
import { createApp } from 'vue'
import App from './App.vue'

import './styles/main.css'
import { APP_SETTINGS } from './config/appSettings'
import { log } from './debug/functions'

// Platform bridge initializes Android touch bridge (browser listeners owned by App.vue)
// import { initPlatformBridge } from './interaction/input/inputSource'
// import { exportCSS } from './config/exportSettings'

if (APP_SETTINGS.debugPanel) {
	log('init', 'DEBUG MODE')
} else {
	log('init', 'PROD MODE')
}

function applyRuntimeLayout() {
	// exportCSS()
	// Reuse existing scaling logic by simulating a resize when dimensions change
	window.dispatchEvent(new Event('layout:refresh'))
}

// Create and mount the Vue app
const app = createApp(App)
app.mount('#app')

// Initialize platform bridge after Vue mounts (Android bridge needs DOM ready)
// initPlatformBridge()

// Apply CSS variables from JS after DOM is ready
applyRuntimeLayout()

// Refresh layout when Android injects device dimensions
window.addEventListener('phone:metrics', applyRuntimeLayout)