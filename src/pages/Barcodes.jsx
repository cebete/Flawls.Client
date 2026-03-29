import { useEffect, useState, useRef } from 'react'
import client from '../api/client'
import JsBarcode from 'jsbarcode'
import { useLanguage } from '../context/LanguageContext'

export default function Barcodes() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState('')
  const [selectedVariants, setSelectedVariants] = useState(new Set())
  const barcodeRefs = useRef({})
  const { t } = useLanguage()

  useEffect(() => {
    client.get('/products').then(r => setProducts(r.data))
  }, [])

  const product = products.find(p => p.id === parseInt(selected))

  useEffect(() => {
    setSelectedVariants(new Set())
    if (!product) return
    product.variants.forEach(v => {
      const el = barcodeRefs.current[v.id]
      if (el) {
        try {
          JsBarcode(el, v.barcodeId, {
            format: 'EAN13', width: 2, height: 56,
            displayValue: true, fontSize: 11, margin: 8,
            background: 'transparent', lineColor: '#000',
          })
        } catch {
          JsBarcode(el, v.barcodeId, {
            format: 'CODE128', width: 2, height: 56,
            displayValue: true, fontSize: 11, margin: 8,
            background: 'transparent', lineColor: '#000',
          })
        }
      }
    })
  }, [product])

  function toggleSelect(variantId) {
    setSelectedVariants(prev => {
      const next = new Set(prev)
      next.has(variantId) ? next.delete(variantId) : next.add(variantId)
      return next
    })
  }

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
          </style>
        </head>
        <body>
          ${svgHTML}
          <script>window.onload = () => { window.print(); window.close() }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  function printSelected() {
    if (selectedVariants.size === 0) return
    const variants = product.variants.filter(v => selectedVariants.has(v.id))
    const labels = variants.map(v => {
      const svgEl = barcodeRefs.current[v.id]
      return svgEl ? `<div class="barcode-card">${svgEl.outerHTML}</div>` : ''
    }).join('')

    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>Selected Barcodes</title>
          <style>
            @page { margin: 16px; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #fff; font-family: system-ui, sans-serif; }
            .barcode-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              padding: 16px;
            }
            .barcode-card {
              break-inside: avoid;
              background: #fff;
              text-align: center;
              padding: 12px;
            }
            .barcode-card svg { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="barcode-grid">${labels}</div>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedVariants.size > 0 && (
            <button style={s.btnPrimary} onClick={printSelected}>
              Print selected ({selectedVariants.size})
            </button>
          )}
          {product && (
            <button style={s.btnGhost} onClick={() => window.print()}>{t('printAll')}</button>
          )}
        </div>
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
            {product.variants.map(v => {
              const isSelected = selectedVariants.has(v.id)
              return (
                <div
                  key={v.id}
                  className="barcode-card"
                  style={{
                    ...s.barcodeCard,
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleSelect(v.id)}
                >
                  <div style={{ pointerEvents: 'none' }}>
                    <svg ref={el => barcodeRefs.current[v.id] = el} style={{ width: '100%' }} />
                  </div>
                  {isSelected && (
                    <div style={s.selectedBadge}>✓</div>
                  )}
                  <button
                    className="no-print"
                    style={s.printSingleBtn}
                    onClick={e => { e.stopPropagation(); printSingle(v) }}
                  >
                    {t('print')}
                  </button>
                </div>
              )
            })}
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
  barcodeCard: { background: 'var(--bg2)', borderRadius: '10px', padding: '14px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', transition: 'border-color 0.15s' },
  selectedBadge: { position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: 'var(--accent)', color: '#111', borderRadius: '50%', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  printSingleBtn: { marginTop: '10px', width: '100%', padding: '6px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text2)' },
  btnGhost: { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text2)' },
  btnPrimary: { padding: '8px 16px', background: 'var(--accent)', color: '#111', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600' },
  empty: { padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' },
}