from google import genai
from dotenv import load_dotenv
import os
import json
import re


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def clean_json(text):

    text = re.sub(
        r"```json|```",
        "",
        text
    )

    return text.strip()



def analyze_job(job):

    prompt = f"""

You are an expert AI recruiter.

Analyze this job description:

{job}


Return ONLY valid JSON.

No markdown.

Format:

{{
"role":"",
"must_have_skills":[],
"hidden_expectations":[],
"experience_level":"",
"success_traits":[]
}}

"""


    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )


        cleaned = clean_json(
            response.text
        )


        return json.loads(
            cleaned
        )


    except Exception as e:

        return {

            "error":
            str(e),

            "fallback_result":{

                "role":"AI Engineer",

                "must_have_skills":[
                    "Python",
                    "Machine Learning",
                    "LLM"
                ],

                "hidden_expectations":[
                    "model deployment",
                    "problem solving",
                    "AI systems"
                ],

                "experience_level":
                "mid",

                "success_traits":[
                    "learning ability",
                    "ownership"
                ]
            }
        }