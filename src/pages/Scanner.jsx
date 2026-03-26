import { useState, useRef, useEffect } from 'react'
import client from '../api/client'
import Toast from '../components/Toast'
import { useLanguage } from '../context/LanguageContext'

export default function Scanner() {
  const [barcode, setBarcode] = useState('')
  const [mode, setMode] = useState('receive')
  const [toasts, setToasts] = useState([])
  const [log, setLog] = useState([])
  const inputRef = useRef()
  const { t } = useLanguage()

  useEffect(() => { inputRef.current?.focus() }, [])

  function addToast(message, type) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  async function handleScan(e) {
    e.preventDefault()
    if (!barcode.trim()) return
    try {
      const endpoint = mode === 'receive' ? '/scan' : '/scan/sell'
      const res = await client.post(endpoint, { barcodeId: barcode.trim() })
      if (res.data.success) {
        addToast(res.data.message, 'success')
        setLog(prev => [{ ...res.data, mode }, ...prev.slice(0, 19)])
      } else {
        addToast(res.data.message, 'error')
      }
    } catch {
      addToast('Request failed. Is the API running?', 'error')
    }
    setBarcode('')
    inputRef.current?.focus()
  }

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.title}>{t('scanner')}</h2>
        <div style={s.modeToggle}>
          <button
            style={{ ...s.modeBtn, ...(mode === 'receive' ? s.modeBtnActive : {}) }}
            onClick={() => { setMode('receive'); inputRef.current?.focus() }}
          >
            {t('receive')}
          </button>
          <button
            style={{ ...s.modeBtn, ...(mode === 'sell' ? s.modeBtnSell : {}) }}
            onClick={() => { setMode('sell'); inputRef.current?.focus() }}
          >
            {t('sellMode')}
          </button>
        </div>
      </div>

      <div style={{ ...s.card, borderColor: mode === 'sell' ? '#f8717133' : 'var(--border)' }}>
        <p style={s.hint}>{mode === 'receive' ? t('scanReceiveHint') : t('scanSellHint')}</p>
        <form onSubmit={handleScan} style={s.form}>
          <input
            ref={inputRef}
            style={{ ...s.scanInput, borderColor: mode === 'sell' ? '#f8717155' : 'var(--border)' }}
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            placeholder={t('scanPlaceholder')}
            autoComplete="off"
          />
          <button style={{ ...s.btnPrimary, background: mode === 'sell' ? '#f87171' : 'var(--accent)', color: '#111' }}>
            {mode === 'receive' ? t('receive') : t('sellMode')}
          </button>
        </form>
      </div>

      {log.length > 0 && (
        <div style={s.card}>
          <p style={s.sectionTitle}>{t('sessionLog')}</p>
          {log.map((entry, i) => (
            <div key={i} style={s.logRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  ...s.modePill,
                  background: entry.mode === 'sell' ? 'var(--danger-bg)' : 'var(--success-bg)',
                  color: entry.mode === 'sell' ? 'var(--danger)' : 'var(--success)',
                  borderColor: entry.mode === 'sell' ? '#f8717133' : '#4ade8033',
                }}>
                  {entry.mode === 'sell' ? '−1' : '+1'}
                </span>
                <div>
                  <span style={s.logName}>{entry.variant.productName}</span>
                  <span style={s.logSub}> — {entry.variant.color} / {entry.variant.size}</span>
                </div>
              </div>
              <span style={s.logQty}>{entry.variant.quantity} {t('units')}</span>
            </div>
          ))}
        </div>
      )}

      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

const s = {
  page: { padding: '2rem 2.5rem', maxWidth: '680px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '18px', fontWeight: '600', letterSpacing: '-0.3px' },
  modeToggle: { display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' },
  modeBtn: { padding: '7px 20px', background: 'transparent', border: 'none', fontSize: '13px', color: 'var(--text2)', cursor: 'pointer' },
  modeBtnActive: { background: 'var(--accent)', color: '#111', fontWeight: '600' },
  modeBtnSell: { background: '#f87171', color: '#111', fontWeight: '600' },
  card: { background: 'var(--bg2)', border: '1px solid', borderRadius: '10px', padding: '1.5rem', marginBottom: '12px', transition: 'border-color 0.2s' },
  hint: { fontSize: '13px', color: 'var(--text3)', marginBottom: '1rem' },
  form: { display: 'flex', gap: '8px' },
  scanInput: { flex: 1, padding: '10px 12px', background: 'var(--bg3)', border: '1px solid', borderRadius: '7px', fontSize: '15px', color: 'var(--text)', outline: 'none', letterSpacing: '0.5px', transition: 'border-color 0.2s' },
  btnPrimary: { padding: '10px 20px', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' },
  sectionTitle: { fontSize: '12px', fontWeight: '600', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' },
  logRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  modePill: { fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '5px', border: '1px solid', minWidth: '28px', textAlign: 'center' },
  logName: { fontWeight: '500', color: 'var(--text)' },
  logSub: { color: 'var(--text2)' },
  logQty: { fontSize: '12px', color: 'var(--text3)' },
}