import requests


def analyze_github(username):

    url = f"https://api.github.com/users/{username}/repos"

    try:

        response = requests.get(
            url,
            timeout=5
        )


        if response.status_code != 200:

            return {
                "github_user": username,
                "error": "GitHub profile not found"
            }


        repos = response.json()


        languages = {}

        stars = 0

        forks = 0


        for repo in repos:


            language = repo.get(
                "language"
            )


            if language:

                languages[language] = (
                    languages.get(language, 0)
                    + 1
                )


            stars += repo.get(
                "stargazers_count",
                0
            )


            forks += repo.get(
                "forks_count",
                0
            )


        # ------------------------------
        # ContextRank Developer Scoring
        # ------------------------------


        # rewards number of projects
        project_score = min(
            len(repos) * 8,
            50
        )


        # rewards multiple technologies
        language_score = min(
            len(languages) * 10,
            30
        )


        # rewards community impact
        popularity_score = min(
            (stars * 2) + forks,
            20
        )



        developer_signal_score = min(

            100,

            project_score
            +
            language_score
            +
            popularity_score

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


            "forks":

            forks,


            "score_breakdown": {


                "project_strength":

                project_score,


                "technology_diversity":

                language_score,


                "community_impact":

                popularity_score

            },



            "developer_signal_score":

            developer_signal_score,



            "signal":

            "Real developer activity analyzed using GitHub intelligence"

        }



    except Exception as e:


        return {

            "github_user": username,

            "error": str(e)

        }
