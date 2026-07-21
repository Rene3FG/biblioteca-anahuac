# Biblioteca Digital · Anáhuac Medicina

Plataforma web para la biblioteca digital de la Escuela de Medicina de la Universidad Anáhuac Oaxaca.

## Stack
- **React 18** + **Vite 5**
- **Lucide React** (íconos)
- Deploy: **Vercel** (recomendado)

---

## Instalación local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

---

## Agregar un libro nuevo

1. Sube el PDF al folder de Google Drive y copia el link de compartir
2. Edita `src/data/books.json` y agrega una entrada:

```json
{
  "id": 11,
  "title": "Nombre del libro",
  "author": "Apellido, Nombre",
  "subject": "Anatomía",
  "year": 2024,
  "edition": "1ra",
  "pages": 500,
  "isbn": "978-...",
  "recent": true,
  "desc": "Descripción breve del libro.",
  "viewLink": "https://drive.google.com/file/d/FILE_ID/view?usp=sharing",
  "downloadLink": "https://drive.google.com/uc?export=download&id=FILE_ID"
}
```

3. Haz commit y push → Vercel despliega automáticamente

**Materias disponibles:**
`Anatomía` · `Fisiología` · `Bioquímica` · `Farmacología` · `Patología` · `Microbiología` · `Inmunología` · `Cirugía` · `Medicina Interna`

---

## Deploy en Vercel (primera vez)

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones. Los deploys posteriores son automáticos con cada push a `main`.

---

## Estructura del proyecto

```
biblioteca-anahuac/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── data/
│   │   └── books.json   # ← Aquí se agregan/editan los libros
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```
