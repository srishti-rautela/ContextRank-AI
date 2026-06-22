"""
CapabilityDNA Engine
====================
Computes a multi-dimensional talent fingerprint for every candidate.
Scores 8 independent dimensions, then fuses them into a ranked match score.
No college-name weighting — ability signals only.
"""

from __future__ import annotations
import json
import math
import re
from dataclasses import dataclass, asdict
from typing import Optional

from core.semantic_engine import semantic_similarity, batch_semantic_scores, get_embedding_mode


# ── Dimension weights (tunable) ───────────────────────────────────────────
WEIGHTS = {
    "semantic_skill_match":  0.28,   # how well skills match JD
    "project_relevance":     0.20,   # project domain + tech alignment
    "experience_quality":    0.15,   # role depth, not just years
    "activity_signal":       0.12,   # GitHub, Kaggle, open-source
    "learning_velocity":     0.10,   # certs, recent activity, growth arc
    "potential_score":       0.08,   # fresher potential (hidden gems)
    "culture_fit":           0.04,   # hackathons, impact-driven projects
    "bias_adjusted_bonus":   0.03,   # bonus for tier-3 overachievers
}


@dataclass
class CapabilityDNA:
    candidate_id: str
    name: str
    # Raw dimension scores (0–100)
    semantic_skill_match: float = 0.0
    project_relevance: float = 0.0
    experience_quality: float = 0.0
    activity_signal: float = 0.0
    learning_velocity: float = 0.0
    potential_score: float = 0.0
    culture_fit: float = 0.0
    bias_adjusted_bonus: float = 0.0
    # Fused score
    overall_match: float = 0.0
    # Explainability
    strengths: list = None
    weaknesses: list = None
    growth_plan: list = None
    is_hidden_gem: bool = False
    rank: int = 0

    def to_dict(self):
        d = asdict(self)
        return d


# ── Skill matching — real semantic embeddings, not keyword overlap ────────
# This is the core fix versus the old regex matcher: instead of checking if
# the literal word "python" appears in both lists, we embed each candidate's
# full skill/project text and the JD's full requirement text, then compare
# them in meaning-space. This is what lets "built REST APIs with FastAPI"
# match "experience designing backend services" even with zero shared words.

def _normalise(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]", " ", text.lower())


def _skill_overlap(candidate_skills: list[str], jd_skills: list[str],
                    precomputed_semantic: float | None = None) -> float:
    """Semantic similarity between a candidate's skill set and the JD's
    required+preferred skills, with a lexical fallback for exact-term
    cases (e.g. version numbers, acronyms) where embeddings can be too fuzzy.

    Pass `precomputed_semantic` when scoring many candidates against the
    same JD — see batch_score_candidates() — to avoid one slow model call
    per candidate. Falls back to computing it inline (slower) if not given,
    so this function still works standalone."""
    if not jd_skills:
        return 50.0

    candidate_text = ", ".join(candidate_skills) if candidate_skills else ""
    jd_text = ", ".join(jd_skills)

    if precomputed_semantic is not None:
        semantic_score = precomputed_semantic
    else:
        semantic_score = semantic_similarity(candidate_text, jd_text)

    # Exact/partial lexical overlap as a secondary signal — useful for
    # precise terms like "AWS" or "Python 3.11" that embeddings can blur.
    c = set(_normalise(s) for s in candidate_skills)
    j = set(_normalise(s) for s in jd_skills)
    exact = len(c & j)
    partial = sum(
        1 for cs in c for js in j
        if cs in js or js in cs or _shares_root(cs, js)
    ) * 0.4
    lexical_score = min(1.0, (exact + partial) / len(j)) if j else 0.0

    # Blend: semantic carries more weight since it's the contest's explicit
    # ask ("beyond surface-level keywords"), lexical catches precise terms.
    blended = semantic_score * 0.7 + lexical_score * 0.3
    return round(min(1.0, blended) * 100, 1)


def _shares_root(a: str, b: str) -> bool:
    if len(a) < 4 or len(b) < 4:
        return False
    return a[:5] == b[:5]


# ── Project relevance ─────────────────────────────────────────────────────

DOMAIN_KEYWORDS = {
    "ai_ml":       ["llm", "ml", "ai", "model", "nlp", "vision", "transformers"],
    "backend":     ["api", "server", "database", "django", "flask", "fastapi"],
    "healthcare":  ["health", "medical", "hospital", "clinical", "patient"],
    "agriculture": ["crop", "farm", "agri", "irrigation", "yield"],
    "fintech":     ["payment", "fraud", "finance", "bank", "stock"],
    "education":   ["student", "learn", "school", "dropout", "edtech"],
    "environment": ["carbon", "air", "water", "environment", "climate"],
    "government":  ["gov", "e-gov", "village", "resource", "citizen"],
    "smart_city":  ["traffic", "pothole", "road", "congestion", "urban"],
}

def _project_relevance(projects: list[dict], jd: dict,
                        precomputed_scores: list[float] | None = None) -> float:
    """Real semantic match between each project's full description (title
    + domain + tech stack as natural text) and the JD's title+description,
    instead of checking if a hardcoded domain keyword appears in the title.
    This catches relevance keyword lists miss entirely — e.g. a 'Hindi NLP
    Sentiment Analyser' project matching a 'multilingual support engineer'
    JD even though no domain keyword overlaps.

    Pass `precomputed_scores` (one semantic score per project, same order
    as `projects`) when ranking many candidates against the same JD — see
    batch_score_candidates() — to avoid a separate model call per candidate."""
    if not projects:
        return 20.0

    jd_skills_norm = [_normalise(s) for s in jd.get("required_skills", [])]

    if precomputed_scores is not None:
        semantic_scores = precomputed_scores
    else:
        jd_context = f"{jd.get('title', '')}. {jd.get('description', '')}"
        project_texts = [
            f"{p.get('title', '')} using {', '.join(p.get('tech_stack', []))} "
            f"in the {p.get('domain', '')} domain"
            for p in projects
        ]
        semantic_scores = batch_semantic_scores(project_texts, jd_context)

    scores = []
    for p, sem_score in zip(projects, semantic_scores):
        # Tech stack overlap as a secondary precise signal
        p_tech = [_normalise(t) for t in p.get("tech_stack", [])]
        tech_hits = sum(1 for pt in p_tech for js in jd_skills_norm
                        if pt in js or js in pt)
        tech_score = min(1.0, tech_hits / max(1, len(jd_skills_norm)))

        impact_mult = {"high": 1.2, "medium": 1.0, "low": 0.8}.get(
            p.get("impact_level", "medium"), 1.0)

        blended = (sem_score * 0.65 + tech_score * 0.35) * impact_mult
        scores.append(min(1.0, blended))

    return round(max(scores) * 100, 1)


# ── Experience quality ────────────────────────────────────────────────────

def _experience_quality(candidate: dict, jd: dict) -> float:
    exp = candidate.get("experience_years", 0)
    min_exp = jd.get("min_experience", 0)
    work = candidate.get("work_experience", [])

    # Years score (diminishing returns after 5yr)
    year_score = min(1.0, exp / max(1, min_exp + 2)) if min_exp > 0 else min(1.0, exp / 5)

    # Company quality heuristic
    quality_cos = {"ISRO", "DRDO", "IIT Research Lab", "IIIT Research",
                   "Razorpay", "CRED", "Zepto", "Freshworks", "Zoho", "BrowserStack"}
    company_bonus = 0.2 if any(w.get("company") in quality_cos for w in work) else 0.0

    # Impact mentions
    strong_impacts = ["2M users", "94%", "3x", "30%", "40%", "80%", "production"]
    impact_score = min(0.3, sum(
        0.1 for w in work
        for term in strong_impacts
        if term in w.get("impact", "")
    ))

    score = year_score * 0.6 + company_bonus + impact_score
    return round(min(1.0, score) * 100, 1)


# ── Activity signal ───────────────────────────────────────────────────────

def _activity_signal(activity: dict) -> float:
    repos   = min(1.0, activity.get("github_repos", 0) / 20)
    stars   = min(1.0, activity.get("github_stars", 0) / 200)
    lc      = min(1.0, activity.get("leetcode_solved", 0) / 200)
    prs     = min(1.0, activity.get("open_source_prs", 0) / 10)
    kaggle  = 0.3 if activity.get("kaggle_rank") else 0.0
    blogs   = min(0.2, activity.get("blog_posts", 0) * 0.02)
    recency = max(0.0, 1 - activity.get("last_active_days_ago", 180) / 180)

    raw = (repos * 0.25 + stars * 0.15 + lc * 0.20 +
           prs * 0.20 + kaggle + blogs + recency * 0.10)
    return round(min(1.0, raw) * 100, 1)


# ── Learning velocity ─────────────────────────────────────────────────────

def _learning_velocity(candidate: dict) -> float:
    certs = len(candidate.get("certifications", []))
    blogs = candidate.get("activity", {}).get("blog_posts", 0)
    recency = candidate.get("activity", {}).get("last_active_days_ago", 180)
    hackathons = candidate.get("activity", {}).get("hackathons_won", 0)
    grad_year = candidate.get("graduation_year", 2020)
    years_since = max(1, 2025 - grad_year)
    certs_per_year = certs / years_since

    score = (min(0.4, certs_per_year * 0.2) +
             min(0.2, blogs * 0.02) +
             max(0.0, 0.2 * (1 - recency / 180)) +
             min(0.2, hackathons * 0.07))
    return round(min(1.0, score) * 100, 1)


# ── Potential score (fresher-friendly) ────────────────────────────────────

def _potential_score(candidate: dict) -> float:
    exp = candidate.get("experience_years", 0)
    cgpa = candidate.get("cgpa", 6.0)
    activity = candidate.get("activity", {})
    projects = candidate.get("projects", [])

    # Only meaningful for low-exp candidates
    if exp > 3:
        return 60.0

    high_projects = sum(1 for p in projects if p.get("impact_level") == "high")
    cgpa_score = (cgpa - 5.0) / 4.8
    lc_score = min(1.0, activity.get("leetcode_solved", 0) / 150)
    project_score = min(1.0, high_projects / 2)
    stars_score = min(1.0, activity.get("github_stars", 0) / 100)

    score = cgpa_score * 0.25 + lc_score * 0.25 + project_score * 0.35 + stars_score * 0.15
    return round(min(1.0, score) * 100, 1)


# ── Culture fit ───────────────────────────────────────────────────────────

def _culture_fit(candidate: dict) -> float:
    activity = candidate.get("activity", {})
    projects = candidate.get("projects", [])
    impact_domains = {"healthcare", "agriculture", "education", "environment", "government"}
    social_projects = sum(1 for p in projects if p.get("domain") in impact_domains)
    hackathons = activity.get("hackathons_won", 0)

    score = min(1.0, social_projects * 0.3 + hackathons * 0.15)
    return round(score * 100, 1)


# ── Bias-adjusted bonus ───────────────────────────────────────────────────

def _bias_adjusted_bonus(candidate: dict, skill_score: float, project_score: float) -> float:
    """Give a bonus to tier-3 candidates who outperform on signals."""
    tier = candidate.get("college_tier", "tier2")
    if tier != "tier3":
        return 0.0
    # If their signal scores are strong despite tier-3 college
    signal_avg = (skill_score + project_score) / 2
    if signal_avg >= 60:
        return min(100.0, (signal_avg - 60) * 1.5)
    return 0.0


# ── Explainability builder ────────────────────────────────────────────────

def _build_explanation(dna: CapabilityDNA, candidate: dict, jd: dict):
    strengths, weaknesses, growth = [], [], []

    if dna.semantic_skill_match >= 70:
        strengths.append(f"Strong skill alignment ({dna.semantic_skill_match:.0f}%) with JD requirements")
    if dna.project_relevance >= 65:
        strengths.append("Relevant project experience in target domain")
    if dna.activity_signal >= 60:
        strengths.append(f"Active builder — {candidate['activity']['github_repos']} repos, "
                         f"{candidate['activity']['github_stars']} GitHub stars")
    if dna.is_hidden_gem:
        strengths.append("Hidden gem: tier-3 college with exceptional project impact")
    if candidate.get("activity", {}).get("kaggle_rank"):
        strengths.append(f"Kaggle {candidate['activity']['kaggle_rank']} ranking")
    if len(candidate.get("certifications", [])) >= 2:
        strengths.append(f"{len(candidate['certifications'])} relevant certifications")

    if dna.semantic_skill_match < 50:
        missing = set(s.lower() for s in jd.get("required_skills", [])) - \
                  set(s.lower() for s in candidate.get("skills", []))
        if missing:
            weaknesses.append(f"Missing key skills: {', '.join(list(missing)[:3])}")
    if dna.activity_signal < 30:
        weaknesses.append("Low public activity / portfolio visibility")
    if dna.experience_quality < 40 and candidate.get("experience_years", 0) < 1:
        weaknesses.append("No industry experience (fresher)")

    # Growth plan
    missing_skills = set(s.lower() for s in jd.get("preferred_skills", [])) - \
                     set(s.lower() for s in candidate.get("skills", []))
    for skill in list(missing_skills)[:2]:
        growth.append(f"Learn {skill.title()} — 2–4 weeks online course")
    if candidate.get("activity", {}).get("github_repos", 0) < 5:
        growth.append("Build 2–3 public GitHub projects in target domain")
    if not candidate.get("activity", {}).get("kaggle_rank"):
        growth.append("Attempt a Kaggle competition to demonstrate ML skills")

    dna.strengths = strengths[:4]
    dna.weaknesses = weaknesses[:3]
    dna.growth_plan = growth[:3]


# ── Main scorer ───────────────────────────────────────────────────────────

def score_candidate(candidate: dict, jd: dict,
                     precomputed_skill_score: float | None = None,
                     precomputed_project_scores: list[float] | None = None) -> CapabilityDNA:
    activity = candidate.get("activity", {})

    s_skill    = _skill_overlap(candidate.get("skills", []),
                                jd.get("required_skills", []) + jd.get("preferred_skills", []),
                                precomputed_semantic=precomputed_skill_score)
    s_project  = _project_relevance(candidate.get("projects", []), jd,
                                     precomputed_scores=precomputed_project_scores)
    s_exp      = _experience_quality(candidate, jd)
    s_activity = _activity_signal(activity)
    s_learning = _learning_velocity(candidate)
    s_potential= _potential_score(candidate)
    s_culture  = _culture_fit(candidate)
    s_bias     = _bias_adjusted_bonus(candidate, s_skill, s_project)

    overall = (
        s_skill    * WEIGHTS["semantic_skill_match"] +
        s_project  * WEIGHTS["project_relevance"] +
        s_exp      * WEIGHTS["experience_quality"] +
        s_activity * WEIGHTS["activity_signal"] +
        s_learning * WEIGHTS["learning_velocity"] +
        s_potential* WEIGHTS["potential_score"] +
        s_culture  * WEIGHTS["culture_fit"] +
        s_bias     * WEIGHTS["bias_adjusted_bonus"]
    )

    dna = CapabilityDNA(
        candidate_id        = candidate["id"],
        name                = candidate["name"],
        semantic_skill_match= s_skill,
        project_relevance   = s_project,
        experience_quality  = s_exp,
        activity_signal     = s_activity,
        learning_velocity   = s_learning,
        potential_score     = s_potential,
        culture_fit         = s_culture,
        bias_adjusted_bonus = s_bias,
        overall_match       = round(overall, 2),
        is_hidden_gem       = candidate.get("is_hidden_gem", False),
    )

    _build_explanation(dna, candidate, jd)
    return dna


def rank_candidates(candidates: list[dict], jd: dict, top_n: int = 20) -> list[CapabilityDNA]:
    """Ranks a candidate pool against a JD.

    Performance note: this batches ALL embedding calls upfront — one batch
    call for every candidate's skill-set text, and one batch call for every
    project across every candidate — instead of letting each candidate
    trigger its own separate model invocation. For a 500-candidate pool,
    that's the difference between ~2 model calls and ~1000. This is what
    makes ranking large pools fast even though it's running real semantic
    embeddings, not keyword matching."""
    jd_text = ", ".join(jd.get("required_skills", []) + jd.get("preferred_skills", []))
    jd_context = f"{jd.get('title', '')}. {jd.get('description', '')}"

    # Batch 1: one skill-match score per candidate, computed in a single
    # model call across the whole pool.
    candidate_skill_texts = [
        ", ".join(c.get("skills", [])) for c in candidates
    ]
    skill_scores = batch_semantic_scores(candidate_skill_texts, jd_text)

    # Batch 2: flatten every project from every candidate into one list,
    # score them all in a single model call, then slice the results back
    # out per-candidate using each candidate's project count.
    all_project_texts = []
    project_counts = []
    for c in candidates:
        projects = c.get("projects", [])
        project_counts.append(len(projects))
        for p in projects:
            all_project_texts.append(
                f"{p.get('title', '')} using {', '.join(p.get('tech_stack', []))} "
                f"in the {p.get('domain', '')} domain"
            )
    all_project_scores = (
        batch_semantic_scores(all_project_texts, jd_context)
        if all_project_texts else []
    )

    # Slice the flat project-scores list back into per-candidate chunks.
    project_scores_by_candidate = []
    cursor = 0
    for count in project_counts:
        project_scores_by_candidate.append(all_project_scores[cursor:cursor + count])
        cursor += count

    scored = [
        score_candidate(
            c, jd,
            precomputed_skill_score=skill_scores[i],
            precomputed_project_scores=project_scores_by_candidate[i],
        )
        for i, c in enumerate(candidates)
    ]
    scored.sort(key=lambda x: x.overall_match, reverse=True)
    for i, s in enumerate(scored):
        s.rank = i + 1
    return scored[:top_n]
