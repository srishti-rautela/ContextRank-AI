// src/pages/RankPage.jsx
import { useEffect, useState, useCallback } from 'react'
import { rankCandidates } from '../hooks/useApi.js'
import { Badge, Spinner, EmptyState } from '../components/ui.jsx'
import CandidateCard from '../components/CandidateCard.jsx'
import LiveRankAnimation from '../components/LiveRankAnimation.jsx'
import SystemStatusBadge from '../components/SystemStatusBadge.jsx'
import CustomJDPanel from '../components/CustomJDPanel.jsx'
import RecruiterCopilot from '../components/RecruiterCopilot.jsx'

const JOBS = [
  { id: 'JD001', label: 'Senior AI/ML Engineer' },
  { id: 'JD002', label: 'Full Stack Developer' },
  { id: 'JD003', label: 'Data Scientist — Healthcare' },
  { id: 'JD004', label: 'Backend Engineer — Cloud' },
  { id: 'JD005', label: 'Computer Vision Engineer' },
  { id: 'JD006', label: 'Product Designer — Fintech' },
  { id: 'JD007', label: 'Security Engineer — Banking' },
  { id: 'JD008', label: 'Data Engineer — Analytics' },
  { id: 'JD009', label: 'DevOps Engineer' },
  { id: 'JD010', label: 'Junior Full Stack Developer' },
]

export default function RankPage({ jdId, setJdId, compareMode, selected, onCompare }) {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationDone, setAnimationDone] = useState(false)

  const load = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    setAnimationDone(false)
    try {
      const data = await rankCandidates(id, 20)
      setResults(data)
      setShowAnimation(true)
    } catch (e) {
      setError('Could not reach the API. Run: python3 backend/api/main.py')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(jdId) }, [jdId, load])

  const handleCustomResults = (data) => {
    setResults(data)
    setShowAnimation(true)
    setAnimationDone(false)
    setError(null)
  }

  return (
    <div>
      <CustomJDPanel onResults={handleCustomResults}/>

      {/* Job selector */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
        padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select Job Description
          </div>
          <SystemStatusBadge/>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {JOBS.map(j => (
            <button key={j.id} onClick={() => setJdId(j.id)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12.5, cursor: 'pointer', fontWeight: 600,
              border: jdId === j.id ? 'none' : '1px solid #D1D5DB',
              background: jdId === j.id ? '#6366F1' : '#fff',
              color: jdId === j.id ? '#fff' : '#374151',
            }}>{j.label}</button>
          ))}
        </div>
      </div>

      {compareMode && (
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10,
          padding: '10px 14px', marginBottom: 14, fontSize: 12.5, color: '#4338CA' }}>
          🔍 Compare mode active — select 2 candidates, then check the "Compare" tab for explainability. ({selected.length}/2)
        </div>
      )}

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spinner size={32}/></div>}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10,
          padding: '14px 16px', fontSize: 13, color: '#991B1B' }}>{error}</div>
      )}

      {results && !loading && showAnimation && !animationDone && (
        <LiveRankAnimation
          candidates={results.results}
          onComplete={() => setAnimationDone(true)}
        />
      )}

      {results && !loading && animationDone && (
        <>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Ranked for: {results.jd_title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Badge variant="purple">{results.total_pool} candidates ranked</Badge>
            <Badge variant="gem">⭐ {results.hidden_gems_found} hidden gems</Badge>
            {(results.decoded_skills || []).slice(0, 5).map(s => (
              <Badge key={s} variant="blue">{s}</Badge>
            ))}
          </div>
          {results.title_implied_signals && results.title_implied_signals.length > 0 && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap',
              marginBottom: 14, fontSize: 12, color: '#6B7280' }}>
              <span>Inferred from job title alone:</span>
              {results.title_implied_signals.map(s => (
                <Badge key={s} variant="purple">{s}</Badge>
              ))}
            </div>
          )}
          <RecruiterCopilot jdId={jdId} candidates={results.results} />
          {results.results.map(c => (
            <CandidateCard
              key={c.candidate_id}
              candidate={c}
              compareMode={compareMode}
              selected={selected.some(s => s.candidate_id === c.candidate_id)}
              onCompare={onCompare}
            />
          ))}
          {results.results.length === 0 && (
            <EmptyState icon="🔍" title="No candidates found" subtitle="Try a different job description"/>
          )}
        </>
      )}
    </div>
  )
}

