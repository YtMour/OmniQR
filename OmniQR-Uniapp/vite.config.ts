import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

process.env.UNI_INPUT_DIR = projectRoot
process.env.VITE_ROOT_DIR = projectRoot

export default defineConfig({
	root: projectRoot,
	envDir: projectRoot,
	plugins: [uni()]
})
