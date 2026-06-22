// src/pages/GemsPage.jsx
import { useEffect, useState } from 'react'
import { fetchHiddenGems } from '../hooks/useApi.js'
import { Card, Spinner, EmptyState } from '../components/ui.jsx'
import CandidateCard from '../components/CandidateCard.jsx'

export default function GemsPage({ jdId, compareMode, selected, onCompare }) {
  const [gems, setGems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchHiddenGems(jdId, 10)
      .then(d => { setGems(d); setLoading(false) })
      .catch(() => { setError('Could not load hidden gems'); setLoading(false) })
  }, [jdId])

  return (
    <div>
      <Card style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        border: '1px solid #FDE68A', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
          ⭐ What is a Hidden Gem?
        </div>
        <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
          Candidates from tier-3 colleges whose project impact, GitHub activity, and learning velocity
          exceed what a traditional keyword-based ATS would expect. These candidates are rejected by
          90% of recruitment systems today — purely because of their college name.
          ContextRank's FairRank engine surfaces them based on ability signals alone.
        </div>
        {gems && (
          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#B45309' }}>
            Total hidden gems in pool: {gems.total_hidden_gems}
          </div>
        )}
      </Card>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spinner size={32}/></div>}
      {error && <Card style={{ background: '#FEF2F2' }}><span style={{ color: '#991B1B', fontSize: 13 }}>{error}</span></Card>}
      {gems && !loading && gems.hidden_gems.length === 0 && (
        <EmptyState icon="💎" title="No hidden gems for this role" subtitle="Try a different job description"/>
      )}
      {gems && !loading && gems.hidden_gems.map((c, i) => (
        <CandidateCard
          key={c.candidate_id}
          candidate={{ ...c, rank: i + 1 }}
          compareMode={compareMode}
          selected={selected.some(s => s.candidate_id === c.candidate_id)}
          onCompare={onCompare}
        />
      ))}
    </div>
  )
}
