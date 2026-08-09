// ─── Tokens ───────────────────────────────────────────────────────────────────
export const O = '#E8541E'
export const B = '#1A1A1A'

const COLORS = {
  'Anatomía':                     ['#1B3A6B','#2E5FA3'],
  'Bioquímica':                   ['#1E4B2E','#2E7A4A'],
  'Embriología':                  ['#1A4A5C','#2A7A8C'],
  'Farmacología':                 ['#5C1A1A','#8C2A2A'],
  'Fisiología':                   ['#1A5C5A','#2A8C8A'],
  'Fisiopatología':               ['#5C4A1A','#8C7A2A'],
  'Histología':                   ['#5C1A4A','#8C2A7A'],
  'Inmunología':                  ['#1A3A5C','#2A5A8C'],
  'Microbiología':                ['#5C3A1A','#8C5A2A'],
  'Semiología-Historia Clínica':  ['#2A2A2A','#4A4A4A'],
}

// Los libros con portada real la muestran completa (sin recortar) sobre el
// gradiente de su materia, que hace de marco. Los que no tienen —porque el PDF
// venía con marca de agua imposible de recortar— caen al diseño de gradiente
// con el título, que es el original del sitio.
export const Cover = ({ book, h = 200 }) => {
  const [c1, c2] = COLORS[book.subject] || ['#222','#444']
  return (
    <div style={{ width:'100%', height:h, background:`linear-gradient(140deg,${c1},${c2})`, borderRadius:4, padding: book.cover ? 0 : 12, display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden', boxShadow:'2px 4px 14px rgba(0,0,0,0.22)', flexShrink:0 }}>
      {book.cover ? (
        <img src={book.cover} alt={`Portada de ${book.title}`} loading="lazy"
          style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'center', display:'block' }} />
      ) : (
        <>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:5, background:'rgba(0,0,0,0.32)' }} />
          <div style={{ fontSize:9, letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', fontWeight:700, paddingRight:44 }}>{book.subject}</div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:11, lineHeight:1.35, marginBottom:3 }}>{book.title}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10 }}>{(book.author || '').split(',')[0] || 'Anáhuac Medicina'}</div>
          </div>
        </>
      )}
      {book.year && <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.45)', borderRadius:3, padding:'2px 6px', fontSize:9, color:'#fff', letterSpacing:'0.06em' }}>{book.year}</div>}
    </div>
  )
}

export const Badge = ({ subject }) => {
  const [c1] = COLORS[subject] || ['#444']
  return <span style={{ background:c1, color:'#fff', padding:'2px 9px', borderRadius:3, fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'inline-block', lineHeight:1.5 }}>{subject}</span>
}

export const STitle = ({ children, style = {} }) => (
  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:B, borderLeft:`3px solid ${O}`, paddingLeft:12, lineHeight:1.2, ...style }}>
    {children}
  </div>
)
