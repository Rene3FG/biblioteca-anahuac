import { useState } from 'react'
import BOOKS from '../data/books.json'
import { O, B, STitle, Cover, Badge } from '../ui'
import { useFavorites } from '../hooks/useFavorites'
import { useRecentlyRead } from '../hooks/useRecentlyRead'

const TABS = [['favoritos', 'Favoritos'], ['recientes', 'Recientes']]

export default function MiBibliotecaView({ pick }) {
  const [tab, setTab] = useState('favoritos')
  const { favorites } = useFavorites()
  const { recentlyRead } = useRecentlyRead()

  const ids = tab === 'favoritos' ? favorites : recentlyRead
  const list = ids.map(id => BOOKS.find(b => b.id === id)).filter(Boolean)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 56px' }}>
      <STitle style={{ marginBottom: 24 }}>Mi Biblioteca</STitle>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #EEE', marginBottom: 26 }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', marginRight: 22,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: tab === key ? O : '#999', borderBottom: tab === key ? `2px solid ${O}` : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#bbb', fontSize: 13 }}>
          {tab === 'favoritos' ? 'Aún no has marcado libros como favoritos.' : 'Aún no has leído ningún libro.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 18 }}>
          {list.map(b => (
            <div key={b.id} onClick={() => pick(b)} style={{ cursor: 'pointer' }}>
              <Cover book={b} h={188} />
              <div style={{ marginTop: 8 }}>
                <Badge subject={b.subject} />
                <div style={{ fontSize: 11, fontWeight: 700, margin: '6px 0 2px', color: B, lineHeight: 1.3 }}>{b.title}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{(b.author || '').split(',')[0] || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
