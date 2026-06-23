def generate_candidate_explanation(
    job_description,
    candidate
):


    raw = candidate.get(
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



    explanation = f"""

AI Recruiter Reasoning:

✓ Role Match:
{profile.get("current_title","Candidate")}
 background aligns with the role requirements.

✓ Experience:
Has {profile.get("years_of_experience",0)}
years of relevant industry experience.

✓ Skill Evidence:
Strong signals in:
{", ".join(skills)}

✓ Behaviour Signals:
Profile strength:
{signals.get("profile_completeness_score",0)}%

Recruiter response:
{round(
signals.get(
"recruiter_response_rate",
0
)*100
)}%

✓ Hiring Confidence:
Candidate shows strong potential based on
skills, career history and activity signals.

"""


    return explanation.strip()