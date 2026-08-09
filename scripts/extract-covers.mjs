// Extrae la portada de cada libro (página 1 del PDF) a public/covers/cover-<id>.jpg.
//
// Los PDFs viven en el staging local (~/biblioteca-anahuac-libros), no en el repo:
// este script solo se corre cuando cambia el catálogo, y lo que se commitea son
// las portadas ya generadas.
//
// Uso: node scripts/extract-covers.mjs [--force]
//
// Gotcha heredado de migrate-books.mjs: los nombres extraídos del zip mezclan
// formas Unicode NFC/NFD (incluso dentro de la misma carpeta), así que hay que
// resolver cada segmento del path comparando readdir() normalizado a NFC.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const LIBROS_DIR = path.join(os.homedir(), 'biblioteca-anahuac-libros')
const OUT_DIR = new URL('../public/covers/', import.meta.url).pathname
const SOURCE = new URL('./books-source.json', import.meta.url).pathname
const WIDTH = 400 // se muestra a ~190px como máximo, 400 cubre pantallas 2x
const QUALITY = 82

// Varios PDFs traen marcas de agua de sitios de descarga (booksmedicos.org,
// rinconmedico.net, TruePDF). Este es un sitio institucional: esas marcas no
// pueden acabar en la vitrina del catálogo.
//
// En estos la marca cae en una franja al borde y se puede recortar sin perder
// el título ni el arte (se sacrifican el logo de la editorial o los autores).
// Geometría en la escala de WIDTH=400; cambiar WIDTH obliga a recalcularla.
const CROPS = {
  8:  '400x400+0+92',  // Rouvière II  — "TruePDF" arriba, "rinconmedico.net" abajo
  9:  '400x395+0+90',  // Rouvière III — idem
  10: '400x400+0+90',  // Rouvière IV  — idem
  29: '400x425+0+0',   // Bates        — "booksmedicos.org" al pie
}

// En estos la marca está impresa sobre el arte central: cualquier recorte que
// la elimine destruye la portada, así que su PDF no sirve como fuente.
//
// Seis se cubrieron con la portada de la editorial vía la API de Open Library
// (covers.openlibrary.org), verificando en cada una que la edición impresa en
// la carátula fuera la misma que la del catálogo. Esos JPG están commiteados a
// mano en public/covers/ y este script los respeta: nunca los genera ni los
// borra, solo los enlaza en books.json si el archivo existe.
//
// Los otros dos no tienen sustituto y se quedan con el gradiente de su materia:
//   7  Rouvière I         — Open Library solo tiene el tomo II y un lote de los tres
//   31 Terminología Médica — título local, sin registro en Open Library
const PDF_INSERVIBLE = new Set([
  1,  // Moore                — marca sobre el rostro          · portada de Open Library
  7,  // Rouvière I           — marca a media portada          · sin sustituto
  12, // Netter Colorear      — segunda marca sobre los lápices · portada de Open Library
  13, // Lehninger            — marca sobre la molécula        · portada de Open Library
  14, // Bioquímica Baynes    — marca sobre la molécula        · portada de Open Library
  16, // Harper's Illustrated — marca sobre la molécula        · portada de Open Library
  17, // Langman              — marca sobre la ilustración     · portada de Open Library
  31, // Terminología Médica  — marca a media portada          · sin sustituto
])

const force = process.argv.includes('--force')
const nfc = (s) => s.normalize('NFC')

function resolveRealPath(relative) {
  let current = LIBROS_DIR
  for (const segment of nfc(relative).split('/')) {
    const match = fs.readdirSync(current).find((entry) => nfc(entry) === segment)
    if (!match) return null
    current = path.join(current, match)
  }
  return current
}

const books = JSON.parse(fs.readFileSync(SOURCE, 'utf8'))
fs.mkdirSync(OUT_DIR, { recursive: true })

let generated = 0
let skipped = 0
let excluded = 0
const failed = []

for (const book of books) {
  if (PDF_INSERVIBLE.has(book.id)) {
    excluded++
    continue
  }

  const out = path.join(OUT_DIR, `cover-${book.id}.jpg`)

  if (!force && fs.existsSync(out)) {
    skipped++
    continue
  }

  const pdf = resolveRealPath(book.file)
  if (!pdf) {
    failed.push(`${book.title} — no se encontró ${book.file}`)
    continue
  }

  // pdftoppm añade el sufijo de página al prefijo que se le pasa; se renombra después.
  const prefix = path.join(OUT_DIR, `tmp-${book.id}`)
  try {
    execFileSync('pdftoppm', [
      '-jpeg', '-jpegopt', `quality=${QUALITY}`,
      '-scale-to-x', String(WIDTH), '-scale-to-y', '-1',
      '-f', '1', '-l', '1',
      pdf, prefix,
    ], { stdio: 'pipe' })

    const produced = fs.readdirSync(OUT_DIR).find((f) => f.startsWith(`tmp-${book.id}-`))
    if (!produced) throw new Error('pdftoppm no generó ninguna imagen')

    fs.renameSync(path.join(OUT_DIR, produced), out)

    if (CROPS[book.id]) {
      execFileSync('convert', [out, '-crop', CROPS[book.id], '+repage', out], { stdio: 'pipe' })
    }

    generated++
    console.log(`✓ ${book.id}. ${book.title}${CROPS[book.id] ? ' (recortada)' : ''}`)
  } catch (err) {
    failed.push(`${book.title} — ${err.message}`)
    for (const leftover of fs.readdirSync(OUT_DIR).filter((f) => f.startsWith(`tmp-${book.id}-`))) {
      fs.unlinkSync(path.join(OUT_DIR, leftover))
    }
  }
}

// Se refleja el resultado en books.json para que el catálogo sepa qué libros
// tienen portada; los que no, caen al gradiente de su materia.
const BOOKS_JSON = new URL('../src/data/books.json', import.meta.url).pathname
const catalog = JSON.parse(fs.readFileSync(BOOKS_JSON, 'utf8'))
let linked = 0

for (const book of catalog) {
  if (fs.existsSync(path.join(OUT_DIR, `cover-${book.id}.jpg`))) {
    book.cover = `/covers/cover-${book.id}.jpg`
    linked++
  } else {
    delete book.cover
  }
}

fs.writeFileSync(BOOKS_JSON, `${JSON.stringify(catalog, null, 2)}\n`)

console.log(`\nGeneradas del PDF: ${generated} | ya existían: ${skipped} | PDF inservible por marca de agua: ${excluded} | fallaron: ${failed.length}`)
console.log(`books.json: ${linked} libros con portada (incluye las de Open Library ya commiteadas), ${catalog.length - linked} con gradiente`)
if (failed.length) {
  console.log('\nFallaron:')
  failed.forEach((f) => console.log(`  - ${f}`))
  process.exitCode = 1
}
