import requests


def analyze_github(username):


    url = f"https://api.github.com/users/{username}/repos"


    try:

        response = requests.get(
            url,
            timeout=5
        )


        repos = response.json()


        languages = {}

        stars = 0


        for repo in repos:


            language = repo.get(
                "language"
            )


            if language:


                languages[language] = (
                    languages.get(language,0)
                    +1
                )


            stars += repo.get(
                "stargazers_count",
                0
            )



        


        return {


            "github_user":

            username,


            "repositories":

            len(repos),



            "languages_detected":

            languages,



            "stars":

            stars,



            "developer_signal_score":

            open_source_score,


            "signal":

            "Real developer activity analyzed"


        }



    except Exception as e:


        return {

            "error":str(e)

        }