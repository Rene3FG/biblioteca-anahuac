// Enrutador mínimo sobre la History API.
//
// El sitio vivía en una sola URL (`/`) con la vista guardada en estado de React:
// no se podía compartir el enlace de un libro, el botón Atrás del navegador
// sacaba del sitio y escribir /catalogo a mano daba 404. Son cuatro vistas y un
// parámetro, así que no vale la pena una dependencia de router.
//
// Ojo: las rutas profundas necesitan que el hosting sirva index.html en
// cualquier ruta — eso lo resuelve el rewrite de `vercel.json`.

export function routeFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const query = new URLSearchParams(window.location.search)

  if (path === '/catalogo') {
    return { page: 'catalogo', params: { q: query.get('q') || '', filter: query.get('materia') || 'Todos' } }
  }
  if (path === '/mi-biblioteca') {
    return { page: 'mi-biblioteca', params: {} }
  }

  const libro = path.match(/^\/libro\/(\d+)$/)
  if (libro) {
    return { page: 'detalle', params: { id: Number(libro[1]) } }
  }

  // Cualquier ruta desconocida cae al inicio en vez de dejar la pantalla vacía.
  return { page: 'home', params: {} }
}

export function pathForCatalogo({ filter, q } = {}) {
  const query = new URLSearchParams()
  if (filter && filter !== 'Todos') query.set('materia', filter)
  if (q) query.set('q', q)
  const suffix = query.toString()
  return suffix ? `/catalogo?${suffix}` : '/catalogo'
}

export function pathForPage(page, params = {}) {
  if (page === 'catalogo') return pathForCatalogo(params)
  if (page === 'mi-biblioteca') return '/mi-biblioteca'
  if (page === 'detalle' && params.id != null) return `/libro/${params.id}`
  return '/'
}
