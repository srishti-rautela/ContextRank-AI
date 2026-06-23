"""
CapabilityDNA Engine Tests
"""


from backend.core.capability_dna import CapabilityDNA





def test_capability_score():


    dna = CapabilityDNA(

        candidate_id="TEST001",

        name="AI Candidate"

    )


    assert dna is not None



    assert hasattr(
        dna,
        "candidate_id"
    )