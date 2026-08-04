import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const O = '#E8541E'
const B = '#1A1A1A'

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 4,
  fontSize: 13, outline: 'none', color: B, marginBottom: 12,
}

const submitStyle = {
  width: '100%', background: O, color: '#fff', border: 'none', padding: '11px 0',
  fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', borderRadius: 4,
}

export default function UpdatePasswordModal() {
  const { updatePassword, clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      setDone(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 6, width: '100%', maxWidth: 360, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: B }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Nueva contraseña</span>
        </div>

        <div style={{ padding: 24 }}>
          {done ? (
            <>
              <div style={{ fontSize: 12, color: '#1E7A3E', marginBottom: 16, lineHeight: 1.6 }}>
                Tu contraseña se actualizó correctamente.
              </div>
              <button onClick={clearPasswordRecovery} style={submitStyle}>Continuar</button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ fontSize: 9, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
                Elige una nueva contraseña para tu cuenta.
              </div>

              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Nueva contraseña" style={inputStyle} />
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Confirmar contraseña" style={inputStyle} />

              {error && <div style={{ fontSize: 11, color: '#B4232A', marginBottom: 12 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{ ...submitStyle, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
