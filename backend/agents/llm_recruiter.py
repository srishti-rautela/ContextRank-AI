from google import genai
import os
import json
from dotenv import load_dotenv


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_job(job):

    prompt=f"""

You are an expert AI recruiter.

Analyze:

{job}


Return JSON:

{{
"role":"",
"must_have_skills":[],
"hidden_expectations":[],
"experience_level":"",
"success_traits":[]
}}

"""


    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )


    return json.loads(
        response.text
    )