// Sube un PDF a Vercel Blob y muestra las URLs para pegar en src/data/books.json
// Uso: node --env-file=.env.local scripts/upload-book.mjs "ruta/al/libro.pdf"
import { put } from '@vercel/blob'
import { readFile } from 'fs/promises'
import { basename } from 'path'

const filePath = process.argv[2]
if (!filePath) {
  console.error('Uso: node --env-file=.env.local scripts/upload-book.mjs "ruta/al/libro.pdf"')
  process.exit(1)
}

const file = await readFile(filePath)
const { url, downloadUrl } = await put(basename(filePath), file, {
  access: 'public',
  contentType: 'application/pdf',
  addRandomSuffix: true,
})

console.log('\nAgrega esto a la entrada del libro en src/data/books.json:\n')
console.log(`  "viewLink": "${url}",`)
console.log(`  "downloadLink": "${downloadUrl}"`)
