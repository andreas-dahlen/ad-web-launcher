import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/* -------------------------------------------------
   Resolve paths from THIS FILE (not cwd)
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// web/scripts → web
const WEB_ROOT = path.resolve(__dirname, '..')

// web → repo root
const PROJECT_ROOT = path.resolve(WEB_ROOT, '..')

const WEB_DIST = path.join(WEB_ROOT, 'dist')
const ANDROID_ASSETS = path.join(
  PROJECT_ROOT,
  'android',
  'app',
  'src',
  'main',
  'assets'
)

const SRC_INDEX = path.join(WEB_DIST, 'index.html')
const DEST_INDEX = path.join(ANDROID_ASSETS, 'index.html')

/* -------------------------------------------------
   Guards
-------------------------------------------------- */
if (!fs.existsSync(SRC_INDEX)) {
  console.error('❌ web/dist/index.html not found')
  console.error('→ Did you run `npm run build` in /web ?')
  process.exit(1)
}

/* -------------------------------------------------
   Deploy
-------------------------------------------------- */
console.log('📦 Deploying web build to Android...')

fs.mkdirSync(ANDROID_ASSETS, { recursive: true })

if (fs.existsSync(DEST_INDEX)) {
  fs.unlinkSync(DEST_INDEX)
  console.log('🗑 Removed old index.html')
}

fs.copyFileSync(SRC_INDEX, DEST_INDEX)

console.log('✅ Asset updated successfully')

console.log(`✅ Asset updated successfully [DEBUG]:${import.meta.env.VITE_DEBUG}`)
