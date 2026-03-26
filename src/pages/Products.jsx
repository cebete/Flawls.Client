import { useEffect, useState } from 'react'
import client from '../api/client'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import HistoryModal from '../components/HistoryModal'
import { useLanguage } from '../context/LanguageContext'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size']
const emptyVariant = () => ({ color: '', size: 'S', initialQuantity: 0 })

export default function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', costPrice: '', sellingPrice: '',
    imageUrl: '', notes: '', lowStockThreshold: null, variants: [emptyVariant()]
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [toasts, setToasts] = useState([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [historyVariant, setHistoryVariant] = useState(null)
  const [duplicating, setDuplicating] = useState(null)
  const { t } = useLanguage()

  function addToast(message, type) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }
  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  async function load() {
    const res = await client.get('/products')
    setProducts(res.data)
  }

  useEffect(() => { load() }, [])

  function updateVariant(i, field, value) {
    setForm(f => {
      const variants = [...f.variants]
      variants[i] = { ...variants[i], [field]: value }
      return { ...f, variants }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await client.post('/products', {
        ...form,
        costPrice: parseFloat(form.costPrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        lowStockThreshold: form.lowStockThreshold ?? 0,
        variants: form.variants.map(v => ({ ...v, initialQuantity: parseInt(v.initialQuantity) || 0 })),
      })
      setShowForm(false)
      setForm({ name: '', category: '', costPrice: '', sellingPrice: '', imageUrl: '', notes: '', lowStockThreshold: null, variants: [emptyVariant()] })
      load()
      addToast(t('productSaved'), 'success')
    } catch {
      setError(t('failedSave'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id) {
    setConfirm({
      message: t('deleteProduct'),
      onConfirm: async () => {
        setConfirm(null)
        await client.delete(`/products/${id}`)
        addToast(t('productDeleted'), 'success')
        load()
      }
    })
  }

  async function duplicateProduct(id) {
    setDuplicating(id)
    try {
      await client.post(`/products/${id}/duplicate`)
      addToast(t('productDuplicated'), 'success')
      load()
    } catch {
      addToast(t('failedDuplicate'), 'error')
    } finally {
      setDuplicating(null)
    }
  }

  async function adjustStock(variantId, delta) {
    await client.patch(`/variants/${variantId}/stock`, { delta, reason: 'manual' })
    load()
  }

  function exportCSV() {
    const rows = [
      ['Product', 'Category', 'Cost (€)', 'Sell (€)', 'Color', 'Size', 'Barcode ID', 'Stock']
    ]
    products.forEach(p => {
      p.variants.forEach(v => {
        rows.push([p.name, p.category || '', p.costPrice.toFixed(2), p.sellingPrice.toFixed(2), v.color, v.size, v.barcodeId, v.quantity])
      })
    })
    const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flawls-stock-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some(v =>
        v.color.toLowerCase().includes(search.toLowerCase()) ||
        v.barcodeId.toLowerCase().includes(search.toLowerCase())
      )
    const matchesCategory = !filterCategory || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <h2 style={s.title}>{t('products')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={s.btnGhost} onClick={exportCSV}>{t('exportCSV')}</button>
          <button style={showForm ? s.btnGhost : s.btnPrimary} onClick={() => setShowForm(v => !v)}>
            {showForm ? t('cancel') : t('addProduct')}
          </button>
        </div>
      </div>

      <div style={s.filterBar}>
        <input
          style={{ ...s.input, maxWidth: '280px' }}
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={{ ...s.input, width: '180px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">{t('allCategories')}</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterCategory) && (
          <button style={s.btnGhost} onClick={() => { setSearch(''); setFilterCategory('') }}>{t('clear')}</button>
        )}
        <span style={s.resultCount}>
          {filtered.length} {t('of')} {products.length} {products.length !== 1 ? t('products2') : t('product')}
        </span>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <p style={s.formTitle}>{t('newProduct')}</p>
          <form onSubmit={handleSubmit}>
            <div style={s.grid2}>
              <div style={s.col}>
                <label style={s.label}>{t('name')} *</label>
                <input style={s.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <label style={s.label}>{t('category')}</label>
                <input style={s.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                <div style={s.row2}>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>{t('costPrice')}</label>
                    <input style={s.input} type="number" step="0.01" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>{t('sellingPrice')}</label>
                    <input style={s.input} type="number" step="0.01" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))} />
                  </div>
                </div>
                <label style={s.label}>{t('lowStockAlert')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="threshold-toggle"
                    checked={form.lowStockThreshold !== null}
                    onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.checked ? 3 : null }))}
                  />
                  <label htmlFor="threshold-toggle" style={{ fontSize: '13px', color: 'var(--text2)', cursor: 'pointer' }}>
                    {t('alertWhenStock')}
                  </label>
                  {form.lowStockThreshold !== null && (
                    <input
                      style={{ ...s.input, width: '70px' }}
                      type="number" min="0" max="100"
                      value={form.lowStockThreshold}
                      onChange={e => setForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                    />
                  )}
                  {form.lowStockThreshold !== null && (
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{t('units')}</span>
                  )}
                </div>
              </div>
              <div style={s.col}>
                <label style={s.label}>{t('imageUrl')}</label>
                <input style={s.input} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                <label style={s.label}>{t('notes')}</label>
                <textarea style={{ ...s.input, minHeight: '90px', resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label style={s.label}>{t('variants')}</label>
              <div style={s.variantHeader}>
                {[t('color'), t('size'), t('initialQty'), ''].map(h => <span key={h} style={s.variantHeaderCell}>{h}</span>)}
              </div>
              {form.variants.map((v, i) => (
                <div key={i} style={s.variantRow}>
                  <input style={s.input} placeholder="e.g. Blue" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                  <select style={s.input} value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}>
                    {SIZES.map(sz => <option key={sz}>{sz}</option>)}
                  </select>
                  <input style={s.input} type="number" min="0" value={v.initialQuantity} onChange={e => updateVariant(i, 'initialQuantity', e.target.value)} />
                  <button type="button" style={s.removeBtn} onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }))}>×</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <button type="button" style={s.btnGhost} onClick={() => setForm(f => ({ ...f, variants: [...f.variants, emptyVariant()] }))}>
                  {t('addVariant')}
                </button>
                <button type="button" style={s.btnGhost} onClick={() => {
                  const lastVariant = form.variants[form.variants.length - 1]
                  const color = lastVariant?.color || ''
                  const existingVariants = lastVariant?.size === 'S' && lastVariant?.color === '' ? form.variants.slice(0, -1) : form.variants
                  const targetSizes = ['S', 'M', 'L', 'XL']
                  const existingSizes = existingVariants.filter(v => v.color === color).map(v => v.size)
                  const newVariants = targetSizes.filter(size => !existingSizes.includes(size)).map(size => ({ color, size, initialQuantity: 0 }))
                  setForm(f => ({ ...f, variants: [...existingVariants, ...newVariants] }))
                }}>
                  {t('generate4')}
                </button>
                <button type="button" style={s.btnGhost} onClick={() => {
                  const lastVariant = form.variants[form.variants.length - 1]
                  const color = lastVariant?.color || ''
                  const existingVariants = lastVariant?.size === 'S' && lastVariant?.color === '' ? form.variants.slice(0, -1) : form.variants
                  const targetSizes = ['S', 'M', 'L', 'XL', 'XXL']
                  const existingSizes = existingVariants.filter(v => v.color === color).map(v => v.size)
                  const newVariants = targetSizes.filter(size => !existingSizes.includes(size)).map(size => ({ color, size, initialQuantity: 0 }))
                  setForm(f => ({ ...f, variants: [...existingVariants, ...newVariants] }))
                }}>
                  {t('generate5')}
                </button>
              </div>
            </div>

            {error && <div style={s.error}>{error}</div>}
            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" style={s.btnPrimary} disabled={saving}>
                {saving ? t('saving') : t('saveProduct')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginTop: showForm ? '1.5rem' : '0' }}>
        {products.length === 0 ? (
          <div style={s.empty}>{t('noProducts')}</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>{t('noMatch')}</div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={s.productCard}>
              <div style={s.productTop}>
                <div style={s.productMeta}>
                  <span style={s.productName}>{p.name}</span>
                  {p.category && <span style={s.pill}>{p.category}</span>}
                  <span style={s.meta}>€{p.costPrice.toFixed(2)} {t('cost')} · €{p.sellingPrice.toFixed(2)} {t('sell')}</span>
                  {p.lowStockThreshold > 0 && (
                    <span style={s.meta}>{t('alertAt')} {p.lowStockThreshold} {t('units')}</span>
                  )}
                </div>
                <div style={s.productActions}>
                  <span style={s.stockBadge}>{p.totalStock} {t('units')}</span>
                  <button style={s.ghostSmall} onClick={() => duplicateProduct(p.id)} disabled={duplicating === p.id}>
                    {duplicating === p.id ? t('duplicating') : t('duplicate')}
                  </button>
                  <button style={s.dangerBtn} onClick={() => deleteProduct(p.id)}>{t('delete')}</button>
                </div>
              </div>

              <table style={s.table}>
                <thead>
                  <tr>
                    {[t('colorCol'), t('sizeCol'), t('barcodeId'), t('stock'), ''].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map(v => (
                    <tr key={v.id}>
                      <td style={s.td}>{v.color}</td>
                      <td style={s.td}><span style={s.pill}>{v.size}</span></td>
                      <td style={s.td}><code style={s.code}>{v.barcodeId}</code></td>
                      <td style={s.td}>
                        <div style={s.qtyCtrl}>
                          <button style={s.qtyBtn} onClick={() => adjustStock(v.id, -1)}>−</button>
                          <span style={s.qtyVal}>{v.quantity}</span>
                          <button style={s.qtyBtn} onClick={() => adjustStock(v.id, 1)}>+</button>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={s.ghostSmall} onClick={() => setHistoryVariant(v)}>{t('history')}</button>
                          <button style={s.ghostSmall} onClick={() => client.delete(`/variants/${v.id}`).then(load)}>{t('remove')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {historyVariant && <HistoryModal variant={historyVariant} onClose={() => setHistoryVariant(null)} />}
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onDone={() => removeToast(t.id)} />)}
    </div>
  )
}

const s = {
  page: { padding: '2rem 2.5rem', maxWidth: '1100px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  title: { fontSize: '18px', fontWeight: '600', letterSpacing: '-0.3px' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  resultCount: { fontSize: '12px', color: 'var(--text3)', marginLeft: '4px' },
  formCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text2)', marginBottom: '1.25rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  col: { display: 'flex', flexDirection: 'column' },
  row2: { display: 'flex', gap: '10px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text2)', marginBottom: '5px', marginTop: '12px', display: 'block' },
  input: { width: '100%', padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text)', outline: 'none' },
  variantHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '6px' },
  variantHeaderCell: { fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px', padding: '0 2px' },
  variantRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '6px', alignItems: 'center' },
  removeBtn: { padding: '8px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--danger)', fontSize: '14px' },
  btnPrimary: { padding: '8px 16px', background: 'var(--accent)', color: '#111', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600' },
  btnGhost: { padding: '8px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text2)' },
  error: { marginTop: '12px', padding: '9px 12px', background: 'var(--danger-bg)', border: '1px solid #f8717133', borderRadius: '7px', color: 'var(--danger)', fontSize: '13px' },
  empty: { padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: '13px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' },
  productCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', marginBottom: '10px' },
  productTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  productMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  productName: { fontSize: '15px', fontWeight: '600', letterSpacing: '-0.2px' },
  pill: { padding: '2px 8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '11px', color: 'var(--text2)' },
  meta: { fontSize: '12px', color: 'var(--text3)' },
  productActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  stockBadge: { padding: '4px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: 'var(--text2)' },
  dangerBtn: { padding: '5px 12px', background: 'transparent', border: '1px solid #f8717133', borderRadius: '6px', fontSize: '12px', color: 'var(--danger)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '6px 10px', fontSize: '11px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.4px' },
  td: { padding: '9px 10px', borderBottom: '1px solid var(--border)' },
  code: { fontFamily: 'monospace', fontSize: '12px', background: 'var(--bg3)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text2)', border: '1px solid var(--border)' },
  qtyCtrl: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: { width: '24px', height: '24px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyVal: { fontWeight: '500', minWidth: '24px', textAlign: 'center', color: 'var(--text)' },
  ghostSmall: { padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', fontSize: '12px', color: 'var(--text3)' },
}