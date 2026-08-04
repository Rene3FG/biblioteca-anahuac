import { useState } from 'react'
import { X } from 'lucide-react'
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

const linkStyle = {
  background: 'none', border: 'none', color: O, fontSize: 11, cursor: 'pointer',
  padding: 0, textDecoration: 'underline',
}

export default function LoginModal({ onClose }) {
  const { signInWithPassword, signUpWithPassword, signInWithOtp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup | magiclink | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setError(''); setMessage('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    reset()
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email, password)
        if (error) throw error
        onClose()
      } else if (mode === 'signup') {
        if (password !== confirm) throw new Error('Las contraseñas no coinciden')
        const { error } = await signUpWithPassword(email, password)
        if (error) throw error
        setMessage('Cuenta creada. Revisa tu correo para confirmarla.')
      } else if (mode === 'magiclink') {
        const { error } = await signInWithOtp(email)
        if (error) throw error
        setMessage('Te enviamos un link mágico a tu correo.')
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Te enviamos un correo para restablecer tu contraseña.')
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    signin: 'Iniciar sesión',
    signup: 'Crear cuenta',
    magiclink: 'Entrar con link mágico',
    forgot: 'Restablecer contraseña',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 6, width: '100%', maxWidth: 360, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: B }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{titles[mode]}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ fontSize: 9, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
            Solo correos institucionales <strong style={{ color: B }}>@anahuac.mx</strong>.
          </div>

          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu.correo@anahuac.mx" style={inputStyle} />

          {(mode === 'signin' || mode === 'signup') && (
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña" style={inputStyle} />
          )}

          {mode === 'signup' && (
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirmar contraseña" style={inputStyle} />
          )}

          {error && <div style={{ fontSize: 11, color: '#B4232A', marginBottom: 12 }}>{error}</div>}
          {message && <div style={{ fontSize: 11, color: '#1E7A3E', marginBottom: 12 }}>{message}</div>}

          <button type="submit" disabled={loading} style={{ ...submitStyle, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Procesando…' : titles[mode]}
          </button>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {mode === 'signin' && (
              <>
                <button type="button" style={linkStyle} onClick={() => { setMode('magiclink'); reset() }}>
                  Entrar con link mágico
                </button>
                <button type="button" style={linkStyle} onClick={() => { setMode('forgot'); reset() }}>
                  ¿Olvidaste tu contraseña?
                </button>
                <button type="button" style={{ ...linkStyle, color: '#888' }} onClick={() => { setMode('signup'); reset() }}>
                  ¿No tienes cuenta? Crea una
                </button>
              </>
            )}
            {mode !== 'signin' && (
              <button type="button" style={{ ...linkStyle, color: '#888' }} onClick={() => { setMode('signin'); reset() }}>
                Volver a iniciar sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
