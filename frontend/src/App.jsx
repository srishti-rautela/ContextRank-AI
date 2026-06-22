// src/App.jsx
import { useState } from 'react'
import RankPage from './pages/RankPage.jsx'
import GemsPage from './pages/GemsPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import ComparePage from './pages/ComparePage.jsx'

const TABS = [
  { id: 'rank',    label: '🏆 Ranked Results' },
  { id: 'gems',    label: '⭐ Hidden Gems' },
  { id: 'compare', label: '⚖️ Compare' },
  { id: 'stats',   label: '📊 Dataset Stats' },
]

export default function App() {
  const [tab, setTab] = useState('rank')
  const [jdId, setJdId] = useState('JD001')
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState([])

  const handleCompare = (candidate) => {
    setSelected(prev => {
      const exists = prev.find(c => c.candidate_id === candidate.candidate_id)
      if (exists) return prev.filter(c => c.candidate_id !== candidate.candidate_id)
      if (prev.length >= 2) return [prev[1], candidate]
      return [...prev, candidate]
    })
  }

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: '#F5F4F0', minHeight: '100vh', padding: '24px 20px',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>
              🇮🇳 ContextRank
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
              Intelligent Candidate Discovery Engine — Bias-Free Talent Intelligence
            </p>
          </div>
          <button onClick={() => { setCompareMode(m => !m); if (compareMode) setSelected([]) }}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: compareMode ? 'none' : '1px solid #D1D5DB',
              background: compareMode ? '#6366F1' : '#fff',
              color: compareMode ? '#fff' : '#374151',
            }}>
            {compareMode ? '✓ Compare Mode ON' : 'Enable Compare Mode'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #E5E7EB', paddingBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none', borderBottom: tab === t.id ? '2.5px solid #6366F1' : '2.5px solid transparent',
              background: 'transparent',
              color: tab === t.id ? '#4338CA' : '#6B7280',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Page content */}
        {tab === 'rank' && (
          <RankPage jdId={jdId} setJdId={setJdId} compareMode={compareMode} selected={selected} onCompare={handleCompare}/>
        )}
        {tab === 'gems' && (
          <GemsPage jdId={jdId} compareMode={compareMode} selected={selected} onCompare={handleCompare}/>
        )}
        {tab === 'compare' && (
          <ComparePage jdId={jdId} selected={selected} onClear={() => setSelected([])}/>
        )}
        {tab === 'stats' && <StatsPage/>}

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 32, paddingTop: 16,
          borderTop: '1px solid #E5E7EB' }}>
          Built for the Data & AI Challenge — Intelligent Candidate Discovery Track 🇮🇳
        </div>
      </div>
    </div>
  )
}
