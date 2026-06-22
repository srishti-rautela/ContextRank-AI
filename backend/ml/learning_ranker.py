from xgboost import XGBRanker
import numpy as np
import pickle
import os


MODEL_PATH = "ml/ranker_model.pkl"


class LearningRanker:


    def __init__(self):

        self.model = XGBRanker(
            objective="rank:pairwise",
            n_estimators=100,
            learning_rate=0.1
        )

        self.trained=False


    def train(self,feedback):


        X=[]
        y=[]


        for item in feedback:


            features=[

                item.get(
                    "skill_score",
                    0
                ),

                item.get(
                    "project_score",
                    0
                ),

                item.get(
                    "experience_score",
                    0
                )

            ]


            X.append(features)


            y.append(
                item.get(
                    "selected",
                    0
                )
            )


        self.model.fit(

            np.array(X),

            np.array(y),

            group=[len(X)]

        )


        self.trained=True


        pickle.dump(

            self.model,

            open(
                MODEL_PATH,
                "wb"
            )

        )


        return True



    def predict(self,features):


        if not self.trained:

            return None


        return self.model.predict(

            np.array(features)

        )