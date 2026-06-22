// src/components/SystemStatusBadge.jsx
import { useEffect, useState } from 'react'

const API = '/api'

export default function SystemStatusBadge() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch(`${API}/system-status`)
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])

  if (!status) return null

  const isSemantic = status.embedding_mode === 'semantic'

  return (
    <div title={status.description} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
      background: isSemantic ? '#ECFDF5' : '#FFFBEB',
      border: `1px solid ${isSemantic ? '#6EE7B7' : '#FDE68A'}`,
      color: isSemantic ? '#065F46' : '#92400E',
      cursor: 'help',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isSemantic ? '#059669' : '#D97706',
        animation: isSemantic ? 'pulse-dot 2s ease-in-out infinite' : 'none',
      }}/>
      {isSemantic ? 'Semantic AI active (MiniLM)' : 'Lexical fallback mode'}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
