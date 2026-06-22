import google.generativeai as genai
import os
import json
from dotenv import load_dotenv


load_dotenv()


genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)


model = genai.GenerativeModel(
    "gemini-pro"
)


def analyze_job(job):

    prompt = f"""

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

    response = model.generate_content(prompt)

    return json.loads(response.text)