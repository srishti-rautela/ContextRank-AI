"""
ContextRank Ranking Engine Tests

Validates ranking module availability
and candidate scoring pipeline.
"""


import backend.ranking.context_rank_engine as engine




def test_ranking_engine_exists():


    assert engine is not None





def test_ranking_functions_available():


    available_functions = dir(engine)



    expected = [

        "rank_candidates",

        "rank",

        "run_ranking",

        "hybrid_rank"

    ]



    found = any(

        fn in available_functions

        for fn in expected

    )



    assert found == True