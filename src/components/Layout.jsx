import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.png'

export default function Layout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()
  const { lang, switchLanguage, t } = useLanguage()

  const navItems = [
    { to: '/', label: t('dashboard'), end: true },
    { to: '/products', label: t('products') },
    { to: '/scanner', label: t('scanner') },
    { to: '/barcodes', label: t('barcodes') },
    ...(auth.role === 'admin' ? [{ to: '/users', label: t('users') }] : []),
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div>
          <div style={s.brand}>
            <img src={logo} alt="Flawls" style={s.logo} />
          </div>
          <nav style={s.nav}>
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  ...s.link,
                  ...(isActive ? s.linkActive : {}),
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={s.footer}>
          <div style={s.langRow}>
            <span style={s.langLabel}>{t('language')}</span>
            <div style={s.langToggle}>
              <button
                style={{ ...s.langBtn, ...(lang === 'en' ? s.langBtnActive : {}) }}
                onClick={() => switchLanguage('en')}
              >
                EN
              </button>
              <button
                style={{ ...s.langBtn, ...(lang === 'tr' ? s.langBtnActive : {}) }}
                onClick={() => switchLanguage('tr')}
              >
                TR
              </button>
            </div>
          </div>
          <div style={s.userRow}>
            <div style={s.avatar}>{auth.username?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={s.userName}>{auth.username}</div>
              <div style={s.userRole}>{auth.role}</div>
            </div>
            <button style={s.signOutBtn} onClick={handleLogout} title={t('signOut')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  )
}

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: '220px', flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 12px',
    position: 'sticky', top: 0, height: '100vh',
  },
  brand: { padding: '4px 8px 24px' },
  logo: { height: '28px', width: 'auto', display: 'block' },
  nav: { display: 'flex', flexDirection: 'column', gap: '2px' },
  link: {
    display: 'block', padding: '7px 10px',
    borderRadius: '6px', fontSize: '13.5px',
    color: 'var(--text2)', transition: 'all 0.1s',
  },
  linkActive: { background: 'var(--bg3)', color: 'var(--text)' },
  footer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'var(--bg3)', borderRadius: '8px', border: '1px solid var(--border)' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text)', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '500', color: 'var(--text)' },
  userRole: { fontSize: '11px', color: 'var(--text3)' },
  signOutBtn: { background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', flexShrink: 0 },
  main: { flex: 1, minWidth: 0, overflowY: 'auto' },
  langRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px' },
  langLabel: { fontSize: '12px', color: 'var(--text3)' },
  langToggle: { display: 'flex', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' },
  langBtn: { padding: '4px 10px', background: 'transparent', border: 'none', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer' },
  langBtnActive: { background: 'var(--accent)', color: '#111', fontWeight: '600' },
}