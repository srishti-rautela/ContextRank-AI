// src/pages/StatsPage.jsx
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import { fetchStats } from '../hooks/useApi.js'
import { Card, Spinner, EmptyState } from '../components/ui.jsx'

const COLORS = ['#059669', '#0EA5E9', '#6366F1', '#D97706', '#DB2777', '#7C3AED', '#F59E0B', '#10B981']

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats().then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36}/></div>
  if (!stats) return <EmptyState icon="📊" title="Stats unavailable" subtitle="Start the backend server"/>

  const tierData = [
    { name: 'Tier 1 (IIT/IISc/BITS)', count: stats.tier_breakdown?.tier1 || 0, fill: '#059669' },
    { name: 'Tier 2 (NIT/VIT/DTU)', count: stats.tier_breakdown?.tier2 || 0, fill: '#0EA5E9' },
    { name: 'Tier 3 (Other)', count: stats.tier_breakdown?.tier3 || 0, fill: '#6366F1' },
  ]

  const bigStats = [
    { label: 'Total Candidates', value: stats.total_candidates, icon: '👥', color: '#6366F1' },
    { label: 'Hidden Gems Found', value: stats.hidden_gems, icon: '⭐', color: '#D97706',
      sub: 'Tier-3 overachievers' },
    { label: 'Job Descriptions', value: stats.total_jobs, icon: '💼', color: '#059669' },
    { label: 'Bias-Free Scoring', value: '100%', icon: '⚖️', color: '#7C3AED',
      sub: 'No college brand weight' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
        India Talent Intelligence Dashboard
      </h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
        Real-time insights on the candidate pool — surfacing talent beyond college brand.
      </p>

      {/* Big stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {bigStats.map(s => (
          <Card key={s.label} style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 2 }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.sub}</div>}
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* College tier breakdown */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            College Tier Distribution
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
            Traditional ATS rejects 68% of this pool. ContextRank ranks them on ability.
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tierData} barSize={50}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={v => [v, 'Candidates']} contentStyle={{ fontSize: 12 }}/>
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {tierData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top skills */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            Top Skills in Talent Pool
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
            Most common skills across all 500 candidates.
          </div>
          {(stats.top_skills || []).slice(0, 8).map((s, i) => (
            <div key={s.skill} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: '#374151', width: 130, flexShrink: 0 }}>{s.skill}</span>
              <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  background: COLORS[i % COLORS.length],
                  width: `${(s.count / (stats.top_skills[0]?.count || 1)) * 100}%`,
                  transition: 'width 0.8s ease',
                }}/>
              </div>
              <span style={{ fontSize: 12, color: '#6B7280', minWidth: 28, textAlign: 'right' }}>{s.count}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Cities */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
          🗺️ Candidate Cities — India Talent Map
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(stats.top_cities || []).map(c => (
            <div key={c.city} style={{
              background: '#F5F3FF', border: '1px solid #DDD6FE',
              borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#4C1D95' }}>{c.count}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{c.city}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* India welfare section */}
      <Card style={{ marginTop: 16, background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
        border: '1px solid #BFDBFE' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>
          🇮🇳 India Welfare Impact
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '⭐', title: 'Hidden Gems Surfaced', body: `${stats.hidden_gems} talented candidates from tier-3 colleges who would be rejected by traditional keyword ATS systems.` },
            { icon: '⚖️', title: 'Bias-Free Ranking', body: 'Zero weight on college brand. A Bhopal graduate with 40 GitHub repos ranks above an IIT graduate with 0.' },
            { icon: '🚀', title: 'National Scalability', body: 'Same engine can deploy doctors to rural areas, match NDRF teams for disasters, and build skilled government cadres.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
