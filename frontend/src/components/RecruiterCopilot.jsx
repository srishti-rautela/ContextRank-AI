// src/components/RecruiterCopilot.jsx
// "Why is X ranked #N?" — a chat-style interface over real computed
// CapabilityDNA scores. Every sentence the copilot says is built from
// actual numbers already returned by the ranking engine — this is
// template-based, not an LLM call, specifically so it can never say
// something that doesn't match the real ranking.

import { useState } from 'react'
import { Badge, Spinner } from './ui.jsx'

const API = '/api'

export default function RecruiterCopilot({ jdId, candidates }) {
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const ask = async () => {
    if (!selectedId) return
    const candidate = candidates.find(c => c.candidate_id === selectedId)
    setLoading(true)
    setMessages(prev => [...prev, {
      role: 'user',
      text: `Why is ${candidate?.name || selectedId} ranked where they are?`,
    }])
    try {
      const res = await fetch(`${API}/copilot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_id: jdId, candidate_id: selectedId }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'copilot', data }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'copilot',
        data: null,
        error: 'Could not reach the API.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14,
      marginBottom: 16, overflow: 'hidden',
    }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', cursor: 'pointer',
        background: open ? '#FAFAF9' : '#fff',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
            💬 Ask the recruiter copilot
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            "Why is this candidate ranked here?" — answered from real scores, not guesses.
          </div>
        </div>
        <span style={{ fontSize: 14, color: '#9CA3AF' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 8,
                border: '1px solid #D1D5DB', fontSize: 13, background: '#fff',
              }}
            >
              <option value="">Select a candidate to ask about…</option>
              {candidates.map(c => (
                <option key={c.candidate_id} value={c.candidate_id}>
                  #{c.rank} {c.name} ({c.overall_match}%)
                </option>
              ))}
            </select>
            <button
              onClick={ask}
              disabled={!selectedId || loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#6366F1', color: '#fff', fontWeight: 600, fontSize: 13,
                cursor: selectedId && !loading ? 'pointer' : 'default',
                opacity: selectedId && !loading ? 1 : 0.5,
              }}
            >Ask</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
                <Spinner size={18} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChatBubble({ message }) {
  if (message.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '85%', marginLeft: 'auto' }}>
        <div style={{
          background: '#6366F1', color: '#fff', borderRadius: '12px 12px 2px 12px',
          padding: '8px 12px', fontSize: 13,
        }}>{message.text}</div>
      </div>
    )
  }

  if (message.error) {
    return (
      <div style={{ maxWidth: '85%' }}>
        <div style={{
          background: '#FEF2F2', color: '#991B1B', borderRadius: '12px 12px 12px 2px',
          padding: '8px 12px', fontSize: 13,
        }}>{message.error}</div>
      </div>
    )
  }

  const d = message.data
  return (
    <div style={{ maxWidth: '92%' }}>
      <div style={{
        background: '#F3F4F6', borderRadius: '12px 12px 12px 2px',
        padding: '12px 14px', fontSize: 13, color: '#111827',
      }}>
        <div style={{ marginBottom: 8 }}>{d.answer}</div>

        {d.is_hidden_gem && <Badge variant="gem">⭐ Hidden gem</Badge>}

        {d.growth_plan && d.growth_plan.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
              GROWTH PLAN
            </div>
            {d.growth_plan.map((g, i) => (
              <div key={i} style={{ fontSize: 12, color: '#4B5563' }}>• {g}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
