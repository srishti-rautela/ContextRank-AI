from data_adapter.challenge_adapter import load_challenge_candidates

import pandas as pd
import os



print("Loading candidates...")


candidates = get_candidates_cache()


print(
    "Loaded:",
    len(candidates)
)



results = []



for c in candidates:


    # Experience intelligence

    experience_score = min(
        c["experience"] * 10,
        100
    )



    # Skill intelligence

    skill_score = min(
        c["skill_strength"] / 10,
        100
    )



    # Redrob activity intelligence

    behavior_score = c["behavior_score"]



    # ContextRank hybrid score

    final_score = (

        skill_score * 0.45

        +

        experience_score * 0.25

        +

        behavior_score * 0.30

    )



    results.append(

        {

        "candidate_id":

        c["candidate_id"],



        "rank_score":

        round(final_score, 4),



        "reasoning":

        "Matched using skills, career history, developer activity and behavioral signals"

        }

    )




# Sort candidates

results.sort(

    key=lambda x:
    x["rank_score"],

    reverse=True

)



# Ranking

for index,item in enumerate(
    results,
    start=1
):

    item["rank"] = index




df = pd.DataFrame(results)



df = df[
    [
    "rank",
    "candidate_id",
    "rank_score",
    "reasoning"
    ]
]



os.makedirs(

    "data/processed",

    exist_ok=True

)



df.to_csv(

    "data/processed/submission.csv",

    index=False

)



print(
    "SUCCESS"
)


print(
    "Submission created:",
    len(df),
    "candidates"
)


print(
    df.head()
)