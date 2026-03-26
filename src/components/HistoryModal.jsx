import { useEffect, useState } from 'react'
import client from '../api/client'
import { useLanguage } from '../context/LanguageContext'

export default function HistoryModal({ variant, onClose }) {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    client.get(`/variants/${variant.id}/history`)
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false))
  }, [variant.id])

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.title}>{t('stockHistory')}</p>
            <p style={s.sub}>
              {history?.productName} — {variant.color} / {variant.size}
              <span style={s.badge}>{variant.barcodeId}</span>
            </p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p style={s.muted}>{t('loading')}</p>
        ) : history.movements.length === 0 ? (
          <p style={s.muted}>{t('noMovements')}</p>
        ) : (
          <div style={s.list}>
            {history.movements.map(m => (
              <div key={m.id} style={s.row}>
                <div style={s.rowLeft}>
                  <span style={{
                    ...s.delta,
                    color: m.delta > 0 ? 'var(--success)' : 'var(--danger)',
                    background: m.delta > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                    borderColor: m.delta > 0 ? '#4ade8033' : '#f8717133',
                  }}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </span>
                  <span style={s.reason}>{m.reason}</span>
                </div>
                <span style={s.date}>
                  {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={s.footer}>
          <span style={s.muted}>{t('currentStock')}</span>
          <span style={s.currentQty}>{history?.currentQuantity ?? '—'} {t('units')}</span>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(2px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  title: { fontSize: '15px', fontWeight: '600', marginBottom: '4px' },
  sub: { fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: { fontFamily: 'monospace', fontSize: '11px', padding: '1px 6px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text3)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: '14px', padding: '4px', flexShrink: 0 },
  list: { overflowY: 'auto', flex: 1, padding: '0.5rem 1.5rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  delta: { fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '5px', border: '1px solid', minWidth: '36px', textAlign: 'center' },
  reason: { fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' },
  date: { fontSize: '12px', color: 'var(--text3)' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' },
  muted: { fontSize: '13px', color: 'var(--text3)', padding: '1rem 1.5rem' },
  currentQty: { fontSize: '15px', fontWeight: '600' },
}