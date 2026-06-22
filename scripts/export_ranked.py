"""
Generate ranked output CSV — required by contest submission checklist.
Run: python3 scripts/export_ranked.py
"""

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
from core.capability_dna import rank_candidates
from core.requirement_decoder import decode_jd

DATA = Path(__file__).parent.parent / "data"

def export(jd, candidates, out_path):
    decoded = decode_jd(jd)
    jd_e = {**jd, "required_skills": decoded.all_skills, "domain": decoded.domain}
    ranked = rank_candidates(candidates, jd_e, top_n=50)
    cmap = {c["id"]: c for c in candidates}

    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "rank", "candidate_id", "name", "city", "college", "college_tier",
            "experience_years", "overall_match_score",
            "skill_match_%", "project_relevance_%", "activity_signal_%",
            "is_hidden_gem", "top_strength", "growth_plan",
            "github_repos", "github_stars", "leetcode_solved", "certifications",
        ])
        for dna in ranked:
            c = cmap.get(dna.candidate_id, {})
            act = c.get("activity", {})
            writer.writerow([
                dna.rank,
                dna.candidate_id,
                dna.name,
                c.get("city", ""),
                c.get("college", ""),
                c.get("college_tier", ""),
                c.get("experience_years", 0),
                round(dna.overall_match, 2),
                round(dna.semantic_skill_match, 1),
                round(dna.project_relevance, 1),
                round(dna.activity_signal, 1),
                "YES" if dna.is_hidden_gem else "NO",
                (dna.strengths or [""])[0],
                "; ".join(dna.growth_plan or [])[:120],
                act.get("github_repos", 0),
                act.get("github_stars", 0),
                act.get("leetcode_solved", 0),
                "; ".join(c.get("certifications", [])[:2]),
            ])
    print(f"Exported {len(ranked)} candidates → {out_path}")

def main():
    with open(DATA / "raw/candidates.json") as f:
        candidates = json.load(f)
    with open(DATA / "raw/job_descriptions.json") as f:
        jobs = json.load(f)

    out_dir = DATA / "processed"
    out_dir.mkdir(exist_ok=True)

    for jd in jobs:
        fname = out_dir / f"ranked_{jd['id']}.csv"
        export(jd, candidates, fname)

    print(f"\nAll ranked CSVs saved to {out_dir}")

if __name__ == "__main__":
    main()
