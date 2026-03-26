import { useLanguage } from '../context/LanguageContext'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  const { t } = useLanguage()

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <p style={s.message}>{message}</p>
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onCancel}>{t('cancel')}</button>
          <button style={s.confirmBtn} onClick={onConfirm}>{t('delete')}</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(2px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '360px' },
  message: { fontSize: '14px', color: 'var(--text)', marginBottom: '1.25rem', lineHeight: '1.6' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '13px', color: 'var(--text2)' },
  confirmBtn: { padding: '8px 16px', background: 'var(--danger-bg)', border: '1px solid #f8717133', borderRadius: '7px', fontSize: '13px', color: 'var(--danger)', fontWeight: '500' },
}