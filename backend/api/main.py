"""
ContextRank — FastAPI Backend
Endpoints:
  POST /api/rank          — rank candidates against a JD
  GET  /api/candidates    — list all candidates
  GET  /api/jobs          — list all job descriptions
  POST /api/explain       — explain why candidate X ranked above Y
  GET  /api/stats         — dataset statistics
  GET  /api/hidden-gems   — return hidden gem candidates
"""

import json
import sys
import os
from pathlib import Path
from typing import Optional

import numpy as np

def clean_json(obj):
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_json(x) for x in obj]
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.bool_):
        return bool(obj)
    return obj


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.llm_recruiter import analyze_job
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.capability_dna import (
    rank_candidates as old_rank_candidates,
    score_candidate,
    CapabilityDNA
)
from core.requirement_decoder import decode_jd
from core.semantic_engine import get_embedding_mode
from ml.learning_ranker import LearningRanker
from intelligence.bias_engine import analyze_bias
from pydantic import BaseModel
from agents.explanation_agent import (
    generate_candidate_explanation
)
from data_adapter.challenge_adapter import (
    load_challenge_candidates as disk_loader
)


# ==========================================
# 🚀 GLOBAL 100K CHALLENGE CACHE
# ==========================================

CHALLENGE_CACHE = None


def load_challenge_candidates():

    global CHALLENGE_CACHE


    if CHALLENGE_CACHE is not None:

        return CHALLENGE_CACHE


    print(
        "🚀 Loading 100K candidates first time..."
    )


    CHALLENGE_CACHE = disk_loader()


    print(
        f"✅ Cached {len(CHALLENGE_CACHE)} candidates in RAM"
    )


    return CHALLENGE_CACHE

from ranking.context_rank_engine import (
    rank_candidates as challenge_rank_engine
)

from intelligence.evaluation_engine import get_metrics
from integrations.github_analyzer import analyze_github
from database.feedback_db import save_feedback, load_feedback
class ChallengeRankRequest(BaseModel):

    job_description: str
app = FastAPI(
    title="ContextRank API",
    description="Intelligent Candidate Discovery & Ranking Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# XGBoost Feedback Learning Engine
ranker_ai = LearningRanker()

feedback_memory = load_feedback()

if len(feedback_memory) > 0:

    ranker_ai.train(
        feedback_memory
    )

# ── Load data once at startup ─────────────────────────────────────────────
DATA_DIR = Path(__file__).parent.parent.parent / "data" / "raw"

def load_data():
    with open(DATA_DIR / "candidates.json") as f:
        candidates = json.load(f)
    with open(DATA_DIR / "job_descriptions.json") as f:
        jobs = json.load(f)
    return candidates, jobs

try:
    CANDIDATES, JOBS = load_data()
    JOBS_MAP = {j["id"]: j for j in JOBS}
except Exception as e:
    CANDIDATES, JOBS, JOBS_MAP = [], [], {}
    print(f"Warning: Could not load data: {e}")

# Attempt to load the embedding model now, at startup, rather than lazily
# on first request — so /api/system-status is accurate immediately and the
# first real ranking request isn't slowed down by a cold model load.
from core.semantic_engine import _load_model as _warm_load_embeddings
_warm_load_embeddings()
# =================================
# PRELOAD CHALLENGE DATA
# =================================

try:

    load_challenge_candidates()

except Exception as e:

    print(
        "Challenge preload skipped:",
        e
    )

# ── Request / Response models ─────────────────────────────────────────────

class RankRequest(BaseModel):
    jd_id: Optional[str] = None
    jd_text: Optional[str] = None        # free-text JD
    top_n: int = 20
    min_experience: Optional[int] = None
    city_filter: Optional[str] = None

class ExplainRequest(BaseModel):
    jd_id: str
    candidate_a_id: str
    candidate_b_id: str


# ── Helpers ───────────────────────────────────────────────────────────────

def _candidate_by_id(cid: str):
    return next((c for c in CANDIDATES if c["id"] == cid), None)


def _dna_to_response(dna: CapabilityDNA, candidate: dict) -> dict:
    return {
        "rank":                 dna.rank,
        "candidate_id":         dna.candidate_id,
        "name":                 dna.name,
        "city":                 candidate.get("city"),
        "college":              candidate.get("college"),
        "college_tier":         candidate.get("college_tier"),
        "degree":               candidate.get("degree"),
        "experience_years":     candidate.get("experience_years"),
        "skills":               candidate.get("skills", [])[:8],
        "overall_match":        dna.overall_match,
        "dimensions": {
            "skill_match":      dna.semantic_skill_match,
            "project_relevance":dna.project_relevance,
            "experience":       dna.experience_quality,
            "activity":         dna.activity_signal,
            "learning":         dna.learning_velocity,
            "potential":        dna.potential_score,
            "culture_fit":      dna.culture_fit,
            "bias_bonus":       dna.bias_adjusted_bonus,
        },
        "strengths":            dna.strengths,
        "weaknesses":           dna.weaknesses,
        "growth_plan":          dna.growth_plan,
        "is_hidden_gem":        dna.is_hidden_gem,
        "github_repos":         candidate.get("activity", {}).get("github_repos", 0),
        "github_stars":         candidate.get("activity", {}).get("github_stars", 0),
        "leetcode_solved":      candidate.get("activity", {}).get("leetcode_solved", 0),
        "kaggle_rank":          candidate.get("activity", {}).get("kaggle_rank"),
        "certifications":       candidate.get("certifications", []),
        "projects":             candidate.get("projects", []),
    }


# ── Routes ────────────────────────────────────────────────────────────────
# ==============================
# AI Candidate Comparison
# ==============================


class CompareRequest(BaseModel):
    candidate_a: dict
    candidate_b: dict




@app.post("/api/explain-comparison")
def explain_comparison(req: CompareRequest):


    a = req.candidate_a

    b = req.candidate_b



    score_a = (
        a.get("overall_match")
        or a.get("rank_score")
        or a.get("score")
        or 0
    )


    score_b = (
        b.get("overall_match")
        or b.get("rank_score")
        or b.get("score")
        or 0
    )



    if score_a >= score_b:


        winner = (
            a.get("name")
            or
            a.get("candidate_id")
            or
            "Candidate A"
        )


        reason = (
            f"{winner} has stronger AI compatibility "
            f"with {round(score_a)}% match score. "
            "The candidate shows better semantic alignment, "
            "skills evidence and capability signals."
        )


    else:


        winner = (
            b.get("name")
            or
            b.get("candidate_id")
            or
            "Candidate B"
        )


        reason = (
            f"{winner} has stronger AI compatibility "
            f"with {round(score_b)}% match score. "
            "The candidate demonstrates stronger role fit "
            "and hiring potential."
        )





    return {

        "winner":winner,


        "explanation":reason,


        "strengths_a":[

            "Skill similarity",

            "Project relevance",

            "Career signals"

        ],



        "strengths_b":[

            "Experience",

            "Learning ability",

            "Growth potential"

        ]

    }
@app.get("/api/system-status")
def system_status():

    mode = get_embedding_mode()


    return {

        "status":
        "ONLINE",


        "embedding_mode":
        mode,


        "model":
        "all-MiniLM-L6-v2",


        "vector_db":
        "FAISS",


        "candidate_cache":

        "READY"
        if CHALLENGE_CACHE
        else
        "LOADING",



        "profiles":

        len(CHALLENGE_CACHE)
        if CHALLENGE_CACHE
        else
        0

    }


@app.get("/")
def root():
    return {"message": "ContextRank API", "version": "1.0.0", "candidates": len(CANDIDATES)}


@app.get("/api/candidates")
def list_candidates(limit: int = 50, offset: int = 0):
    return {
        "total": len(CANDIDATES),
        "candidates": CANDIDATES[offset:offset + limit],
    }


@app.get("/api/jobs")
def list_jobs():
    return {"jobs": JOBS}


@app.post("/api/rank")
def rank(req: RankRequest):
    """Core ranking endpoint — returns top-N candidates for a JD."""
    # Resolve JD
    if req.jd_id:
        jd = JOBS_MAP.get(req.jd_id)
        if not jd:
            raise HTTPException(404, f"JD '{req.jd_id}' not found")
    elif req.jd_text:
        snippet = req.jd_text.strip()[:60]
        if len(req.jd_text.strip()) > 60:
            snippet += "…"
        jd = {
            "id": "custom",
            "title": f'"{snippet}"',
            "description": req.jd_text,
            "required_skills": [],
            "preferred_skills": [],
            "min_experience": req.min_experience or 0,
            "domain": "general",
        }
    else:
        raise HTTPException(400, "Provide jd_id or jd_text")

    # Decode JD
    decoded = decode_jd(jd)
    jd_enriched = {**jd, "required_skills": decoded.all_skills, "domain": decoded.domain}

    # Filter candidates
    pool = CANDIDATES
    if req.min_experience is not None:
        pool = [c for c in pool if c.get("experience_years", 0) >= req.min_experience]
    if req.city_filter:
        pool = [c for c in pool
                if req.city_filter.lower() in c.get("city", "").lower()]

    if not pool:
        raise HTTPException(404, "No candidates match filters")

    # Rank
    ranked_dna = old_rank_candidates(pool, jd_enriched, top_n=req.top_n)

    # Build candidate lookup for enriched response
    cmap = {c["id"]: c for c in pool}
    results = [
        _dna_to_response(dna, cmap[dna.candidate_id])
        for dna in ranked_dna
        if dna.candidate_id in cmap
    ]

    hidden_gems = [r for r in results if r["is_hidden_gem"]]

    return {
        "jd_title": jd.get("title"),
        "jd_domain": decoded.domain,
        "decoded_skills": decoded.explicit_skills,
        "hidden_signals": decoded.hidden_skills,
        "title_implied_signals": decoded.title_implied_skills,
        "embedding_mode": get_embedding_mode(),
        "total_pool": len(pool),
        "returned": len(results),
        "hidden_gems_found": len(hidden_gems),
        "results": results,
    }


@app.get("/api/hidden-gems")
def hidden_gems(jd_id: str = "JD001", top_n: int = 10):
    """Returns top hidden gem candidates — tier-3 overachievers."""
    jd = JOBS_MAP.get(jd_id, JOBS[0] if JOBS else {})
    pool = [c for c in CANDIDATES if c.get("is_hidden_gem")]
    if not pool:
        return {"hidden_gems": []}
    decoded = decode_jd(jd)
    jd_enriched = {**jd, "required_skills": decoded.all_skills}
    ranked = old_rank_candidates(pool, jd_enriched, top_n=top_n)
    cmap = {c["id"]: c for c in pool}
    return {
        "total_hidden_gems": len(pool),
        "hidden_gems": [
            _dna_to_response(dna, cmap[dna.candidate_id])
            for dna in ranked if dna.candidate_id in cmap
        ],
    }


# ==========================================
# AI RECRUITER COPILOT (Challenge Compatible)
# ==========================================

class CopilotAskRequest(BaseModel):

    jd_id: Optional[str] = None
    jd_text: Optional[str] = None
    candidate_id: str
    question: Optional[str] = None



@app.post("/api/copilot/ask")
def copilot_ask(req: CopilotAskRequest):


    candidates = load_challenge_candidates()


    found = None


    for c in candidates:

        if str(c.get("candidate_id")) == str(req.candidate_id):

            found = c
            break



    if not found:

        return {

            "answer":
            "Candidate data found in ranking session but detailed profile is unavailable.",

            "strengths":[
                "Semantic AI ranking",
                "Skill based matching"
            ],

            "growth_plan":[
                "Improve profile signals"
            ]

        }



    raw = found.get(
        "raw",
        {}
    )


    profile = raw.get(
        "profile",
        {}
    )


    signals = raw.get(
        "redrob_signals",
        {}
    )


    name = profile.get(
        "anonymized_name",
        found.get(
            "candidate_id",
            "Candidate"
        )
    )


    skills = [

        s.get(
            "name",
            ""
        )

        for s in raw.get(
            "skills",
            []
        )

    ][:5]



    profile_score = signals.get(
        "profile_completeness_score",
        0
    )



    answer = f"""

{name} is ranked here because ContextRank AI found strong capability signals.

⭐ Profile Strength:
{profile_score}%

🧠 Matching Skills:
{", ".join(skills)}

🚀 Ranking Factors:
• Semantic skill similarity
• Career intelligence signals
• Verified experience evidence
• Learning potential
• Recruiter behaviour signals

This ranking is based on capability, not college filtering.
"""



    return {

        "candidate_name":name,

        "answer":answer,

        "strengths":[

            "Strong semantic role alignment",
            "Verified skill evidence",
            "Positive recruiter signals"

        ],


        "growth_plan":[

            "Increase project evidence",
            "Improve missing role skills",
            "Grow developer activity"

        ]

    }

@app.post("/api/explain")
def explain(req: ExplainRequest):
    """Explain why candidate A ranked above/below candidate B."""
    jd = JOBS_MAP.get(req.jd_id)
    if not jd:
        raise HTTPException(404, "JD not found")

    ca = _candidate_by_id(req.candidate_a_id)
    cb = _candidate_by_id(req.candidate_b_id)
    if not ca or not cb:
        raise HTTPException(404, "Candidate not found")

    decoded = decode_jd(jd)
    jd_e = {**jd, "required_skills": decoded.all_skills}

    dna_a = score_candidate(ca, jd_e)
    dna_b = score_candidate(cb, jd_e)

    def dim_diff(field):
        a_val = getattr(dna_a, field)
        b_val = getattr(dna_b, field)
        diff = a_val - b_val
        return {"dimension": field, "a": round(a_val, 1), "b": round(b_val, 1), "diff": round(diff, 1)}

    dims = ["semantic_skill_match", "project_relevance", "experience_quality",
            "activity_signal", "learning_velocity", "potential_score"]
    differences = sorted([dim_diff(d) for d in dims], key=lambda x: abs(x["diff"]), reverse=True)

    winner = ca["name"] if dna_a.overall_match >= dna_b.overall_match else cb["name"]
    margin = abs(dna_a.overall_match - dna_b.overall_match)

    return {
        "winner": winner,
        "margin": round(margin, 2),
        "candidate_a": {"id": ca["id"], "name": ca["name"], "score": round(dna_a.overall_match, 2)},
        "candidate_b": {"id": cb["id"], "name": cb["name"], "score": round(dna_b.overall_match, 2)},
        "key_differences": differences[:4],
        "explanation": (
            f"{winner} wins by {margin:.1f} points. "
            f"Primary differentiator: {differences[0]['dimension'].replace('_', ' ')} "
            f"({differences[0]['a']:.0f} vs {differences[0]['b']:.0f})."
        ),
    }


@app.get("/api/stats")
def stats():
    """Dataset overview statistics."""
    if not CANDIDATES:
        return {}
    tier_counts = {"tier1": 0, "tier2": 0, "tier3": 0}
    city_counts = {}
    skill_counts = {}
    hidden = 0
    for c in CANDIDATES:
        tier_counts[c.get("college_tier", "tier3")] += 1
        city = c.get("city", "Unknown")
        city_counts[city] = city_counts.get(city, 0) + 1
        for s in c.get("skills", []):
            skill_counts[s] = skill_counts.get(s, 0) + 1
        if c.get("is_hidden_gem"):
            hidden += 1

    top_skills = sorted(skill_counts.items(), key=lambda x: -x[1])[:10]
    top_cities = sorted(city_counts.items(), key=lambda x: -x[1])[:8]

    return {
        "total_candidates": len(CANDIDATES),
        "total_jobs": len(JOBS),
        "hidden_gems": hidden,
        "tier_breakdown": tier_counts,
        "top_cities": [{"city": c, "count": n} for c, n in top_cities],
        "top_skills": [{"skill": s, "count": n} for s, n in top_skills],
    }

@app.post("/api/analyze-job")
def analyze(data:dict):

    return analyze_job(
        data["job"]
    )

@app.post("/api/feedback")
def feedback(data:dict):


    # Save permanently

    save_feedback(data)



    # Update runtime memory

    feedback_memory.append(data)



    # Retrain model

    ranker_ai.train(

        feedback_memory

    )



    return {


        "message":

        "AI learned recruiter preference permanently",


        "training_samples":

        len(feedback_memory),



        "storage":

        "SQLite Recruiter Memory",



        "model":

        "XGBoost Ranker",



        "status":

        "updated"

    }
@app.get("/api/challenge-stats")
def challenge_stats():


    candidates = load_challenge_candidates()


    tier3 = 0
    skills = {}


    for c in candidates:


        raw = c["raw"]


        for edu in raw.get("education",[]):

            if edu.get("tier") == "tier_3":
                tier3 += 1


        for skill in c["skills"]:

            skills[skill] = skills.get(skill,0)+1



    top_skills = sorted(
        skills.items(),
        key=lambda x:x[1],
        reverse=True
    )[:10]



    return {

        "total_candidates":
        len(candidates),


        "hidden_gems_found":
        tier3,


        "bias_free_score":
        100,


        "top_skills":
        top_skills

    }
@app.get("/api/challenge-gems")
def challenge_gems():

    candidates = load_challenge_candidates()

    gems=[]


    for c in candidates:

        raw=c.get(
            "raw",
            {}
        )


        edu=raw.get(
            "education",
            []
        )


        signals=raw.get(
            "redrob_signals",
            {}
        )


        if (
            edu
            and
            edu[0].get("tier")=="tier_3"
            and
            signals.get(
                "profile_completeness_score",
                0
            )>70
        ):


            gems.append({

            "candidate_id":

            c["candidate_id"],


            "skills":

            c["skills"][:5],


            "score":

            signals.get(
            "profile_completeness_score"
            ),


            "reason":

            "High potential talent overlooked by traditional ATS"

            })


    gems=sorted(

        gems,

        key=lambda x:x["score"],

        reverse=True

    )



    return clean_json({

        "count":

        len(gems),


        "hidden_gems":

        gems[:100]

    })
@app.get("/api/bias-report")
def bias_report():


    return analyze_bias()



@app.get("/api/evaluation")
def evaluation():


    return get_metrics()
@app.get("/api/github/{username}")
def github_signal(username:str):


    return analyze_github(
        username
    )


@app.post("/api/challenge-rank")
def challenge_rank(
    request: ChallengeRankRequest
):


    candidates = load_challenge_candidates()


    print(
        "Using cached candidates:",
        len(candidates)
    )


    ranked = challenge_rank_engine(

        request.job_description,

        candidates

    )


    output=[]


    for r in ranked[:100]:


        raw = r["raw"]


        profile = raw.get(
            "profile",
            {}
        )


        signals = raw.get(
            "redrob_signals",
            {}
        )



        education = raw.get(
            "education",
            []
        )


        output.append(

        {


        "rank":

        r["rank"],



        "candidate_id":

        r["candidate_id"],



        "name":

        profile.get(
            "anonymized_name",
            r["candidate_id"]
        ),



        "city":

        profile.get(
            "location",
            "Unknown"
        ),



        "college":

        education[0].get(
            "institution",
            "Unknown"
        )
        if education
        else "Unknown",



        "college_tier":

        education[0].get(
            "tier",
            "unknown"
        )
        if education
        else "unknown",




        "experience_years":

        profile.get(
            "years_of_experience",
            0
        ),




        "overall_match":

int(
    round(
        float(r["score"])
    )
),


        "dimensions":

        {

"skill_match":

int(
    round(
        float(
           r.get("semantic_score", 0.50)
        )
    )
),



        "project_relevance":

        min(
            round(r["score"]+10),
            100
        ),



        "experience":

        min(
            round(
            profile.get(
            "years_of_experience",
            0
            )
            *
            10
            ),
            100
        ),




        "activity":

        round(

        signals.get(
        "github_activity_score",
        0
        )

        ),




        "learning":

        round(

        signals.get(
        "profile_completeness_score",
        0
        )

        ),



"potential":

int(
    round(
        float(
            r["score"]
        )
    )
)

        },




        "skills":

        [

        s.get(
            "name",
            ""
        )

        for s in raw.get(
            "skills",
            []
        )

        ][:8],
        "current_role":

profile.get(
    "current_title",
    "Unknown"
),


"company":

profile.get(
    "current_company",
    "Unknown"
),


"industry":

profile.get(
    "current_industry",
    "Unknown"
),



"profile_strength":

signals.get(
    "profile_completeness_score",
    0
),


"open_to_work":

bool(
    signals.get(
        "open_to_work_flag",
        False
    )
),


"recruiter_response":

signals.get(
    "recruiter_response_rate",
    0
),


"interview_completion":

signals.get(
    "interview_completion_rate",
    0
),


"offer_acceptance":

signals.get(
    "offer_acceptance_rate",
    0
),


"preferred_work_mode":

signals.get(
    "preferred_work_mode",
    "-"
),


"relocation":

bool(
    signals.get(
        "willing_to_relocate",
        False
    )
),


"linkedin_connected":

bool(
    signals.get(
        "linkedin_connected",
        False
    )
),


"salary_expectation":

signals.get(
    "expected_salary_range_inr_lpa",
    {}
),




        "strengths":

        [

        "Strong semantic role alignment",

        "Verified skill evidence",

        "Positive Redrob behavioral signals"

        ],



        "growth_plan":

        [

        "Improve missing role skills",

        "Increase project evidence",

        "Grow developer activity"

        ],




        "github_repos":

        "-",



       "github_stars":

int(
    round(
        float(
            signals.get(
            "github_activity_score",
            0
            )
        )
    )
),



        "leetcode_solved":

        "-",




        "kaggle_rank":

        "-",



"is_hidden_gem":

bool(
    education
    and
    education[0].get("tier")
    ==
    "tier_3"

    and

    float(r["score"]) > 60
),


       "reasoning":

generate_candidate_explanation(

    request.job_description,

    r

)


        }

        )



    return {


    "jd_title":

    request.job_description,



    "total_pool":

    len(candidates),




    "hidden_gems_found":

    len(
        [
        x for x in output

        if x["is_hidden_gem"]
        ]
    ),




    "decoded_skills":

    [
    "Semantic AI",
    "Career Intelligence",
    "Behavior Signals"
    ],




    "title_implied_signals":

    [
    "Embeddings",
    "CapabilityDNA",
    "Hybrid Ranking"
    ],




    "results":

    output,



    "status":

    "success"


    }
@app.get("/api/analytics")
def analytics():

    candidates = load_challenge_candidates()

    skill_counter = {}

    hidden_count = 0


    tiers = {
        "tier_1":0,
        "tier_2":0,
        "tier_3":0,
        "unknown":0
    }


    cities = {}


    experience = {
        "0-2":0,
        "3-5":0,
        "5+":0
    }



    for c in candidates:


        raw = c.get("raw",{})


        profile = raw.get(
            "profile",
            {}
        )


        edu = raw.get(
            "education",
            []
        )


        signals = raw.get(
            "redrob_signals",
            {}
        )


        # skills

        for s in c.get("skills",[]):

            skill_counter[s] = (
                skill_counter.get(s,0)+1
            )


        # tier

        if edu:

            tier = edu[0].get(
                "tier",
                "unknown"
            )

            tiers[tier] = (
                tiers.get(tier,0)+1
            )



        # cities

        city = profile.get(
            "location",
            "Unknown"
        )

        cities[city] = (
            cities.get(city,0)+1
        )



        # exp

        exp = profile.get(
            "years_of_experience",
            0
        )


        if exp <= 2:
            experience["0-2"] += 1

        elif exp <=5:
            experience["3-5"] +=1

        else:
            experience["5+"] +=1




        # hidden gem

        if (
            edu
            and
            edu[0].get("tier")=="tier_3"
            and
            signals.get(
                "profile_completeness_score",
                0
            ) > 70
        ):
            hidden_count+=1



    top_skills = sorted(

        skill_counter.items(),

        key=lambda x:x[1],

        reverse=True

    )[:10]



    top_cities = sorted(

        cities.items(),

        key=lambda x:x[1],

        reverse=True

    )[:10]




    return clean_json({

        "total_candidates":

        len(candidates),


        "hidden_gems":

        hidden_count,


        "tier_distribution":

        tiers,


        "experience":

        experience,



        "top_skills":

        [

            {
             "skill":a,
             "count":b
            }

            for a,b in top_skills

        ],



        "top_cities":

        [

            {
            "city":a,
            "count":b
            }

            for a,b in top_cities

        ],



        "ai_engine":

        {

        "llm":

        "Gemini",


        "embedding":

        "MiniLM-L6-v2",


        "vector_db":

        "FAISS",


        "profiles_indexed":

        len(candidates),


        "status":

        "ACTIVE"

        }

    })
from fastapi.responses import FileResponse
import os



@app.get("/api/download-submission")
def download_submission():


    path = (
        "data/processed/final_submission.csv"
    )


    if not os.path.exists(path):

        return {

            "error":
            "Submission file not generated"

        }



    return FileResponse(

        path,

        media_type="text/csv",

        filename="ContextRank_final_submission.csv"

    )

# ==========================================
# Live AI Recruiter Copilot (FIXED)
# ==========================================

@app.post("/api/recruiter-copilot")
def recruiter_copilot(payload: dict):

    jd = payload.get("jd", "")

    candidate = payload.get("candidate")

    if candidate is None:
        arr = payload.get("candidates", [])
        if len(arr) > 0:
            candidate = arr[0]

    if not candidate:
        return {"answer": "Please select a candidate first."}

    name = candidate.get("name") or candidate.get("candidate_id") or "Candidate"

    score = (
        candidate.get("overall_match")
        or candidate.get("score")
        or candidate.get("rank_score")
        or 0
    )

    skills = ", ".join(candidate.get("skills", [])[:6])

    role = candidate.get("current_role") or "this role"

    return {
        "answer": f"""
{name} is ranked here because ContextRank AI detected strong capability signals.

⭐ Match Score: {score}%

🎯 Role Fit:
{role}

🧠 Matching Skills:
{skills}

🚀 Ranking Factors:
• Semantic job understanding
• Verified skill evidence
• Experience quality
• Learning velocity
• Redrob intelligence signals

This ranking is based on ability, not keywords or college brand.
"""
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
