import json


def load_challenge_candidates():

    path = "data/raw/candidates.jsonl"

    candidates = []


    with open(
        path,
        "r",
        encoding="utf-8"
    ) as f:


        for line in f:

            raw = json.loads(line)


            profile = raw.get(
                "profile",
                {}
            )


            signals = raw.get(
                "redrob_signals",
                {}
            )


            skills = [
                s.get("name","")
                for s in raw.get(
                    "skills",
                    []
                )
            ]


            career_text = " ".join(

                [
                    x.get(
                        "description",
                        ""
                    )

                    for x in raw.get(
                        "career_history",
                        []
                    )
                ]

            )


            text = " ".join(
                [

                profile.get(
                    "headline",
                    ""
                ),

                profile.get(
                    "summary",
                    ""
                ),

                career_text,

                " ".join(skills)

                ]
            )


            skill_strength = sum(

                [

                s.get(
                    "endorsements",
                    0
                )

                for s in raw.get(
                    "skills",
                    []
                )

                ]

            )


            behavior_score = (

                signals.get(
                    "profile_completeness_score",
                    0
                )
                *
                0.5

                +

                signals.get(
                    "github_activity_score",
                    0
                )
                *
                0.5

            )


            candidates.append(


                {

                "candidate_id":

                raw["candidate_id"],



                "text":

                text,



                "skills":

                skills,



                "experience":

                profile.get(
                    "years_of_experience",
                    0
                ),



                "skill_strength":

                skill_strength,



                "behavior_score":

                behavior_score,



                "raw":

                raw

                }


            )


    return candidates