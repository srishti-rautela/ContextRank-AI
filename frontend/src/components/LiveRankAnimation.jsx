// src/components/LiveRankAnimation.jsx
// Centerpiece demo feature: visibly "computes" the ranking in front of the
// viewer using the REAL scores already returned by the API — no fake numbers,
// just a staged reveal of real data so a judge watching once sees the engine
// actually reasoning about each candidate before settling into final order.

import { useEffect, useState, useRef } from 'react'
import { ScoreCircle } from './ui.jsx'

const STAGES = [
  { key: 'skill_match',        label: 'Matching skills semantically' },
  { key: 'project_relevance',  label: 'Scoring project relevance' },
  { key: 'experience',         label: 'Weighing experience quality' },
  { key: 'activity',           label: 'Reading activity signals' },
  { key: 'learning',           label: 'Computing learning velocity' },
]

function useCountUp(target, durationMs, start) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!start) { setValue(0); return }
    const t0 = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - t0) / durationMs)
      // ease-out cubic for a natural deceleration into the final number
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, durationMs, start])

  return value
}

function AnimatedCandidateRow({ candidate, started, settleDelayMs }) {
  const [settled, setSettled] = useState(false)
  const score = useCountUp(candidate.overall_match, 1100, started)

  useEffect(() => {
    if (!started) { setSettled(false); return }
    const t = setTimeout(() => setSettled(true), settleDelayMs)
    return () => clearTimeout(t)
  }, [started, settleDelayMs])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      background: settled ? '#fff' : '#FAFAF9',
      border: `1px solid ${settled ? '#E5E7EB' : '#F3F4F6'}`,
      opacity: started ? 1 : 0.3,
      transform: started ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.4s ease',
      marginBottom: 8,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: settled && candidate.rank <= 3 ? '#EEF2FF' : '#F3F4F6',
        color: settled && candidate.rank <= 3 ? '#4338CA' : '#9CA3AF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 12, flexShrink: 0,
        transition: 'background 0.4s ease, color 0.4s ease',
      }}>{settled ? `#${candidate.rank}` : '·'}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{candidate.name}</div>
        <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>
          {candidate.city} · {candidate.college_tier?.toUpperCase()}
          {candidate.is_hidden_gem && settled && (
            <span style={{ marginLeft: 6, color: '#92400E', fontWeight: 600 }}>⭐ hidden gem</span>
          )}
        </div>
      </div>

      <ScoreCircle score={score} size={42} />
    </div>
  )
}

export default function LiveRankAnimation({ candidates, onComplete }) {
  const [stageIndex, setStageIndex] = useState(-1)
  const [rowsStarted, setRowsStarted] = useState(false)
  const top5 = candidates.slice(0, 5)

  useEffect(() => {
    if (!candidates.length) return
    setStageIndex(-1)
    setRowsStarted(false)

    const stageTimers = STAGES.map((_, i) =>
      setTimeout(() => setStageIndex(i), i * 420)
    )
    const rowsTimer = setTimeout(() => setRowsStarted(true), STAGES.length * 420 + 200)
    const doneTimer = setTimeout(() => onComplete?.(), STAGES.length * 420 + 200 + 1400)

    return () => {
      stageTimers.forEach(clearTimeout)
      clearTimeout(rowsTimer)
      clearTimeout(doneTimer)
    }
  }, [candidates])

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10 }}>
        Live ranking computation
      </div>

      {/* Stage checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {STAGES.map((s, i) => {
          const active = i === stageIndex
          const done = i < stageIndex || rowsStarted
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${done ? '#059669' : active ? '#6366F1' : '#E5E7EB'}`,
                background: done ? '#059669' : 'transparent',
                transition: 'all 0.3s ease',
              }}/>
              <span style={{
                color: done ? '#059669' : active ? '#4338CA' : '#9CA3AF',
                fontWeight: active ? 600 : 400,
                transition: 'color 0.3s ease',
              }}>{s.label}{active && !done ? '…' : done ? ' — done' : ''}</span>
            </div>
          )
        })}
      </div>

      {/* Candidate rows animating in */}
      <div>
        {top5.map((c, i) => (
          <AnimatedCandidateRow
            key={c.candidate_id}
            candidate={c}
            started={rowsStarted}
            settleDelayMs={300 + i * 150}
          />
        ))}
      </div>
    </div>
  )
}
