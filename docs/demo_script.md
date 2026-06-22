# ContextRank — Demo Script (3-Minute Video)

Use this as your talking-point guide when recording the submission demo.

---

## 0:00 – 0:20 | The Problem (hook)

> "Recruiters today scan thousands of resumes using keyword filters. If your resume
> doesn't say 'Python' in bold, you're invisible — even if you built three AI products
> in Python. And if you didn't go to an IIT, most ATS systems silently rank you lower.
> We built ContextRank to fix both problems."

**Show:** title slide → quick cut to a resume being keyword-rejected (use a slide, not a real resume).

---

## 0:20 – 0:50 | What ContextRank Does

> "ContextRank takes any job description and any pool of candidates, and produces
> a ranked shortlist — not based on keywords, but based on 8 independent capability
> signals: skill match, project relevance, experience quality, activity signal,
> learning velocity, potential, culture fit, and a bias-correction bonus."

**Show:** Architecture diagram (in README) → live dashboard with "Ranked Results" tab.

---

## 0:50 – 1:40 | Live Demo — Type a JD on the spot (your strongest moment)

> "Let me prove this isn't a pre-canned demo. I'm going to type a job
> description right now, in plain English, with zero technical keywords."

**Show:**
1. Open the "🧪 Try your own job description" panel
2. Type live on camera: *"We need someone who can make machines understand
   Hindi and English text together — figuring out what people mean, not
   just what they typed."*
3. Click "Rank candidates against this"
4. Let the live ranking animation play — point out each stage label as it lights up
5. Point at the System Status badge — "this confirms real semantic embeddings are running, not keyword search"

> "Notice I never said 'NLP' or 'sentiment analysis' anywhere in that
> description. The engine still found the right candidates — because
> it understands meaning, not just words."

---

## 1:40 – 2:05 | The Hidden Gem Moment (your second winning slide)

> "Here's the moment that matters most. This candidate — from a tier-3 college in
> Bhopal, with zero industry experience — outranks several Tier-1 college graduates.
> Why? Because she has 40 GitHub repositories, 600+ stars, and built a crop disease
> detection AI that's directly relevant to the job. Traditional ATS would have
> rejected her resume in 2 seconds. ContextRank found her."

**Show:** "Hidden Gems" tab → click into the top hidden gem candidate → zoom on
the radar chart and the "Hidden Gem" badge.

---

## 2:05 – 2:30 | Explainability

> "Judges and recruiters always ask 'why this candidate over that one?' ContextRank
> answers that directly."

**Show:** "Compare" tab → select two candidates → show the dimension-by-dimension
diff and the plain-English explanation.

---

## 2:30 – 3:00 | The National Vision (close strong)

> "This same CapabilityDNA engine — skill match, activity signal, potential —
> doesn't have to stop at recruitment. The same architecture can match doctors to
> rural postings during outbreaks, assemble disaster response teams, or identify
> India's hidden technical talent at a national scale. We built the recruitment
> engine first, because that's the brief — but the foundation is built to scale to
> a human intelligence layer for India."

**Show:** Stats page → "India Welfare Impact" card → end on logo/title slide.

---

## Recording tips

- Use OBS Studio or Loom for screen recording (both free).
- Keep both backend (`localhost:8000`) and frontend (`localhost:5173`) running before recording.
- **Before recording, confirm the System Status badge shows "Semantic AI active"** (green, pulsing).
  If it shows "Lexical fallback mode," restart the backend with a working internet
  connection so the embedding model can download — this only needs to happen once.
- Practice the custom JD typing moment 2-3 times beforehand so it's smooth on camera —
  this is your strongest "proof it's real" moment, don't let it look hesitant.
- Pre-load a known hidden gem candidate's name so you don't scroll randomly on camera.
- Record in 1080p, export as MP4, keep under 3 minutes — most contests cap video length.
