import os

os.environ["TRANSFORMERS_NO_TF"]="1"
os.environ["USE_TF"]="0"

from data_adapter.challenge_adapter import (
    load_challenge_candidates
)

from sentence_transformers import SentenceTransformer

from vector_store.faiss_engine import (
    build_faiss_index
)


print("Loading candidates...")

candidates = get_candidates_cache()


texts = [
    c["text"]
    for c in candidates
]


print(
    "Total:",
    len(texts)
)


print("Loading model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    device="cpu"
)


print("Creating embeddings...")


embeddings = model.encode(

    texts,

    batch_size=512,

    show_progress_bar=True,

    convert_to_numpy=True

)


print(
    "Embeddings:",
    embeddings.shape
)


build_faiss_index(
    embeddings,
    candidates
)


print(
    "DONE 🚀 FAISS READY"
)