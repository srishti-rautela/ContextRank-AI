// src/components/CandidateCard.jsx
import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import { Badge, ScoreCircle, ProgressBar } from './ui.jsx'

const DIMS = [
  { key: 'skill_match',       label: 'Skill Match',   color: '#6366F1' },
  { key: 'project_relevance', label: 'Projects',      color: '#059669' },
  { key: 'experience',        label: 'Experience',    color: '#0EA5E9' },
  { key: 'activity',          label: 'Activity',      color: '#D97706' },
  { key: 'learning',          label: 'Learning',      color: '#7C3AED' },
  { key: 'potential',         label: 'Potential',     color: '#DB2777' },
]

export default function CandidateCard({ candidate: c, onCompare, compareMode, selected }) {
  const [open, setOpen] = useState(false)

  const radarData = DIMS.map(d => ({
    subject: d.label,
    score: Math.round((c.dimensions?.[d.key] || 0)),
  }))

  const tierVariant = { tier1: 'green', tier2: 'blue', tier3: 'gray' }[c.college_tier] || 'gray'

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${selected ? '#6366F1' : open ? '#C7D2FE' : '#E5E7EB'}`,
      borderRadius: 14,
      marginBottom: 10,
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: open ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
    }}>
      {/* ── Header ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
      >
        {/* Rank badge */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: c.rank <= 3 ? '#EEF2FF' : '#F3F4F6',
          color: c.rank <= 3 ? '#4338CA' : '#6B7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>#{c.rank}</div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{c.name}</span>
            {c.is_hidden_gem && <Badge variant="gem">⭐ Hidden Gem</Badge>}
            <Badge variant={tierVariant}>{c.college_tier?.toUpperCase()}</Badge>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            📍 {c.city} &nbsp;·&nbsp; 🎓 {c.college} &nbsp;·&nbsp; 💼 {c.experience_years}yr exp
          </div>
          {/* Skills pills */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {(c.skills || []).slice(0, 5).map(s => (
              <span key={s} style={{
                fontSize: 11, padding: '1px 7px', borderRadius: 6,
                background: '#F3F4F6', color: '#374151',
              }}>{s}</span>
            ))}
            {(c.skills || []).length > 5 &&
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>+{c.skills.length - 5}</span>}
          </div>
        </div>

        {/* Score ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <ScoreCircle score={c.overall_match} size={56}/>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>match</span>
        </div>

        {/* Compare button */}
        {compareMode && (
          <button
            onClick={e => { e.stopPropagation(); onCompare(c) }}
            style={{
              padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: selected ? '1.5px solid #6366F1' : '1px solid #D1D5DB',
              background: selected ? '#EEF2FF' : '#fff',
              color: selected ? '#4338CA' : '#374151',
            }}
          >{selected ? '✓ Selected' : 'Compare'}</button>
        )}

        <span style={{ fontSize: 16, color: '#9CA3AF', marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* ── Expanded detail ── */}
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>

            {/* Dimension bars */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Capability DNA
              </div>
              {DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: '#374151', marginBottom: 3 }}>
                    <span>{d.label}</span>
                    <span style={{ fontWeight: 600 }}>{Math.round(c.dimensions?.[d.key] || 0)}%</span>
                  </div>
                  <ProgressBar value={c.dimensions?.[d.key] || 0} color={d.color}/>
                </div>
              ))}
            </div>

            {/* Radar chart */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Talent Radar
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                    <PolarGrid stroke="#E5E7EB"/>
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }}/>
                    <Radar dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.18} strokeWidth={2}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths / Growth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0',
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                ✅ Strengths
              </div>
              {(c.strengths || ['No data']).map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: '#047857', marginBottom: 4 }}>• {s}</div>
              ))}
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
                🚀 30-Day Growth Plan
              </div>
              {(c.growth_plan || ['Keep building!']).map((g, i) => (
                <div key={i} style={{ fontSize: 12, color: '#B45309', marginBottom: 4 }}>• {g}</div>
              ))}
            </div>
          </div>

          {/* Activity + Projects */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            {/* Activity */}
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE',
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4C1D95', marginBottom: 8 }}>
                📊 Activity Signals
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  ['GitHub Repos', c.github_repos],
                  ['GitHub Stars', c.github_stars],
                  ['LeetCode Solved', c.leetcode_solved],
                  ['Kaggle Rank', c.kaggle_rank || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: '#5B21B6' }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>
                🛠 Projects
              </div>
              {(c.projects || []).slice(0, 2).map((p, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#3B82F6' }}>
                    {(p.tech_stack || []).join(', ')}
                    <span style={{ marginLeft: 6, fontWeight: 600 }}>
                      [{p.impact_level} impact]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          {(c.certifications || []).length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#6B7280', marginRight: 4 }}>📜 Certs:</span>
              {c.certifications.map(cert => (
                <Badge key={cert} variant="purple">{cert}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
