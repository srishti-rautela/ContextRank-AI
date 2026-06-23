import pandas as pd


df = pd.read_csv(
    "data/processed/final_submission.csv"
)


# rename column
df = df.rename(
    columns={
        "rank_score": "score"
    }
)


# reorder exactly as challenge wants
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


print("Fixed successfully ✅")

print(df.head())

print(df.shape)