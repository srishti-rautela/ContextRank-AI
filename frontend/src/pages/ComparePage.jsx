// src/pages/ComparePage.jsx
import { useState } from 'react'
import { explainComparison } from '../hooks/useApi.js'
import { Card, Spinner, EmptyState, ScoreCircle } from '../components/ui.jsx'

export default function ComparePage({ jdId, selected, onClear }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canCompare = selected.length === 2

  const runCompare = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await explainComparison(jdId, selected[0].candidate_id, selected[1].candidate_id)
      setResult(data)
    } catch (e) {
      setError('Could not reach the API. Make sure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  if (!canCompare) {
    return (
      <Card>
        <EmptyState
          icon="⚖️"
          title="Select 2 candidates to compare"
          subtitle={`Go to "Ranked Results", click "Compare" on two candidates, then come back here. (${selected.length}/2 selected)`}
        />
      </Card>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
        Head-to-Head Explainability
      </h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
        Why does one candidate outrank the other? Full dimension breakdown.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        {selected.map((c, i) => (
          <Card key={c.candidate_id} style={{ textAlign: 'center' }}>
            <ScoreCircle score={c.overall_match} size={64} />
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8, color: '#111827' }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{c.college} ({c.college_tier})</div>
          </Card>
        )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <div key="vs" style={{ fontWeight: 800, color: '#9CA3AF', fontSize: 14 }}>VS</div>, el], [])}
      </div>

      {!result && (
        <button onClick={runCompare} disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: '#6366F1', color: '#fff', fontWeight: 600, fontSize: 14,
          cursor: 'pointer', marginBottom: 16,
        }}>
          {loading ? 'Analyzing...' : 'Run Explainability Analysis'}
        </button>
      )}

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Spinner size={30}/></div>}
      {error && <Card style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
        <span style={{ color: '#991B1B', fontSize: 13 }}>{error}</span>
      </Card>}

      {result && (
        <>
          <Card style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4C1D95', marginBottom: 6 }}>
              🏆 Winner: {result.winner} (by {result.margin} points)
            </div>
            <div style={{ fontSize: 13, color: '#5B21B6' }}>{result.explanation}</div>
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
              Key Dimension Differences
            </div>
            {result.key_differences.map(d => (
              <div key={d.dimension} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12,
                  color: '#374151', marginBottom: 4, textTransform: 'capitalize' }}>
                  <span>{d.dimension.replace(/_/g, ' ')}</span>
                  <span style={{ fontWeight: 700, color: d.diff > 0 ? '#059669' : '#DC2626' }}>
                    {d.diff > 0 ? '+' : ''}{d.diff}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${d.a}%`, background: '#6366F1', borderRadius: 4 }}/>
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7280', width: 60 }}>A: {d.a}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
                  <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${d.b}%`, background: '#D97706', borderRadius: 4 }}/>
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7280', width: 60 }}>B: {d.b}</span>
                </div>
              </div>
            ))}
          </Card>

          <button onClick={() => { setResult(null); onClear() }} style={{
            marginTop: 12, padding: '8px 16px', borderRadius: 8, fontSize: 12,
            border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', color: '#374151',
          }}>Clear selection</button>
        </>
      )}
    </div>
  )
}
