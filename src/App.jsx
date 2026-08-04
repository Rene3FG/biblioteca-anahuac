import { useState } from 'react'
import { Search, Download, BookOpen, ChevronRight, ArrowLeft, X, Star, LogOut } from 'lucide-react'
import BOOKS from './data/books.json'
import { O, B, Cover, Badge, STitle } from './ui'
import { useAuth } from './context/AuthContext'
import { useFavorites } from './hooks/useFavorites'
import { useRecentlyRead } from './hooks/useRecentlyRead'
import LoginModal from './components/LoginModal'
import UpdatePasswordModal from './components/UpdatePasswordModal'
import MiBibliotecaView from './views/MiBibliotecaView'

const SUBJECTS = [
  'Todos','Anatomía','Bioquímica','Embriología','Farmacología','Fisiología',
  'Fisiopatología','Histología','Inmunología','Microbiología','Semiología-Historia Clínica',
]

// ─── Shared components ────────────────────────────────────────────────────────

const Reader = ({ book, onClose }) => (
  <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.75)', display:'flex', flexDirection:'column' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:B }}>
      <span style={{ color:'#fff', fontSize:12, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{book.title}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', display:'flex', padding:6 }}>
        <X size={20} />
      </button>
    </div>
    <iframe title={book.title} src={book.viewLink} style={{ flex:1, border:'none', background:'#fff' }} />
  </div>
)

const OBtn = ({ children, onClick, outline = false, href, style = {} }) => {
  const base = {
    background: outline ? 'transparent' : O, color: outline ? O : '#fff',
    border:`1.5px solid ${O}`, padding:'11px 20px', fontWeight:700, fontSize:11,
    letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:4,
    display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap', textDecoration:'none',
    transition:'all 0.12s', ...style,
  }
  const hover = (e) => { e.currentTarget.style.background = O; e.currentTarget.style.color = '#fff' }
  const leave = (e) => { e.currentTarget.style.background = outline ? 'transparent' : O; e.currentTarget.style.color = outline ? O : '#fff' }

  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={base} onMouseEnter={hover} onMouseLeave={leave}>
      {children}
    </a>
  )
  return (
    <button onClick={onClick} style={base}
      onMouseEnter={e => { e.currentTarget.style.background = outline ? O : '#C94318'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={leave}>
      {children}
    </button>
  )
}

const CatCard = ({ subject, onClick }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? '#FFF3EE' : '#fff', border:`1.5px solid ${hov ? O : '#E8E8E8'}`, borderRadius:6, padding:'18px 10px', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', transition:'all 0.15s' }}>
      <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color: hov ? O : '#555', textAlign:'center', transition:'color 0.15s' }}>
        {subject}
      </span>
    </button>
  )
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeView({ go, pick, onLogin }) {
  const [q, setQ] = useState('')
  const recent = BOOKS.filter(b => b.recent).slice(0, 6)

  return (
    <div>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#0C1622 0%,#1A1A2E 60%,#16213E 100%)', padding:'76px 28px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, backgroundImage:'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)' }} />
        <div style={{ position:'absolute', right:'-5%', top:'-10%', width:400, height:400, borderRadius:'50%', background:`radial-gradient(circle,${O}22 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:860, margin:'0 auto', position:'relative' }}>
          <div style={{ fontSize:9, letterSpacing:'0.28em', color:O, textTransform:'uppercase', fontWeight:700, marginBottom:16 }}>
            Escuela de Medicina · Universidad Anáhuac Oaxaca
          </div>
          <h1 style={{ color:'#fff', fontSize:'clamp(28px,5vw,46px)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.08, margin:'0 0 32px', textTransform:'uppercase' }}>
            Biblioteca Digital<br /><span style={{ color:O }}>Medicina</span>
          </h1>
          <div style={{ display:'flex', maxWidth:520, boxShadow:'0 8px 32px rgba(0,0,0,0.45)' }}>
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && go('catalogo', { q })}
              placeholder="Buscar libros, materias o autores..."
              style={{ flex:1, padding:'14px 16px', fontSize:13, border:'none', outline:'none', borderRadius:'4px 0 0 4px', background:'#fff', color:B }} />
            <button onClick={() => go('catalogo', { q })} style={{ background:O, color:'#fff', border:'none', padding:'14px 22px', fontWeight:700, fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:'0 4px 4px 0', display:'flex', alignItems:'center', gap:6 }}>
              <Search size={14} /> Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div style={{ padding:'44px 28px', background:'#fff', borderBottom:'1px solid #F0F0F0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <STitle style={{ marginBottom:20 }}>Categorías</STitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:10 }}>
            {SUBJECTS.slice(1).map(s => (
              <CatCard key={s} subject={s} onClick={() => go('catalogo', { filter: s })} />
            ))}
          </div>
        </div>
      </div>

      {/* Incorporaciones Recientes */}
      <div style={{ padding:'44px 28px', background:'#F7F7F7' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
            <STitle>Incorporaciones Recientes</STitle>
            <button onClick={() => go('catalogo', {})} style={{ background:'none', border:'none', color:O, fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'flex', alignItems:'center', gap:3 }}>
              Ver catálogo completo <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))', gap:18 }}>
            {recent.map(b => (
              <div key={b.id} onClick={() => pick(b)} style={{ cursor:'pointer' }}>
                <Cover book={b} h={188} />
                <div style={{ marginTop:10 }}>
                  <Badge subject={b.subject} />
                  <div style={{ fontSize:12, fontWeight:700, margin:'6px 0 2px', color:B, lineHeight:1.3 }}>{b.title}</div>
                  <div style={{ fontSize:10, color:'#999' }}>{(b.author || '').split(',')[0] || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Misión + Acceso Facultad */}
      <div style={{ padding:'44px 28px', background:'#fff' }}>
        <div className="two-col" style={{ maxWidth:1100, margin:'0 auto', display:'grid', gap:28, alignItems:'start' }}>
          <div>
            <STitle style={{ marginBottom:16 }}>Misión Institucional</STitle>
            <p style={{ fontSize:13, color:'#555', lineHeight:1.8, margin:'0 0 24px' }}>
              Nuestra biblioteca digital proporciona acceso inmediato al conocimiento médico de vanguardia. Estamos comprometidos con la formación integral de los profesionales de la salud mediante recursos académicos de excelencia clínica y rigor científico.
            </p>
            <div style={{ display:'flex', gap:28 }}>
              {[['150+','Textos académicos'],['10','Áreas de especialidad'],['24/7','Disponibilidad']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize:26, fontWeight:800, color:O, lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:9, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:B, borderRadius:6, padding:28 }}>
            <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:O, fontWeight:700, marginBottom:12 }}>Acceso exclusivo · Facultad</div>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.75, margin:'0 0 24px' }}>
              Ingresa con tus credenciales institucionales para acceder al repositorio completo de investigaciones, tesis de grado y material de apoyo docente.
            </p>
            <button onClick={onLogin} style={{ background:'transparent', border:`1.5px solid ${O}`, color:O, padding:'11px 18px', fontWeight:700, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', borderRadius:4, width:'100%', transition:'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = O; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = O }}>
              Acceder ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────
function CatalogoView({ params = {}, pick, onRequireLogin }) {
  const [filter, setFilter] = useState(params.filter || 'Todos')
  const [sort,   setSort]   = useState('recientes')
  const [search, setSearch] = useState(params.q || '')
  const [page,   setPage]   = useState(1)
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const PER = 8

  let list = BOOKS.filter(b => {
    if (filter !== 'Todos' && b.subject !== filter) return false
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !(b.author || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  if (sort === 'recientes') list = [...list].sort((a, b) => b.year - a.year)
  if (sort === 'az')        list = [...list].sort((a, b) => a.title.localeCompare(b.title))

  const total = Math.ceil(list.length / PER)
  const paged = list.slice((page - 1) * PER, page * PER)

  return (
    <div className="sidebar-layout" style={{ maxWidth:1100, margin:'0 auto', padding:'32px 28px', display:'grid', gap:28 }}>
      {/* Sidebar */}
      <div>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:8 }}>Ordenar por</div>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
            style={{ width:'100%', padding:'9px 10px', border:'1px solid #E0E0E0', borderRadius:4, fontSize:12, outline:'none', cursor:'pointer', color:B }}>
            <option value="recientes">Más recientes</option>
            <option value="az">A → Z</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'#aaa', marginBottom:10 }}>Materia</div>
          {SUBJECTS.map(s => (
            <label key={s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9, cursor:'pointer' }}>
              <input type="radio" checked={filter === s} onChange={() => { setFilter(s); setPage(1) }} style={{ accentColor:O, cursor:'pointer' }} />
              <span style={{ fontSize:12, color: filter === s ? O : B, fontWeight: filter === s ? 700 : 400 }}>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div>
        <div style={{ display:'flex', marginBottom:24 }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar en el catálogo..."
            style={{ flex:1, padding:'10px 14px', border:'1px solid #E0E0E0', borderRadius:'4px 0 0 4px', fontSize:13, outline:'none', color:B }} />
          <button style={{ background:O, color:'#fff', border:'none', padding:'10px 15px', cursor:'pointer', borderRadius:'0 4px 4px 0' }}>
            <Search size={15} />
          </button>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <STitle>Catálogo de Medicina</STitle>
          <span style={{ fontSize:10, color:'#aaa' }}>{list.length} resultado{list.length !== 1 ? 's' : ''}</span>
        </div>

        {paged.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 0', color:'#bbb', fontSize:13 }}>No se encontraron libros con ese criterio.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))', gap:18 }}>
            {paged.map(b => (
              <div key={b.id}>
                <div style={{ position:'relative' }}>
                  <Cover book={b} h={188} />
                  <button
                    onClick={() => user ? toggleFavorite(b.id) : onRequireLogin()}
                    style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.32)', border:'none', borderRadius:3, padding:5, cursor:'pointer', display:'flex' }}>
                    <Star size={13} color="#fff" fill={isFavorite(b.id) ? '#fff' : 'none'} />
                  </button>
                </div>
                <div style={{ marginTop:8 }}>
                  <Badge subject={b.subject} />
                  <div style={{ fontSize:11, fontWeight:700, margin:'6px 0 2px', color:B, lineHeight:1.3 }}>{b.title}</div>
                  <div style={{ fontSize:10, color:'#aaa', marginBottom:9 }}>{(b.author || '').split(',')[0] || '—'}</div>
                  <button onClick={() => pick(b)} style={{ background:O, color:'#fff', border:'none', width:'100%', padding:'8px 0', fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:3 }}>Ver</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:5, marginTop:32 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ background:'none', border:'1px solid #DDD', padding:'6px 11px', cursor: page === 1 ? 'default' : 'pointer', borderRadius:3, color: page === 1 ? '#CCC' : B, fontSize:12 }}>‹</button>
            {Array.from({ length: total }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ background: page === n ? O : 'transparent', color: page === n ? '#fff' : '#666', border:`1px solid ${page === n ? O : '#DDD'}`, width:32, height:32, borderRadius:3, cursor:'pointer', fontSize:12, fontWeight:600 }}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
              style={{ background:'none', border:'1px solid #DDD', padding:'6px 11px', cursor: page === total ? 'default' : 'pointer', borderRadius:3, color: page === total ? '#CCC' : B, fontSize:12 }}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DETALLE ──────────────────────────────────────────────────────────────────
function DetalleView({ book, go, pick, onRequireLogin }) {
  const [reading, setReading] = useState(false)
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { recordRead } = useRecentlyRead()
  const related = BOOKS.filter(b => b.subject === book.subject && b.id !== book.id).slice(0, 5)

  const handleRead = () => {
    setReading(true)
    if (user) recordRead(book.id)
  }

  const handleFavorite = () => {
    if (!user) { onRequireLogin(); return }
    toggleFavorite(book.id)
  }

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 28px 56px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'#aaa', marginBottom:28, flexWrap:'wrap' }}>
        <button onClick={() => go('catalogo')} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:10 }}>Catálogo</button>
        <span>›</span>
        <button onClick={() => go('catalogo', { filter: book.subject })} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:10 }}>{book.subject}</button>
        <span>›</span>
        <span style={{ color:B }}>{book.title.length > 42 ? book.title.slice(0, 42) + '…' : book.title}</span>
      </div>

      <div className="detail-layout" style={{ display:'grid', gap:36 }}>
        <div>
          <Cover book={book} h={300} />
          <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['Edición', book.edition || '—'],['Idioma','Español'],['Páginas', book.pages || '—'],['Año', book.year]].map(([k, v]) => (
              <div key={k} style={{ background:'#F7F7F7', borderRadius:4, padding:'10px 12px' }}>
                <div style={{ fontSize:8, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:13, fontWeight:700, color:B }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <Badge subject={book.subject} />
            <span style={{ fontSize:9, color:O, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em' }}>Recurso destacado</span>
          </div>
          <h1 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:B, lineHeight:1.15, margin:'0 0 8px', letterSpacing:'-0.01em' }}>{book.title}</h1>
          {book.author && <div style={{ fontSize:12, color:'#888', marginBottom:18 }}>Por {book.author} · {book.year}</div>}
          <div style={{ width:36, height:2, background:O, marginBottom:22 }} />
          <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'#bbb', marginBottom:8 }}>Descripción general</div>
          <p style={{ fontSize:13, color:'#555', lineHeight:1.8, margin:'0 0 26px' }}>{book.desc}</p>

          <div style={{ display:'flex', gap:10, marginBottom:28, flexWrap:'wrap' }}>
            <OBtn onClick={handleRead}><BookOpen size={14} /> Leer en línea</OBtn>
            <OBtn outline href={book.downloadLink}><Download size={14} /> Descargar PDF</OBtn>
            <OBtn outline onClick={handleFavorite}>
              <Star size={14} fill={isFavorite(book.id) ? O : 'none'} />
              {isFavorite(book.id) ? 'En favoritos' : 'Agregar a favoritos'}
            </OBtn>
          </div>

          {reading && <Reader book={book} onClose={() => setReading(false)} />}

          {book.isbn && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[['ISBN-13', book.isbn],['Páginas', book.pages ? `${book.pages} pág.` : '—'],['Edición', book.edition ? `${book.edition} ed.` : '—']].map(([k, v]) => (
                <div key={k} style={{ border:'1px solid #EEE', borderRadius:4, padding:'12px 14px' }}>
                  <div style={{ fontSize:8, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:B }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop:48, borderTop:'1px solid #F0F0F0', paddingTop:32 }}>
          <STitle style={{ marginBottom:18 }}>Títulos relacionados</STitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(128px,1fr))', gap:16 }}>
            {related.map(b => (
              <div key={b.id} onClick={() => pick(b)} style={{ cursor:'pointer' }}>
                <Cover book={b} h={168} />
                <div style={{ fontSize:11, fontWeight:700, marginTop:7, color:B, lineHeight:1.3 }}>{b.title}</div>
                <div style={{ fontSize:10, color:'#aaa', marginTop:2 }}>{(b.author || '').split(',')[0] || '—'} · {b.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [page,   setPage]   = useState('home')
  const [params, setParams] = useState({})
  const [book,   setBook]   = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const { user, passwordRecovery, signOut } = useAuth()

  const go = (p, ps = {}) => {
    setPage(p)
    setParams(ps)
    window.scrollTo(0, 0)
  }

  const pick = (b) => {
    setBook(b)
    setPage('detalle')
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif", minHeight:'100vh', display:'flex', flexDirection:'column', background:'#fff' }}>

      {/* Navbar */}
      <nav className="navbar" style={{ position:'sticky', top:0, zIndex:200, background:B, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 14px rgba(0,0,0,0.5)' }}>
        <button className="brand" onClick={() => go('home')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:800, color:'#fff', letterSpacing:'0.12em', textTransform:'uppercase' }}>
          Biblioteca <span style={{ color:O }}>Anáhuac</span>
        </button>
        <div className="nav-right">
          {[['Inicio','home'],['Catálogo','catalogo'], ...(user ? [['Mi Biblioteca','mi-biblioteca']] : [])].map(([l, p]) => (
            <button key={p} onClick={() => go(p)} style={{ background:'none', border:'none', color: page === p ? O : 'rgba(255,255,255,0.75)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', paddingBottom:3, borderBottom: page === p ? `2px solid ${O}` : '2px solid transparent', transition:'color 0.12s' }}>
              {l}
            </button>
          ))}
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>{user.email}</span>
              <button onClick={signOut} title="Cerrar sesión" style={{ background:'transparent', border:'1.5px solid rgba(255,255,255,0.28)', color:'rgba(255,255,255,0.75)', padding:'6px 10px', cursor:'pointer', borderRadius:3, display:'flex', transition:'all 0.12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = O; e.currentTarget.style.color = O }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background:'transparent', border:'1.5px solid rgba(255,255,255,0.28)', color:'rgba(255,255,255,0.75)', padding:'6px 14px', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', cursor:'pointer', borderRadius:3, transition:'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = O; e.currentTarget.style.color = O }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}>
              Ingresar
            </button>
          )}
        </div>
      </nav>

      <main style={{ flex:1 }}>
        {page === 'home'          && <HomeView go={go} pick={pick} onLogin={() => setShowLogin(true)} />}
        {page === 'catalogo'      && <CatalogoView params={params} pick={pick} onRequireLogin={() => setShowLogin(true)} />}
        {page === 'detalle'       && book && <DetalleView book={book} go={go} pick={pick} onRequireLogin={() => setShowLogin(true)} />}
        {page === 'mi-biblioteca' && user && <MiBibliotecaView pick={pick} />}
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {passwordRecovery && <UpdatePasswordModal />}

      <footer style={{ background:'#111', padding:'32px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
              Biblioteca <span style={{ color:O }}>Anáhuac</span>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', maxWidth:260, lineHeight:1.7 }}>
              © 2026 Escuela de Medicina · Universidad Anáhuac Oaxaca.<br />Todos los derechos reservados.
            </div>
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {['Repositorio institucional','Investigación docente','Ética bibliotecaria'].map(l => (
              <button key={l} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.45)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', padding:0, lineHeight:2, transition:'color 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.color = O}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                {l}
              </button>
            ))}
            <a href="mailto:rene.fuentes03@anahuac.mx" style={{ color:'rgba(255,255,255,0.45)', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', lineHeight:2, textDecoration:'none', transition:'color 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.color = O}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
              Contacto y soporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
