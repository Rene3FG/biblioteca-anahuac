// Sube los PDFs reales (definidos en books-source.json) a Cloudflare R2 usando
// la API S3-compatible (soporta archivos grandes vía multipart upload) y
// escribe src/data/books.json con las URLs resultantes.
// Uso: node --env-file=.env.local scripts/migrate-books.mjs
import { readFile, writeFile, readdir } from 'fs/promises'
import { createReadStream } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { join, dirname, basename } from 'path'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

const execFileAsync = promisify(execFile)
const STAGING_DIR = '/home/bebecho/biblioteca-anahuac-libros'

const { CF_ACCOUNT_ID, CF_R2_BUCKET, CF_R2_PUBLIC_URL, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY } = process.env
if (!CF_ACCOUNT_ID || !CF_R2_BUCKET || !CF_R2_PUBLIC_URL || !CF_R2_ACCESS_KEY_ID || !CF_R2_SECRET_ACCESS_KEY) {
  throw new Error('Faltan variables CF_* en .env.local (CF_R2_ACCESS_KEY_ID / CF_R2_SECRET_ACCESS_KEY)')
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: CF_R2_ACCESS_KEY_ID, secretAccessKey: CF_R2_SECRET_ACCESS_KEY },
})

// Los archivos extraídos del zip mezclan formas Unicode NFC/NFD para los
// acentos (incluso dentro de la misma carpeta), así que no basta con normalizar
// a una sola forma: buscamos el nombre real comparando en NFC.
async function resolveRealPath(relPath) {
  const dir = join(STAGING_DIR, dirname(relPath))
  const wantedName = basename(relPath).normalize('NFC')
  const entries = await readdir(dir)
  const match = entries.find(e => e.normalize('NFC') === wantedName)
  if (!match) throw new Error(`No se encontró "${relPath}" en ${dir}`)
  return join(dir, match)
}

function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
}

async function existsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: CF_R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function uploadToR2(key, filePath) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: CF_R2_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: 'application/pdf',
    },
    queueSize: 4,
    partSize: 50 * 1024 * 1024,
  })
  await upload.done()
  return `${CF_R2_PUBLIC_URL}/${key}`
}

const source = JSON.parse(await readFile(new URL('./books-source.json', import.meta.url), 'utf-8'))
const results = []

for (const book of source) {
  const filePath = await resolveRealPath(book.file)
  process.stdout.write(`Subiendo [${book.id}] ${book.title}... `)

  const { stdout } = await execFileAsync('pdfinfo', [filePath], {
    env: { ...process.env, LC_ALL: 'en_US.UTF-8' },
  })
  const pagesMatch = stdout.match(/^Pages:\s+(\d+)/m)
  const pages = pagesMatch ? Number(pagesMatch[1]) : undefined

  const key = `${String(book.id).padStart(2, '0')}-${slugify(book.title)}.pdf`
  const publicUrl = `${CF_R2_PUBLIC_URL}/${key}`

  if (await existsInR2(key)) {
    console.log('ya existe, se omite')
  } else {
    await uploadToR2(key, filePath)
    console.log('OK')
  }

  const { file, ...rest } = book
  results.push({ ...rest, pages, isbn: undefined, viewLink: publicUrl, downloadLink: publicUrl })

  await writeFile(
    new URL('../src/data/books.json', import.meta.url),
    JSON.stringify(results, null, 2) + '\n',
  )
}

console.log(`\nListo: ${results.length} libros escritos en src/data/books.json`)
