"""
ContextRank — Synthetic Indian Talent Dataset Generator
Generates 1000 realistic candidate profiles + 20 job descriptions
covering IT, healthcare, engineering, design, and research roles.

This dataset is intentionally self-built (no contest dataset was provided
at build time) — see README "About This Dataset" for the design rationale
and how to swap in a different dataset via scripts/dataset_adapter.py.
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from faker import Faker

fake = Faker("en_IN")
random.seed(42)

CANDIDATE_COUNT = 1000  # was 500 — larger pool makes ranking demos more convincing

# ── Indian colleges by tier ────────────────────────────────────────────────
TIER1 = ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IISc Bangalore",
         "BITS Pilani", "IIT Kharagpur", "NIT Trichy"]
TIER2 = ["VIT Vellore", "SRM Chennai", "Manipal Institute", "PSG Tech Coimbatore",
         "NIT Warangal", "IIIT Hyderabad", "DTU Delhi", "NSIT Delhi"]
TIER3 = ["Amity University", "Chandigarh University", "LPU Jalandhar",
         "Sharda University", "Bennett University", "GLA University Mathura",
         "AKTU Lucknow", "CSVTU Bhilai", "RGPV Bhopal"]

SKILLS_POOL = {
    "ai_ml": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Keras",
              "NLP", "Computer Vision", "LLMs", "LangChain", "HuggingFace",
              "FAISS", "Vector DB", "RAG", "Fine-tuning", "XGBoost", "LightGBM"],
    "backend": ["FastAPI", "Django", "Flask", "Node.js", "Spring Boot",
                "PostgreSQL", "MongoDB", "Redis", "Kafka", "RabbitMQ",
                "REST APIs", "GraphQL", "Microservices", "Docker", "Kubernetes"],
    "frontend": ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS",
                 "HTML/CSS", "JavaScript", "Redux", "React Native", "Flutter"],
    "cloud": ["AWS", "GCP", "Azure", "Terraform", "CI/CD", "GitHub Actions",
              "Ansible", "Prometheus", "Grafana", "ELK Stack"],
    "data": ["SQL", "Pandas", "NumPy", "Spark", "Hadoop", "dbt",
             "Tableau", "Power BI", "Airflow", "BigQuery", "Snowflake"],
    "healthcare": ["Clinical Research", "HMIS", "HL7 FHIR", "Medical Imaging",
                   "Epidemiology", "Telemedicine", "Drug Discovery", "Bioinformatics"],
    "design": ["Figma", "UI Design", "UX Research", "Design Systems",
               "Prototyping", "User Testing", "Adobe XD", "Wireframing"],
    "security": ["Penetration Testing", "SIEM", "Threat Modeling", "OWASP",
                 "Network Security", "Cryptography", "SOC Operations"],
}

PROJECTS = [
    ("Crop Disease Detection AI", ["Python", "Computer Vision", "PyTorch"], "agriculture", "high"),
    ("Rural Telemedicine Platform", ["Django", "React", "PostgreSQL"], "healthcare", "high"),
    ("Traffic Congestion Predictor", ["ML", "Python", "Pandas"], "smart_city", "medium"),
    ("Hindi NLP Sentiment Analyser", ["NLP", "Python", "HuggingFace"], "ai_ml", "high"),
    ("Fraud Detection System", ["XGBoost", "Python", "FastAPI"], "fintech", "high"),
    ("Student Dropout Predictor", ["Scikit-learn", "Python", "Flask"], "education", "medium"),
    ("Air Quality Monitor Dashboard", ["React", "Node.js", "MongoDB"], "environment", "medium"),
    ("Legal Document Summarizer", ["LLMs", "LangChain", "Python"], "ai_ml", "high"),
    ("E-Governance Portal", ["React", "Django", "PostgreSQL"], "government", "high"),
    ("Sign Language Translator", ["Computer Vision", "TensorFlow", "React"], "accessibility", "high"),
    ("Supply Chain Optimizer", ["Python", "OR-Tools", "FastAPI"], "logistics", "medium"),
    ("Medical Report Parser", ["NLP", "Python", "FastAPI"], "healthcare", "high"),
    ("Smart Irrigation System", ["IoT", "Python", "MQTT"], "agriculture", "medium"),
    ("Carbon Footprint Tracker", ["React", "Node.js", "MongoDB"], "environment", "medium"),
    ("Multilingual Chatbot", ["LLMs", "LangChain", "Python"], "ai_ml", "high"),
    ("Stock Market Predictor", ["LSTM", "Python", "Pandas"], "fintech", "medium"),
    ("Road Pothole Detector", ["Computer Vision", "PyTorch", "Flask"], "smart_city", "medium"),
    ("Blood Bank Management", ["Django", "React", "PostgreSQL"], "healthcare", "high"),
    ("Talent Recruitment AI", ["LLMs", "FAISS", "FastAPI"], "ai_ml", "high"),
    ("Village Resource Tracker", ["React", "Node.js", "SQLite"], "government", "medium"),
    ("Banking App Redesign", ["Figma", "UI Design", "Prototyping"], "design", "high"),
    ("Vulnerability Scanner Tool", ["Python", "OWASP", "Network Security"], "security", "high"),
    ("Accessible Government Forms UX", ["UX Research", "Figma", "User Testing"], "design", "medium"),
    ("Banking Fraud SOC Dashboard", ["SIEM", "Python", "React"], "security", "high"),
]

COMPANIES = [
    "TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
    "Cognizant", "Capgemini", "IBM India", "Accenture India", "Deloitte India",
    "Razorpay", "CRED", "Zepto", "Swiggy", "Zomato", "PhonePe", "Paytm",
    "Freshworks", "Zoho", "MakeMyTrip", "Nykaa", "Dream11", "BrowserStack",
    "ISRO", "DRDO", "AIIMS", "IIT Research Lab", "IIIT Research",
]

ROLES = [
    "Software Engineer", "AI/ML Engineer", "Data Scientist", "Backend Developer",
    "Full Stack Developer", "Research Engineer", "Data Engineer", "DevOps Engineer",
    "Product Engineer", "Computer Vision Engineer", "NLP Engineer", "MLOps Engineer",
]

CERTS = [
    "AWS Certified Solutions Architect", "Google Cloud Professional",
    "TensorFlow Developer Certificate", "Azure AI Engineer",
    "Coursera Deep Learning Specialization", "fast.ai Practical Deep Learning",
    "MongoDB Certified Developer", "Kubernetes Administrator (CKA)",
    "Stanford ML Certificate", "NPTEL Python for Data Science",
]

CITIES = [
    "Bengaluru", "Hyderabad", "Pune", "Chennai", "Mumbai", "Delhi",
    "Noida", "Gurgaon", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
    "Bhopal", "Indore", "Coimbatore", "Kochi", "Chandigarh", "Patna",
]

def pick_college():
    r = random.random()
    if r < 0.10:
        return random.choice(TIER1), "tier1"
    elif r < 0.30:
        return random.choice(TIER2), "tier2"
    else:
        return random.choice(TIER3), "tier3"

def pick_skills(role_focus):
    base = random.sample(SKILLS_POOL.get(role_focus, SKILLS_POOL["backend"]), 
                         k=min(5, len(SKILLS_POOL.get(role_focus, []))))
    extras = random.sample(SKILLS_POOL["backend"] + SKILLS_POOL["data"], k=random.randint(2, 4))
    return list(set(base + extras))

def gen_activity():
    return {
        "github_repos": random.randint(0, 45),
        "github_stars": random.randint(0, 800),
        "github_commits_last_90d": random.randint(0, 250),  # recency-weighted activity, not just totals
        "leetcode_solved": random.randint(0, 400),
        "kaggle_rank": random.choice([None, None, None, 
                                       f"Top {random.randint(1,20)}%"]),
        "open_source_prs": random.randint(0, 30),
        "open_source_prs_merged": 0,  # set below, always <= prs
        "blog_posts": random.randint(0, 15),
        "hackathons_won": random.randint(0, 5),
        "hackathons_participated": 0,  # set below, always >= won
        "stackoverflow_reputation": random.choice([0, 0, random.randint(50, 5000)]),
        "last_active_days_ago": random.randint(1, 180),
        "consistency_score": round(random.uniform(0.2, 1.0), 2),  # how steady vs bursty their activity is
    }

def _finalize_activity(activity: dict) -> dict:
    """Derive a couple of dependent fields after the base dict exists,
    so they stay logically consistent (e.g. merged PRs can't exceed PRs)."""
    activity["open_source_prs_merged"] = (
        random.randint(0, activity["open_source_prs"])
        if activity["open_source_prs"] > 0 else 0
    )
    activity["hackathons_participated"] = (
        activity["hackathons_won"] + random.randint(0, 6)
    )
    return activity

def gen_candidate(cid):
    focus = random.choice(list(SKILLS_POOL.keys()))
    college, tier = pick_college()
    grad_year = random.randint(2018, 2024)
    exp_years = max(0, 2024 - grad_year - random.randint(0, 1))

    n_projects = random.randint(1, 4)
    chosen_projects = random.sample(PROJECTS, k=n_projects)

    work_exp = []
    for i in range(min(exp_years, 3)):
        work_exp.append({
            "company": random.choice(COMPANIES),
            "role": random.choice(ROLES),
            "years": round(random.uniform(0.5, 2.0), 1),
            "impact": random.choice([
                "Reduced latency by 40%",
                "Built feature used by 2M users",
                "Cut infra costs by 30%",
                "Trained model with 94% accuracy",
                "Automated 80% of manual pipeline",
                "Led team of 3 engineers",
                "Improved throughput 3x",
                "Deployed to production in 2 weeks",
            ])
        })

    certs = random.sample(CERTS, k=random.randint(0, 3))

    # hidden talent signal — tier3 with strong projects
    hidden_gem = (tier == "tier3" and 
                  any(p[3] == "high" for p in chosen_projects) and
                  random.random() < 0.3)

    return {
        "id": cid,
        "name": fake.name(),
        "email": fake.email(),
        "city": random.choice(CITIES),
        "college": college,
        "college_tier": tier,
        "degree": random.choice(["B.Tech", "M.Tech", "MCA", "BCA", "B.Sc CS", "M.Sc DS"]),
        "graduation_year": grad_year,
        "cgpa": round(random.uniform(5.5 if tier == "tier3" else 6.5, 9.8), 1),
        "experience_years": exp_years,
        "skills": pick_skills(focus),
        "skill_focus": focus,
        "projects": [
            {
                "title": p[0],
                "tech_stack": p[1],
                "domain": p[2],
                "impact_level": p[3],
            } for p in chosen_projects
        ],
        "work_experience": work_exp,
        "certifications": certs,
        "activity": _finalize_activity(gen_activity()),
        "is_hidden_gem": hidden_gem,
        "summary": f"{exp_years}yr {'experienced' if exp_years > 0 else 'fresher'} "
                   f"from {college}, skilled in {', '.join(pick_skills(focus)[:3])}.",
    }

JOB_DESCRIPTIONS = [
    {
        "id": "JD001",
        "title": "Senior AI/ML Engineer",
        "company": "AI Startup — Bengaluru",
        "description": """We need a Senior AI/ML Engineer to build next-generation LLM-powered 
        products. You will design RAG pipelines, fine-tune foundation models, and deploy 
        scalable inference systems. Strong Python, LangChain, vector databases (FAISS/Pinecone), 
        and experience with Llama/Mistral required. Bonus: open source contributions, 
        Kaggle rankings, research papers.""",
        "required_skills": ["Python", "LLMs", "LangChain", "FAISS", "NLP"],
        "preferred_skills": ["HuggingFace", "Fine-tuning", "RAG", "Vector DB"],
        "min_experience": 2,
        "domain": "ai_ml",
    },
    {
        "id": "JD002",
        "title": "Full Stack Developer",
        "company": "Fintech Startup — Mumbai",
        "description": """Looking for a Full Stack Developer for our payments platform. 
        You will build React frontends, FastAPI backends, integrate with payment gateways, 
        and maintain PostgreSQL databases at scale. Experience with Docker and CI/CD pipelines 
        essential. Bonus: contributed to open source projects.""",
        "required_skills": ["React", "FastAPI", "PostgreSQL", "Docker"],
        "preferred_skills": ["TypeScript", "Redis", "Kubernetes", "AWS"],
        "min_experience": 1,
        "domain": "backend",
    },
    {
        "id": "JD003",
        "title": "Data Scientist — Healthcare AI",
        "company": "HealthTech Company — Hyderabad",
        "description": """We are building AI tools for Indian hospitals. Need a Data Scientist 
        with experience in medical imaging, clinical NLP, or epidemiology modelling. 
        Python, Scikit-learn, PyTorch essential. Exposure to HL7 FHIR or HMIS systems a 
        strong plus. Social impact mindset preferred.""",
        "required_skills": ["Python", "Scikit-learn", "NLP", "PyTorch"],
        "preferred_skills": ["Medical Imaging", "HL7 FHIR", "Clinical Research", "Bioinformatics"],
        "min_experience": 1,
        "domain": "healthcare",
    },
    {
        "id": "JD004",
        "title": "Backend Engineer — Cloud Infrastructure",
        "company": "SaaS Product Company — Pune",
        "description": """Seeking a Backend Engineer to own our cloud infrastructure. 
        Strong in Node.js or Django, Kubernetes, AWS/GCP, and distributed systems design. 
        Experience with Kafka, Redis, and monitoring stacks (Prometheus/Grafana) is a big plus.""",
        "required_skills": ["Node.js", "Kubernetes", "AWS", "PostgreSQL"],
        "preferred_skills": ["Kafka", "Redis", "Terraform", "Prometheus"],
        "min_experience": 2,
        "domain": "backend",
    },
    {
        "id": "JD005",
        "title": "Computer Vision Engineer",
        "company": "AgriTech Startup — Chennai",
        "description": """Build computer vision models for crop disease detection and yield 
        prediction. Real-world agriculture deployment experience preferred. PyTorch, 
        OpenCV, and model optimization for edge devices (Raspberry Pi, Jetson) required. 
        Passion for solving India's food security problem is a must.""",
        "required_skills": ["Computer Vision", "PyTorch", "Python", "OpenCV"],
        "preferred_skills": ["TensorFlow", "Edge AI", "Flask", "Agriculture domain"],
        "min_experience": 1,
        "domain": "ai_ml",
    },
    {
        "id": "JD006",
        "title": "Product Designer — Fintech",
        "company": "Digital Banking Startup — Bengaluru",
        "description": """Looking for a Product Designer who can design accessible, trustworthy
        financial interfaces for first-time smartphone users across India. Strong in Figma,
        user research, and design systems. Experience designing for low-literacy or
        regional-language users is a strong plus.""",
        "required_skills": ["Figma", "UI Design", "UX Research"],
        "preferred_skills": ["Design Systems", "Prototyping", "User Testing"],
        "min_experience": 1,
        "domain": "design",
    },
    {
        "id": "JD007",
        "title": "Security Engineer — Banking",
        "company": "NBFC — Mumbai",
        "description": """Need a Security Engineer to harden our banking infrastructure against
        fraud and intrusion. Strong in penetration testing, SIEM tooling, and OWASP top-10
        mitigation. Experience in regulated financial environments preferred.""",
        "required_skills": ["Penetration Testing", "SIEM", "OWASP"],
        "preferred_skills": ["Network Security", "Threat Modeling", "SOC Operations"],
        "min_experience": 2,
        "domain": "security",
    },
    {
        "id": "JD008",
        "title": "Data Engineer — Analytics Platform",
        "company": "Logistics Tech Company — Hyderabad",
        "description": """Build and maintain large-scale data pipelines powering real-time
        delivery analytics across India. Strong in Spark, Airflow, and SQL at scale.
        Experience with Kafka streaming pipelines a strong plus.""",
        "required_skills": ["Spark", "Airflow", "SQL"],
        "preferred_skills": ["Kafka", "BigQuery", "dbt"],
        "min_experience": 2,
        "domain": "data",
    },
    {
        "id": "JD009",
        "title": "DevOps Engineer — Scale-up",
        "company": "EdTech Company — Pune",
        "description": """Own our CI/CD and cloud infrastructure as we scale to millions of
        students. Strong in Kubernetes, Terraform, and observability tooling. Comfortable
        being on-call and debugging production incidents under pressure.""",
        "required_skills": ["Kubernetes", "Terraform", "CI/CD"],
        "preferred_skills": ["Prometheus", "Grafana", "AWS"],
        "min_experience": 2,
        "domain": "cloud",
    },
    {
        "id": "JD010",
        "title": "Junior Full Stack Developer",
        "company": "Early-stage Startup — Jaipur",
        "description": """First engineering hire for a small but ambitious team. Comfortable
        across the stack — React on the frontend, Node or Django on the backend. We care more
        about how fast you learn and ship than your years of experience. Freshers encouraged
        to apply if you've built and shipped real things.""",
        "required_skills": ["React", "Node.js", "JavaScript"],
        "preferred_skills": ["TypeScript", "MongoDB", "REST APIs"],
        "min_experience": 0,
        "domain": "frontend",
    },
]

def main():
    # Resolve paths relative to this script's location, so it works on any machine
    base_dir = Path(__file__).parent.parent  # contextrank/
    raw_dir = base_dir / "data" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    print(f"Generating {CANDIDATE_COUNT} candidate profiles...")
    candidates = [gen_candidate(f"C{str(i).zfill(4)}") for i in range(1, CANDIDATE_COUNT + 1)]

    with open(raw_dir / "candidates.json", "w") as f:
        json.dump(candidates, f, indent=2, default=str)
    print(f"  Saved {len(candidates)} candidates")

    with open(raw_dir / "job_descriptions.json", "w") as f:
        json.dump(JOB_DESCRIPTIONS, f, indent=2)
    print(f"  Saved {len(JOB_DESCRIPTIONS)} job descriptions")

    # Stats
    tiers = {"tier1": 0, "tier2": 0, "tier3": 0}
    hidden = 0
    for c in candidates:
        tiers[c["college_tier"]] += 1
        if c["is_hidden_gem"]:
            hidden += 1
    
    print(f"\nDataset stats:")
    print(f"  Tier-1 college: {tiers['tier1']} ({100*tiers['tier1']/len(candidates):.1f}%)")
    print(f"  Tier-2 college: {tiers['tier2']} ({100*tiers['tier2']/len(candidates):.1f}%)")
    print(f"  Tier-3 college: {tiers['tier3']} ({100*tiers['tier3']/len(candidates):.1f}%)")
    print(f"  Hidden gems (tier3 + high-impact projects): {hidden}")
    print("\nDataset ready!")

if __name__ == "__main__":
    main()
