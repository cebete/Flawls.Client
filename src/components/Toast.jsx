import { useEffect, useState } from 'react'

export default function Toast({ message, type, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  const isSuccess = type === 'success'

  return (
    <div style={{
      ...s.toast,
      background: isSuccess ? 'var(--success-bg)' : 'var(--danger-bg)',
      borderColor: isSuccess ? '#4ade8033' : '#f8717133',
      color: isSuccess ? 'var(--success)' : 'var(--danger)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
    }}>
      <span>{isSuccess ? '✓' : '✗'}</span>
      <span>{message}</span>
    </div>
  )
}

const s = {
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    borderRadius: '9px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '500',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    zIndex: 1000,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    minWidth: '260px',
  },
}