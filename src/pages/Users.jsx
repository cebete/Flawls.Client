import { useEffect, useState } from 'react'
import client from '../api/client'
import Toast from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import { useLanguage } from '../context/LanguageContext'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'staff' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null)
  const { t } = useLanguage()

  const currentUsername = localStorage.getItem('username')

  function addToast(message, type) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  async function load() {
    try {
      const res = await client.get('/auth/users')
      setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await client.post('/auth/users', form)
      setForm({ username: '', password: '', role: 'staff' })
      setShowForm(false)
      addToast(t('userCreated'), 'success')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  function handleDelete(user) {
    setConfirm({
      message: `${t('delete')} "${user.username}"? ${t('deleteUser')}`,
      onConfirm: async () => {
        setConfirm(null)
        try {
          await client.delete(`/auth/users/${user.id}`)
          addToast(t('userDeleted'), 'success')
          load()
        } catch (err) {
          addToast(err.response?.data?.message || 'Failed to delete user.', 'error')
        }
      }
    })
  }

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.title}>{t('users')}</h2>
        <button style={showForm ? s.btnGhost : s.btnPrimary} onClick={() => setShowForm(v => !v)}>
          {showForm ? t('cancel') : t('addUser')}
        </button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <p style={s.formTitle}>{t('newUser')}</p>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>{t('username')}</label>
                <input style={s.input} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="off" required />
              </div>
              <div>
                <label style={s.label}>{t('password')}</label>
                <input style={s.input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <label style={s.label}>{t('role')}</label>
                <select style={s.input} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {error && <div style={s.error}>{error}</div>}
            <div style={{ marginTop: '1.25rem' }}>
              <button style={s.btnPrimary} type="submit" disabled={saving}>
                {saving ? t('creating') : t('createUser')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={s.tableCard}>
        {loading ? (
          <p style={s.muted}>{t('loading')}</p>
        ) : users.length === 0 ? (
          <p style={s.muted}>{t('noUsers')}</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {[t('usernameCol'), t('roleCol'), t('created'), ''].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={s.avatar}>{u.username[0].toUpperCase()}</div>
                      <span style={s.username}>
                        {u.username}
                        {u.username === currentUsername && <span style={s.youBadge}>you</span>}
                      </span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.roleBadge,
                      background: u.role === 'admin' ? '#4ade8018' : 'var(--bg3)',
                      color: u.role === 'admin' ? 'var(--success)' : 'var(--text2)',
                      borderColor: u.role === 'admin' ? '#4ade8033' : 'var(--border)',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}><span style={s.muted}>{new Date(u.createdAt).toLocaleDateString()}</span></td>
                  <td style={s.td}>
                    {u.username !== currentUsername && (
                      <button style={s.dangerBtn} onClick={() => handleDelete(u)}>{t('delete')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
    </div>
  )
}

const s = {
  page: { padding: '2rem 2.5rem', maxWidth: '800px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '18px', fontWeight: '600', letterSpacing: '-0.3px' },
  formCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.25rem' },
  formTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '1.25rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '5px', display: 'block' },
  input: { width: '100%', padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text)', outline: 'none' },
  error: { marginTop: '12px', padding: '9px 12px', background: 'var(--danger-bg)', border: '1px solid #f8717133', borderRadius: '7px', color: 'var(--danger)', fontSize: '13px' },
  btnPrimary: { padding: '8px 16px', background: 'var(--accent)', color: '#111', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600' },
  btnGhost: { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text2)' },
  tableCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.5rem 0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '8px 1.25rem', fontSize: '11px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.4px' },
  td: { padding: '12px 1.25rem', borderBottom: '1px solid var(--border)' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  username: { fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' },
  youBadge: { fontSize: '10px', padding: '1px 6px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text3)', fontWeight: '400' },
  roleBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', border: '1px solid', fontWeight: '500' },
  dangerBtn: { padding: '5px 12px', background: 'transparent', border: '1px solid #f8717133', borderRadius: '6px', fontSize: '12px', color: 'var(--danger)' },
  muted: { fontSize: '13px', color: 'var(--text3)', padding: '1rem 1.25rem' },
}