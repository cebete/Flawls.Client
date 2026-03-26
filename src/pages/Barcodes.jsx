import { useEffect, useState, useRef } from 'react'
import client from '../api/client'
import JsBarcode from 'jsbarcode'
import { useLanguage } from '../context/LanguageContext'

export default function Barcodes() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState('')
  const barcodeRefs = useRef({})
  const { t } = useLanguage()

  useEffect(() => {
    client.get('/products').then(r => setProducts(r.data))
  }, [])

  const product = products.find(p => p.id === parseInt(selected))

  useEffect(() => {
    if (!product) return
    product.variants.forEach(v => {
      const el = barcodeRefs.current[v.id]
      if (el) {
        JsBarcode(el, v.barcodeId, {
          format: 'CODE128', width: 2, height: 56,
          displayValue: true, fontSize: 11, margin: 8,
          background: 'transparent', lineColor: '#000',
        })
      }
    })
  }, [product])

  function printSingle(v) {
    const svgEl = barcodeRefs.current[v.id]
    if (!svgEl) return
    const svgHTML = svgEl.outerHTML
    const win = window.open('', '_blank', 'width=400,height=300')
    win.document.write(`
      <html>
        <head>
          <title>${product.name} — ${v.color} / ${v.size}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background: #fff; color: #000; }
            svg { width: 280px; }
            p { font-size: 13px; margin: 4px 0 0; font-weight: 600; }
            code { font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          ${svgHTML}
          <p>${product.name} — ${v.color} / ${v.size}</p>
          <code>${v.barcodeId}</code>
          <script>window.onload = () => { window.print(); window.close() }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div style={s.page}>
      <div style={s.pageHeader} className="no-print">
        <h2 style={s.title}>{t('barcodes')}</h2>
        {product && (
          <button style={s.btnGhost} onClick={() => window.print()}>{t('printAll')}</button>
        )}
      </div>

      <div style={s.card} className="no-print">
        <label style={s.label}>{t('selectProduct')}</label>
        <select style={s.select} value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">— {t('selectProduct')} —</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {product && (
        <>
          <p style={s.printTitle}>{product.name}</p>
          <div className="barcode-grid" style={s.grid}>
            {product.variants.map(v => (
              <div key={v.id} className="barcode-card" style={s.barcodeCard}>
                <svg ref={el => barcodeRefs.current[v.id] = el} style={{ width: '100%' }} />
                <div style={s.variantInfo}>
                  <span style={s.variantLabel}>{v.color} / {v.size}</span>
                  <code style={s.variantCode}>{v.barcodeId}</code>
                </div>
                <button className="no-print" style={s.printSingleBtn} onClick={() => printSingle(v)}>
                  {t('print')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {!product && products.length > 0 && (
        <div style={s.empty} className="no-print">{t('selectProduct')}</div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '2rem 2.5rem', maxWidth: '1000px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '18px', fontWeight: '600', letterSpacing: '-0.3px' },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text2)', display: 'block', marginBottom: '6px' },
  select: { padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text)', width: '320px', outline: 'none' },
  printTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '1rem', display: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
  barcodeCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  variantInfo: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' },
  variantLabel: { fontSize: '13px', fontWeight: '500', color: 'var(--text)' },
  variantCode: { fontSize: '11px', color: 'var(--text3)', fontFamily: 'monospace' },
  printSingleBtn: { marginTop: '10px', width: '100%', padding: '6px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text2)' },
  btnGhost: { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text2)' },
  empty: { padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' },
}