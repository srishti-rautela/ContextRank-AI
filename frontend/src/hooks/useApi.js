// src/hooks/useApi.js
// Centralised API calls for ContextRank backend

const BASE = '/api'  // proxied to http://localhost:8000 via vite

export async function rankCandidates(jdId, topN = 20) {
  const res = await fetch(`${BASE}/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jd_id: jdId, top_n: topN }),
  })
  if (!res.ok) throw new Error(`Rank API error: ${res.status}`)
  return res.json()
}

export async function rankCustomJD(jdText, minExp = 0, topN = 20) {
  const res = await fetch(`${BASE}/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jd_text: jdText, min_experience: minExp, top_n: topN }),
  })
  if (!res.ok) throw new Error(`Custom JD rank error: ${res.status}`)
  return res.json()
}

export async function fetchHiddenGems(jdId = 'JD001', topN = 10) {
  const res = await fetch(`${BASE}/hidden-gems?jd_id=${jdId}&top_n=${topN}`)
  if (!res.ok) throw new Error(`Hidden gems error: ${res.status}`)
  return res.json()
}

export async function explainComparison(jdId, candidateAId, candidateBId) {
  const res = await fetch(`${BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jd_id: jdId,
      candidate_a_id: candidateAId,
      candidate_b_id: candidateBId,
    }),
  })
  if (!res.ok) throw new Error(`Explain error: ${res.status}`)
  return res.json()
}

export async function fetchStats() {
  const res = await fetch(`${BASE}/stats`)
  if (!res.ok) throw new Error('Stats error')
  return res.json()
}

export async function fetchJobs() {
  const res = await fetch(`${BASE}/jobs`)
  if (!res.ok) throw new Error('Jobs error')
  return res.json()
}
