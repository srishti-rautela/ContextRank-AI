// src/components/ui.jsx — shared UI primitives

export function Badge({ children, variant = 'gray' }) {
  const styles = {
    gem:    { background: '#FDF3E3', color: '#92400E', border: '1px solid #F59E0B' },
    green:  { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' },
    blue:   { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #93C5FD' },
    purple: { background: '#F5F3FF', color: '#4C1D95', border: '1px solid #C4B5FD' },
    red:    { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' },
    gray:   { background:
"rgba(56,189,248,.15)", color: '#94a3b8', border: '1px solid #D1D5DB' },
    tier1:  { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' },
    tier2:  { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #93C5FD' },
    tier3:  { background:
"rgba(56,189,248,.15)", color: '#94a3b8', border: '1px solid #D1D5DB' },
  }
  const s = styles[variant] || styles.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 20, ...s,
    }}>{children}</span>
  )
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px',
      ...style,
    }}>{children}</div>
  )
}

export function ScoreCircle({ score, size = 60 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(score, 100) / 100)
  const color = score >= 65 ? '#059669' : score >= 45 ? '#D97706' : '#DC2626'
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fontSize={size > 55 ? 14 : 11} fontWeight={700}
        fill={color}>{Math.round(score)}</text>
    </svg>
  )
}

export function ProgressBar({ value, color = '#6366F1', height = 5 }) {
  return (
    <div style={{ background: '#E5E7EB', borderRadius: height, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: height,
        transition: 'width 0.8s ease',
      }}/>
    </div>
  )
}

export function Spinner({size=30}){

return (

<div

style={{

width:size,
height:size,

borderRadius:"50%",

border:"4px solid rgba(255,255,255,.25)",

borderTop:
"4px solid #38bdf8",

animation:
"spin .8s linear infinite"

}}

/>

)

}
export function EmptyState({ icon = '🔍', title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13 }}>{subtitle}</div>}
    </div>
  )
}
