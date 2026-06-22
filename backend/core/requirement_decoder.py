"""
Requirement Decoder
===================
Parses a raw job description text and extracts:
  - Explicit required skills
  - Hidden/implied skills
  - Seniority level
  - Domain
  - Culture signals
Uses rule-based NLP (no external API key needed for demo).
Plug in an LLM call here for production.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field


SKILL_PATTERNS = {
    # AI / ML
    "Python":           r"\bpython\b",
    "LLMs":             r"\bllm[s]?\b|large language model",
    "LangChain":        r"\blangchain\b",
    "FAISS":            r"\bfaiss\b|vector\s+db|vector\s+database|pinecone",
    "NLP":              r"\bnlp\b|natural language",
    "Computer Vision":  r"\bcomputer\s+vision\b|\bcv\b|image\s+recognition",
    "PyTorch":          r"\bpytorch\b",
    "TensorFlow":       r"\btensorflow\b",
    "HuggingFace":      r"\bhuggingface\b|hugging\s+face|transformers",
    "Scikit-learn":     r"\bscikit[- ]?learn\b|sklearn",
    "XGBoost":          r"\bxgboost\b",
    "LightGBM":         r"\blightgbm\b",
    "Fine-tuning":      r"\bfine[- ]tun",
    "RAG":              r"\brag\b|retrieval.augmented",
    # Backend
    "FastAPI":          r"\bfastapi\b",
    "Django":           r"\bdjango\b",
    "Flask":            r"\bflask\b",
    "Node.js":          r"\bnode\.?js\b",
    "Spring Boot":      r"\bspring\s*boot\b",
    "PostgreSQL":       r"\bpostgresql\b|postgres",
    "MongoDB":          r"\bmongodb\b|mongo\b",
    "Redis":            r"\bredis\b",
    "Kafka":            r"\bkafka\b",
    "Docker":           r"\bdocker\b",
    "Kubernetes":       r"\bkubernetes\b|k8s",
    "REST APIs":        r"\brest\s*api|\brestful\b",
    "GraphQL":          r"\bgraphql\b",
    "Microservices":    r"\bmicroservice",
    # Frontend
    "React":            r"\breact\b",
    "Next.js":          r"\bnext\.?js\b",
    "TypeScript":       r"\btypescript\b",
    "Vue.js":           r"\bvue\.?js\b",
    # Cloud / DevOps
    "AWS":              r"\baws\b|amazon\s+web\s+services",
    "GCP":              r"\bgcp\b|google\s+cloud",
    "Azure":            r"\bazure\b",
    "Terraform":        r"\bterraform\b",
    "CI/CD":            r"\bci[/ ]?cd\b|continuous\s+integr",
    "Prometheus":       r"\bprometheus\b",
    # Data
    "SQL":              r"\bsql\b",
    "Pandas":           r"\bpandas\b",
    "Spark":            r"\bspark\b|pyspark",
    # Healthcare
    "HL7 FHIR":         r"\bfhir\b|hl7",
    "Clinical Research":r"\bclinical\s+research\b",
    "Medical Imaging":  r"\bmedical\s+imag",
    # Design
    "Figma":            r"\bfigma\b",
    "UI Design":        r"\bui\s+design|user\s+interface\s+design",
    "UX Research":      r"\bux\s+research|user\s+research",
    "Design Systems":   r"design\s+system",
    "Prototyping":      r"\bprototyp",
    "User Testing":     r"user\s+test|usability\s+test",
    # Security
    "Penetration Testing": r"\bpenetration\s+test|\bpen[- ]?test",
    "SIEM":             r"\bsiem\b",
    "OWASP":            r"\bowasp\b",
    "Network Security": r"network\s+security",
    "Threat Modeling":  r"threat\s+model",
    "SOC Operations":   r"\bsoc\b|security\s+operations",
}

HIDDEN_SKILL_SIGNALS = {
    "Problem solving":      r"problem.solv|analytical|complex\s+challenge",
    "Research ability":     r"\bresearch\b|paper[s]?|publish|arxiv",
    "Leadership":           r"\blead\b|mentor|cross[- ]funct|team\s+lead",
    "Communication":        r"communicat|collaborate|stakeholder",
    "Fast learner":         r"fast.learn|pick\s+up\s+quickly|adapt",
    "Open source mindset":  r"open.source|community|contributor",
    "Impact driven":        r"impact|scale|million\s+user|social\s+good",
    "System design":        r"system\s+design|architect|distributed\s+system",
    "Ownership":            r"\bownership\b|end.to.end|independent",
}

# Role-title-based implied requirements: things a real recruiter would
# expect from a title even if the JD text never spells them out. This is
# deliberately conservative — only fires on clear, well-understood title
# patterns, not vague inference, so it can't quietly invent expectations
# that aren't reasonable to assume from the title alone.
TITLE_IMPLIED_SIGNALS = {
    r"\bsenior\b|\bsr\.?\b|\blead\s+engineer\b|principal|staff\s+engineer": [
        "System design", "Ownership", "Leadership",
    ],
    r"\bbackend\s+engineer\b|\bapi\s+engineer\b": [
        "System design", "Problem solving",
    ],
    r"\bfull\s*stack\b": [
        "Fast learner", "Ownership",
    ],
    r"\bdevops\b|\bsre\b|\bcloud\s+engineer\b": [
        "Ownership", "Problem solving",
    ],
    r"\bdata\s+scientist\b|\bml\s+engineer\b|\bai\s+engineer\b": [
        "Research ability", "Problem solving",
    ],
    r"\bjunior\b|\bentry[- ]level\b|\bfresher\b": [
        "Fast learner",
    ],
}


def _title_implied_signals(title: str) -> list[str]:
    """Returns hidden signals implied by the role title alone, even when
    the description text doesn't explicitly mention them. Deduplicated,
    order-preserving."""
    title_lower = title.lower()
    found = []
    for pattern, signals in TITLE_IMPLIED_SIGNALS.items():
        if re.search(pattern, title_lower, re.I):
            for s in signals:
                if s not in found:
                    found.append(s)
    return found

DOMAIN_MAP = {
    "ai_ml":       r"\bllm|nlp|machine\s+learn|deep\s+learn|ai\s+engineer|ml\s+engineer",
    "backend":     r"\bbackend|server.side|api\s+engineer|infrastructure",
    "frontend":    r"\bfrontend|ui\s+engineer|react\s+developer",
    "healthcare":  r"\bhealth|medical|clinical|hospital|patient",
    "agriculture": r"\bagri|crop|farm|yield|irrigation",
    "fintech":     r"\bfintech|payment|fraud|banking|finance",
    "education":   r"\beducat|student|school|learning\s+platform",
    "data":        r"\bdata\s+sci|data\s+engineer|analytics\s+engineer",
    "devops":      r"\bdevops|cloud\s+engineer|infrastructure\s+engineer|sre\b",
    "design":      r"\bproduct\s+design|ui\s+design|ux\s+research|design\s+system",
    "security":    r"\bsecurity\s+engineer|penetration\s+test|\bsoc\b|threat\s+model",
}

SENIORITY_MAP = {
    "senior":   r"\bsenior\b|sr\.\s|lead\s+engineer|principal|staff\s+engineer",
    "mid":      r"\bmid[- ]?level\b|3\+?\s+year|2\+?\s+year",
    "junior":   r"\bjunior\b|jr\.\s|fresher|entry[- ]?level|0[- ]?1\s+year",
    "any":      r"\bany\s+level\b",
}


@dataclass
class DecodedRequirement:
    title: str = ""
    explicit_skills: list = field(default_factory=list)
    hidden_skills: list = field(default_factory=list)
    title_implied_skills: list = field(default_factory=list)
    domain: str = "general"
    seniority: str = "mid"
    culture_signals: list = field(default_factory=list)
    min_experience: int = 0
    all_skills: list = field(default_factory=list)


def decode_jd(jd: dict) -> DecodedRequirement:
    """Parse a job description dict and return a DecodedRequirement."""
    text = f"{jd.get('title', '')} {jd.get('description', '')}".lower()
    req = DecodedRequirement(title=jd.get("title", ""))

    # Explicit skills from text
    found = []
    for skill, pattern in SKILL_PATTERNS.items():
        if re.search(pattern, text, re.I):
            found.append(skill)
    # Also include pre-tagged required/preferred
    tagged = jd.get("required_skills", []) + jd.get("preferred_skills", [])
    req.explicit_skills = list(dict.fromkeys(found + tagged))  # preserve order, dedupe

    # Hidden signals — text-based detection, same as before
    text_based_hidden = [
        skill for skill, pattern in HIDDEN_SKILL_SIGNALS.items()
        if re.search(pattern, text, re.I)
    ]
    # Title-implied signals — things a real recruiter would expect from
    # the role title even if never explicitly stated in the description
    title_based_hidden = _title_implied_signals(jd.get("title", ""))

    # Merge, deduped, preserving which ones were title-only (no text match)
    # for explainability — these are inferred, not literally stated.
    req.hidden_skills = list(dict.fromkeys(text_based_hidden + title_based_hidden))
    req.title_implied_skills = [
        s for s in title_based_hidden if s not in text_based_hidden
    ]

    # Domain
    for domain, pattern in DOMAIN_MAP.items():
        if re.search(pattern, text, re.I):
            req.domain = domain
            break

    # Seniority
    for level, pattern in SENIORITY_MAP.items():
        if re.search(pattern, text, re.I):
            req.seniority = level
            break

    # Min experience from text
    exp_match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)", text, re.I)
    if exp_match:
        req.min_experience = int(exp_match.group(1))
    else:
        req.min_experience = jd.get("min_experience", 0)

    # Culture signals
    culture_keywords = {
        "startup mindset": r"startup|fast[- ]paced|move\s+fast",
        "social impact":   r"social\s+impact|india|rural|bharat|underserved",
        "research culture":r"research|publish|paper|r&d",
        "remote friendly": r"remote|work\s+from\s+home|hybrid",
        "ownership culture":r"ownership|end.to.end|autonomy",
    }
    req.culture_signals = [
        label for label, pattern in culture_keywords.items()
        if re.search(pattern, text, re.I)
    ]

    req.all_skills = req.explicit_skills  # used for matching
    return req
