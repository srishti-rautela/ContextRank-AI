import json


def load_candidates(path):

    candidates=[]


    with open(path,"r",encoding="utf-8") as file:

        for line in file:

            c=json.loads(line)


            text = f"""

            {c['profile']['headline']}

            {c['profile']['summary']}

            Skills:
            {c['skills']}

            Experience:
            {c['career_history']}

            Signals:
            {c['redrob_signals']}

            """


            candidates.append({

                "candidate_id":

                c["candidate_id"],


                "text":

                text,


                "raw":

                c

            })


    return candidates