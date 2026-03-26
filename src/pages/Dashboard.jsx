import { useEffect, useState } from 'react'
import client from '../api/client'
import { useLanguage } from '../context/LanguageContext'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    client.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={s.page}><p style={s.muted}>{t('loading')}</p></div>

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.title}>{t('dashboard')}</h2>
        <span style={s.timestamp}>{t('lastUpdated')}: {new Date().toLocaleTimeString()}</span>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: t('totalProducts'), value: stats.totalProducts },
          { label: t('totalVariants'), value: stats.totalVariants },
          { label: t('totalUnits'), value: stats.totalUnits },
          { label: t('stockValue'), value: `€${stats.totalStockValue.toFixed(2)}` },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <span style={s.statVal}>{st.value}</span>
            <span style={s.statLbl}>{st.label}</span>
          </div>
        ))}
      </div>

      <div style={s.row}>
        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>{t('lowStock')}</span>
            <span style={s.badge}>{t('customThresholds')}</span>
          </div>
          {stats.lowStock.length === 0
            ? <p style={s.empty}>{t('allWellStocked')}</p>
            : stats.lowStock.map(item => (
              <div key={item.variantId} style={s.row2}>
                <div>
                  <span style={s.itemName}>{item.productName}</span>
                  <span style={s.itemSub}> — {item.color} / {item.size}</span>
                </div>
                <span style={{ ...s.qty, color: item.quantity === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                  {item.quantity} left
                </span>
              </div>
            ))
          }
        </div>

        <div style={s.section}>
          <div style={s.sectionHead}>
            <span style={s.sectionTitle}>{t('recentScans')}</span>
          </div>
          {stats.recentScans.length === 0
            ? <p style={s.empty}>{t('noScans')}</p>
            : stats.recentScans.map((sc, i) => (
              <div key={i} style={s.row2}>
                <div>
                  <span style={s.itemName}>{sc.productName}</span>
                  <span style={s.itemSub}> — {sc.color} / {sc.size}</span>
                </div>
                <span style={s.muted}>{new Date(sc.scannedAt).toLocaleTimeString()}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { padding: '2rem 2.5rem', maxWidth: '1100px' },
  pageHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.75rem' },
  title: { fontSize: '18px', fontWeight: '600', letterSpacing: '-0.3px' },
  timestamp: { fontSize: '12px', color: 'var(--text3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.25rem' },
  statCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' },
  statVal: { fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px', color: 'var(--accent)' },
  statLbl: { fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  section: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' },
  sectionHead: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  sectionTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text)' },
  badge: { fontSize: '11px', padding: '2px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', color: 'var(--text3)' },
  row2: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  itemName: { color: 'var(--text)', fontWeight: '500' },
  itemSub: { color: 'var(--text2)' },
  qty: { fontSize: '12px', fontWeight: '600' },
  muted: { fontSize: '12px', color: 'var(--text3)' },
  empty: { fontSize: '13px', color: 'var(--text3)', padding: '8px 0' },
}