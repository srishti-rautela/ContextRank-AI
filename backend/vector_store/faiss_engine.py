import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


class FAISSCandidateMemory:

    def __init__(self):
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        self.index = faiss.IndexFlatIP(384)
        self.candidates = []


    def build_index(self, candidates):

        self.candidates = candidates

        texts = []

        for c in candidates:
            text = f"""
            {c.get('skills','')}
            {c.get('projects','')}
            {c.get('experience','')}
            """

            texts.append(text)


        vectors = self.model.encode(texts)

        faiss.normalize_L2(vectors)

        self.index.add(
            np.array(vectors)
        )


    def search(self, job, k=100):

        vector = self.model.encode([job])

        faiss.normalize_L2(vector)

        scores, ids = self.index.search(
            np.array(vector),
            k
        )

        return [
            self.candidates[i]
            for i in ids[0]
        ]