import os
import pickle
import faiss
import numpy as np


INDEX_PATH = (
    "cache/faiss_candidates.index"
)

META_PATH = (
    "cache/faiss_metadata.pkl"
)



def build_faiss_index(
    embeddings,
    candidates
):


    print(
        "Building FAISS index..."
    )


    embeddings = (
        embeddings
        .astype("float32")
    )


    faiss.normalize_L2(
        embeddings
    )


    dimension = embeddings.shape[1]


    index = faiss.IndexFlatIP(
        dimension
    )


    index.add(
        embeddings
    )


    os.makedirs(
        "cache",
        exist_ok=True
    )


    faiss.write_index(
        index,
        INDEX_PATH
    )


    with open(
        META_PATH,
        "wb"
    ) as f:

        pickle.dump(
            candidates,
            f
        )


    print(
        "FAISS saved:",
        index.ntotal
    )





def load_faiss_index():


    if not os.path.exists(
        INDEX_PATH
    ):

        return None,None


    index = faiss.read_index(
        INDEX_PATH
    )


    with open(
        META_PATH,
        "rb"
    ) as f:

        metadata = pickle.load(
            f
        )


    print(
        "FAISS loaded:",
        index.ntotal
    )


    return (
        index,
        metadata
    )





def search_candidates(
    query_embedding,
    top_k=200
):


    index,metadata = (
        load_faiss_index()
    )


    if index is None:

        return None



    query_embedding = np.array(
        [
            query_embedding
        ],
        dtype="float32"
    )


    faiss.normalize_L2(
        query_embedding
    )


    scores,ids = index.search(
        query_embedding,
        top_k
    )


    results=[]


    for idx in ids[0]:


        results.append(
            metadata[idx]
        )


    return results