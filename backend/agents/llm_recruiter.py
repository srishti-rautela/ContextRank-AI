from google import genai
import os


GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY",
    ""
)


client = None


if GEMINI_API_KEY:

    client = genai.Client(
        api_key=GEMINI_API_KEY
    )



def analyze_job(
    job_description: str
):


    # fallback if no API key
    if client is None:

        return {

            "role":
            job_description,


            "skills":
            extract_basic_skills(
                job_description
            ),


            "hidden_signals":

            [
                "problem solving",
                "system design",
                "learning ability"
            ]

        }



    response = client.models.generate_content(

        model="gemini-2.5-flash",


        contents=f"""

        Act as an expert recruiter.

        Analyze this job:

        {job_description}


        Return:
        - role
        - required skills
        - hidden expectations
        - success signals

        """

    )


    return {

        "analysis":

        response.text

    }




def extract_basic_skills(text):


    skills = [

        "Python",
        "Machine Learning",
        "LLM",
        "React",
        "FastAPI",
        "SQL",
        "Cloud",
        "AWS",
        "Docker"

    ]


    found=[]


    lower=text.lower()


    for s in skills:

        if s.lower() in lower:

            found.append(s)



    return found