# utils/similarity.py

from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def compute_similarity(embedding1, embedding2):
    """
    Compute cosine similarity between two embeddings.
    """
    embedding1 = np.array(embedding1).reshape(1, -1)
    embedding2 = np.array(embedding2).reshape(1, -1)
    return cosine_similarity(embedding1, embedding2)[0][0]
