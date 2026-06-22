// src/components/CustomJDPanel.jsx
// The single most convincing live-demo feature: type ANY job description,
// in your own words, and watch the engine decode it and rank real
// candidates against it — proving this isn't a pre-canned dropdown demo.

import { useState } from 'react'
import { rankCustomJD } from '../hooks/useApi.js'
import { Badge, Spinner } from './ui.jsx'

const EXAMPLES = [
  "We need someone who has built things with FastAPI and knows how to design clean backend services that scale.",
  "Looking for a person who can make machines understand Hindi and English text — sentiment, intent, the works.",
  "Need a builder who's shipped computer vision models that actually run on cheap edge hardware, not just in a notebook.",
]

export default function CustomJDPanel({ onResults }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)

  const run = async () => {
    if (text.trim().length < 15) {
      setError('Write a bit more detail — at least one full sentence.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await rankCustomJD(text, 0, 15)
      onResults(data)
    } catch (e) {
      setError('Could not reach the API. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)',
      border: '1.5px solid #C7D2FE', borderRadius: 14,
      padding: '16px 18px', marginBottom: 16,
    }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3730A3' }}>
            🧪 Try your own job description
          </div>
          <div style={{ fontSize: 12, color: '#4338CA', marginTop: 2 }}>
            Type anything, in your own words — no keywords required. Watch the engine actually understand it.
          </div>
        </div>
        <span style={{ fontSize: 16, color: '#6366F1' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. We need someone who's comfortable making AI models behave in production, not just in a Jupyter notebook..."
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10,
              border: '1.5px solid #C7D2FE', fontSize: 13, fontFamily: 'inherit',
              resize: 'vertical', outline: 'none', background: '#fff',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#6366F1', alignSelf: 'center' }}>Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setText(ex)} style={{
                fontSize: 11, padding: '4px 9px', borderRadius: 14,
                border: '1px solid #C7D2FE', background: '#fff', color: '#4338CA',
                cursor: 'pointer',
              }}>example {i + 1}</button>
            ))}
          </div>

          <button onClick={run} disabled={loading} style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: '#6366F1', color: '#fff', fontWeight: 600, fontSize: 13,
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {loading && <Spinner size={14}/>}
            {loading ? 'Understanding & ranking...' : 'Rank candidates against this'}
          </button>

          {error && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#991B1B' }}>{error}</div>
          )}
        </div>
      )}
    </div>
  )
}
