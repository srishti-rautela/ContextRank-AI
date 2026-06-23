import os

os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["USE_TF"] = "0"

from sentence_transformers import (
    SentenceTransformer,
    util
)


from vector_store.faiss_engine import (
    search_candidates
)


# ----------------------------
# Load embedding model
# ----------------------------

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


print(
    "[embeddings] Semantic engine ACTIVE"
)



CACHE_PATH = (
    "cache/candidate_embeddings.pkl"
)



# ----------------------------
# Embedding cache fallback
# ----------------------------

def get_candidate_embeddings(
    candidates
):


    if os.path.exists(
        CACHE_PATH
    ):

        print(
            "Loading cached embeddings..."
        )


        with open(
            CACHE_PATH,
            "rb"
        ) as f:

            return pickle.load(f)



    print(
        "Creating candidate embeddings..."
    )


    texts=[

        c["text"]

        for c in candidates

    ]



    embeddings = model.encode(

        texts,

        batch_size=256,

        show_progress_bar=True

    )



    os.makedirs(
        "cache",
        exist_ok=True
    )


    with open(
        CACHE_PATH,
        "wb"
    ) as f:

        pickle.dump(
            embeddings,
            f
        )



    return embeddings






# ----------------------------
# ContextRank Engine
# ----------------------------


def rank_candidates(
    job_description,
    candidates,
    top_n=100
):


    print(
        "Creating JD embedding..."
    )


    jd_embedding = model.encode(
        job_description
    )



    # ========================
    # FAISS retrieval
    # ========================


    faiss_results = search_candidates(
        jd_embedding,
        top_k=500
    )



    if faiss_results:


        print(
            "Using FAISS candidates:",
            len(faiss_results)
        )


        candidates = faiss_results



    else:


        print(
            "FAISS unavailable, using full scan"
        )


        embeddings = get_candidate_embeddings(
            candidates
        )


        semantic_scores = util.cos_sim(

            jd_embedding,

            embeddings

        )[0]


        for i,c in enumerate(candidates):

            c["semantic_score"] = float(
                semantic_scores[i]
            )






    results=[]




    # ========================
    # Hybrid ranking
    # ========================


    for c in candidates:



        semantic = c.get(
            "semantic_score",
            0.50
        )


        skill_score = min(

            c.get(
                "skill_strength",
                0
            )
            /
            10,

            100

        )



        experience_score = min(

            c.get(
                "experience",
                0
            )
            *
            10,

            100

        )



        behavior_score = (

            c.get(
                "behavior_score",
                0
            )

        )




        final_score = (


            semantic * 40

            +

            skill_score * 0.25

            +

            experience_score * 0.20

            +

            behavior_score * 0.15


        )



        results.append({

            **c,

            "score":

            round(
                float(final_score),
                4
            )

        })





    results = sorted(

        results,

        key=lambda x:x["score"],

        reverse=True

    )





    for i,r in enumerate(
        results,
        start=1
    ):

        r["rank"]=i





    print(

        "Ranking completed:",

        len(results)

    )



    return results[:top_n]