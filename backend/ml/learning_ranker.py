from xgboost import XGBRanker
import numpy as np


class LearningRanker:


    def __init__(self):

        self.model=XGBRanker(
            objective="rank:pairwise"
        )


    def train(self,X,y):

        self.model.fit(
            np.array(X),
            np.array(y),
            group=[len(X)]
        )


    def predict(self,X):

        return self.model.predict(
            np.array(X)
        )