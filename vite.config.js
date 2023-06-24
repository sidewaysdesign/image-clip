import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs-extra'
import path from 'path'

const buildDirectoryName = 'quicktrim'
const filesToMove = ['popup.html', 'manifest.json', 'content.js', 'icon.png']

async function moveFilesToDist() {
  const currentFileUrl = import.meta.url
  const currentDirPath = path.dirname(new URL(currentFileUrl).pathname)

  for (const fileName of filesToMove) {
    const sourceFilePath = path.resolve(currentDirPath, fileName)
    const destinationFilePath = path.resolve(currentDirPath, buildDirectoryName, fileName)
    await fs.copy(sourceFilePath, destinationFilePath)
  }
}

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: buildDirectoryName,
    rollupOptions: {
      plugins: [
        {
          name: 'move-files',
          writeBundle() {
            moveFilesToDist()
          }
        }
      ],
      input: {
        app: './index.html'
      },
      output: {
        app: 'index.html'
      }
    }
  }
})
