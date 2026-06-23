"""
Contest Submission Validation Test
"""


import pandas as pd





def test_submission_format():


    df = pd.read_csv(

        "backend/data/processed/final_submission.csv"

    )



    required = [

        "candidate_id",

        "rank",

        "score"

    ]



    for col in required:


        assert col in df.columns




    assert (

        "reason"
        in df.columns

        or

        "reasoning"
        in df.columns

    )



    assert len(df) > 0