from data_adapter.challenge_adapter import load_challenge_candidates

from ranking.context_rank_engine import rank_candidates

import pandas as pd
import os



print("Loading challenge dataset...")


candidates = get_candidates_cache()


print(
    "Candidates:",
    len(candidates)
)



# ------------------------------------
# Challenge Job Description Input
# ------------------------------------

job_description = """

Looking for AI Engineer with:

Python,
Machine Learning,
Large Language Models,
Recommendation Systems,
Data Engineering,
Backend Development,
Cloud Platforms,
Strong problem solving ability.

"""



print(
    "Ranking candidates..."
)



ranked_candidates = rank_candidates(

    job_description,

    candidates

)



# ------------------------------------
# Keep TOP 100 for challenge
# ------------------------------------

ranked_candidates = ranked_candidates[:100]



final_output=[]



for index,c in enumerate(
    ranked_candidates,
    start=1
):


    final_output.append(

        {

        "rank":

        index,


        "candidate_id":

        c["candidate_id"],


        "rank_score":

        c["rank_score"],


        "reasoning":

        c["reasoning"]

        }

    )



df = pd.DataFrame(final_output)


# Rename rank_score -> score
df = df.rename(
    columns={
        "rank_score": "score"
    }
)


# EXACT challenge format
df = df[
    [
        "candidate_id",
        "rank",
        "score",
        "reasoning"
    ]
]


df.to_csv(
    "data/processed/final_submission.csv",
    index=False
)


print("SUCCESS 🚀")


print(
    "Final shortlisted candidates:",
    len(df)
)


print(df.head())