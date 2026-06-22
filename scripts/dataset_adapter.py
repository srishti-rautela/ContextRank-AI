"""
Dataset Adapter
===============
Maps an arbitrary real-world candidate dataset (CSV or JSON, whatever
schema the contest provides) onto the exact dict shape CapabilityDNA and
the API expect.

WHY THIS EXISTS: the synthetic dataset (scripts/generate_dataset.py) uses
field names invented for this PoC — "college_tier", "activity.github_repos",
etc. The contest's real dataset will almost certainly use different column
names. Without this adapter, swapping in real data means hunting through
capability_dna.py, requirement_decoder.py, and main.py to rename fields by
hand — slow and error-prone under deadline pressure.

HOW TO USE THIS WHEN THE REAL DATASET ARRIVES:
1. Open the contest's dataset file and note its actual column/field names.
2. Edit COLUMN_MAP below — left side is what our engine expects, right side
   is the literal column name in the contest's file. Only structural fields
   need mapping; everything else passes through.
3. Run:  python3 scripts/load_real_dataset.py path/to/their_dataset.csv
   (or .json) — it produces data/raw/candidates.json in the right shape.
4. Re-run scripts/export_ranked.py as normal. Nothing else changes.

This script FAILS LOUDLY if required fields are missing or unmappable —
it will never silently produce a partially-broken candidate, because a
quietly wrong ranking is worse than a script that stops and tells you
exactly what's missing.
"""

from __future__ import annotations
import json
import sys
import csv
from pathlib import Path


# ── EDIT THIS when the real dataset arrives ────────────────────────────────
# Left  = field name our engine requires (do not change these keys)
# Right = the column/field name in the CONTEST's actual dataset.
# If their column is named differently, just change the right-hand value.
COLUMN_MAP = {
    "id":               "id",                # unique candidate identifier
    "name":              "name",
    "city":               "location",         # e.g. their file might call it "location"
    "skills":             "skills",           # expects a list OR comma-separated string
    "experience_years":   "years_experience",
    "college":             "education",
    "projects_text":       "project_summary",  # free-text description of projects, if no structured list
    "github_repos":        "github_repo_count",
    "github_stars":        "github_stars",
    "leetcode_solved":     "leetcode_problems_solved",
    "certifications":      "certifications",
}

# Fields the engine needs at minimum to produce a meaningful score.
# Everything else degrades gracefully to a default if missing.
REQUIRED_FIELDS = ["id", "name", "skills"]


def _get(row: dict, our_key: str, default=None):
    """Look up a value using the COLUMN_MAP, tolerant of missing columns."""
    their_key = COLUMN_MAP.get(our_key, our_key)
    return row.get(their_key, default)


def _parse_skills(raw) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(s).strip() for s in raw if str(s).strip()]
    if isinstance(raw, str):
        # handle comma, semicolon, or pipe separated skill strings
        for sep in [",", ";", "|"]:
            if sep in raw:
                return [s.strip() for s in raw.split(sep) if s.strip()]
        return [raw.strip()] if raw.strip() else []
    return []


def adapt_row(row: dict, row_index: int) -> dict:
    """Converts one raw record from the contest's dataset into our
    engine's expected candidate shape. Missing optional fields get safe
    defaults; missing required fields raise immediately."""

    missing_required = [f for f in REQUIRED_FIELDS if not _get(row, f)]
    if missing_required:
        raise ValueError(
            f"Row {row_index}: missing required field(s) {missing_required}. "
            f"Check COLUMN_MAP in scripts/dataset_adapter.py — the contest's "
            f"column names probably don't match what's mapped there yet."
        )

    candidate_id = str(_get(row, "id"))
    skills = _parse_skills(_get(row, "skills"))
    projects_text = _get(row, "projects_text", "")

    # If the contest dataset gives free-text project descriptions rather
    # than structured project objects, wrap it as one synthetic project so
    # the semantic engine still has something to embed and score against.
    projects = []
    if projects_text:
        projects = [{
            "title": "Candidate-described project experience",
            "tech_stack": skills[:5],
            "domain": "general",
            "impact_level": "medium",
            "_raw_description": projects_text,
        }]

    return {
        "id": candidate_id,
        "name": str(_get(row, "name", f"Candidate {row_index}")),
        "email": _get(row, "email", ""),
        "city": str(_get(row, "city", "Unknown")),
        "college": str(_get(row, "college", "Unknown")),
        "college_tier": _get(row, "college_tier", "tier3"),  # unknown defaults to tier3, never assumed tier1
        "degree": _get(row, "degree", ""),
        "graduation_year": int(_get(row, "graduation_year", 2023) or 2023),
        "cgpa": float(_get(row, "cgpa", 7.0) or 7.0),
        "experience_years": float(_get(row, "experience_years", 0) or 0),
        "skills": skills,
        "skill_focus": "general",
        "projects": projects,
        "work_experience": [],
        "certifications": _parse_skills(_get(row, "certifications")),
        "activity": {
            "github_repos": int(_get(row, "github_repos", 0) or 0),
            "github_stars": int(_get(row, "github_stars", 0) or 0),
            "leetcode_solved": int(_get(row, "leetcode_solved", 0) or 0),
            "kaggle_rank": _get(row, "kaggle_rank"),
            "open_source_prs": int(_get(row, "open_source_prs", 0) or 0),
            "blog_posts": int(_get(row, "blog_posts", 0) or 0),
            "hackathons_won": int(_get(row, "hackathons_won", 0) or 0),
            "last_active_days_ago": int(_get(row, "last_active_days_ago", 90) or 90),
        },
        "is_hidden_gem": False,  # recomputed below, never trust an external flag blindly
        "summary": f"{_get(row, 'name', '')} — {', '.join(skills[:3])}",
    }


def _detect_hidden_gems(candidates: list[dict]) -> None:
    """Mirrors the synthetic generator's hidden-gem heuristic: tier-3
    college + at least one meaningful signal of real ability. Mutates
    candidates in place."""
    for c in candidates:
        is_tier3 = c.get("college_tier") == "tier3"
        has_signal = (
            c["activity"]["github_repos"] >= 15 or
            c["activity"]["github_stars"] >= 100 or
            c["activity"]["leetcode_solved"] >= 150 or
            len(c.get("projects", [])) >= 2
        )
        c["is_hidden_gem"] = is_tier3 and has_signal


def load_csv(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return [adapt_row(row, i) for i, row in enumerate(reader)]


def load_json(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    rows = data if isinstance(data, list) else data.get("candidates", data.get("data", []))
    if not isinstance(rows, list):
        raise ValueError(
            "Could not find a list of candidate records in this JSON file. "
            "Expected either a top-level list, or an object with a "
            "'candidates' or 'data' key containing the list."
        )
    return [adapt_row(row, i) for i, row in enumerate(rows)]


def adapt_dataset(input_path: str, output_path: str = None) -> list[dict]:
    p = Path(input_path)
    if not p.exists():
        raise FileNotFoundError(f"Dataset file not found: {input_path}")

    if p.suffix.lower() == ".csv":
        candidates = load_csv(p)
    elif p.suffix.lower() == ".json":
        candidates = load_json(p)
    else:
        raise ValueError(f"Unsupported file type '{p.suffix}'. Use .csv or .json.")

    _detect_hidden_gems(candidates)

    out = Path(output_path) if output_path else (
        Path(__file__).parent.parent / "data" / "raw" / "candidates.json"
    )

    # Safety guard: if we're about to overwrite an existing file with
    # noticeably fewer candidates than it currently has, this is very
    # likely a mistake (e.g. testing with a tiny sample file against the
    # real output path) rather than an intentional replacement. Refuse
    # and require an explicit --force flag rather than silently destroying
    # a larger dataset.
    if out.exists() and "--force" not in sys.argv:
        try:
            with open(out) as f:
                existing = json.load(f)
            if isinstance(existing, list) and len(existing) > len(candidates) * 2:
                print(
                    f"REFUSING TO OVERWRITE: {out} currently has "
                    f"{len(existing)} candidates, but this run only "
                    f"produced {len(candidates)}. This looks like it would "
                    f"destroy a larger dataset by accident — if this is "
                    f"really what you want, re-run with --force, or pass "
                    f"an explicit different output path as the 2nd argument."
                )
                sys.exit(1)
        except (json.JSONDecodeError, KeyError):
            pass  # existing file is unreadable/empty — safe to overwrite

    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w") as f:
        json.dump(candidates, f, indent=2, default=str)

    print(f"Adapted {len(candidates)} candidates → {out}")
    hidden = sum(1 for c in candidates if c["is_hidden_gem"])
    print(f"Hidden gems detected: {hidden}")
    return candidates


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dataset_adapter.py <path_to_real_dataset.csv_or_.json> [output_path.json]")
        sys.exit(1)
    output_arg = sys.argv[2] if len(sys.argv) > 2 else None
    adapt_dataset(sys.argv[1], output_arg)
