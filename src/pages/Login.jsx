import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await client.post('/auth/login', { username, password })
      login(res.data)
      navigate('/')
    } catch {
      setError(t('invalidLogin'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <img src={logo} alt="Flawls" style={s.logoImg} />
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>{t('username')}</label>
            <input style={s.input} type="text" value={username}
              onChange={e => setUsername(e.target.value)} autoFocus required />
          </div>
          <div style={s.field}>
            <label style={s.label}>{t('password')}</label>
            <input style={s.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} disabled={loading}>
            {loading ? t('loading') : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  card: { width: '100%', maxWidth: '360px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' },
  logoImg: { width: '100%', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text2)' },
  input: { padding: '9px 11px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '14px', color: 'var(--text)', outline: 'none' },
  error: { padding: '9px 12px', borderRadius: '7px', background: 'var(--danger-bg)', border: '1px solid #f8717133', color: 'var(--danger)', fontSize: '13px' },
  btn: { padding: '10px', borderRadius: '7px', background: 'var(--accent)', color: '#111', border: 'none', fontSize: '14px', fontWeight: '600', marginTop: '4px' },
}