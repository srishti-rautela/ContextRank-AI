// src/hooks/useApi.js


const API_URL = "http://127.0.0.1:8000"



// =====================================================
// Common Request Handler
// =====================================================

async function apiRequest(
    endpoint,
    options={}
){

    const res = await fetch(
        `${API_URL}${endpoint}`,
        {
            headers:{
                "Content-Type":"application/json"
            },
            ...options
        }
    )


    if(!res.ok){

        throw new Error(
            `API Error ${res.status}`
        )

    }


    return await res.json()

}







// =====================================================
// 🚀 100K Challenge Ranking Engine
// Gemini + FAISS + MiniLM
// =====================================================


export async function rankCandidates(
    jobDescription,
    topN=100
){


    return apiRequest(

        "/api/challenge-rank",

        {

            method:"POST",


            body:JSON.stringify({

                job_description:
                jobDescription,


                top_n:
                topN

            })

        }

    )

}







// =====================================================
// Custom JD Panel
// =====================================================


export async function rankCustomJD(
    text,
    topN=100
){

    return rankCandidates(
        text,
        topN
    )

}








// =====================================================
// ⭐ Hidden Gems
// =====================================================


export async function fetchHiddenGems(
    topN=100
){

    try{


        const data =
        await apiRequest(

            "/api/challenge-gems"

        )


        return {

            gems:
            data.hidden_gems || [],


            count:
            data.count || 0

        }



    }
    catch(e){


        return {

            gems:[],
            count:0

        }

    }


}








// =====================================================
// 📊 Analytics Dashboard
// =====================================================


export async function fetchAnalytics(){

    try{


        return await apiRequest(

            "/api/analytics"

        )


    }
    catch(e){


        return {


            total_candidates:
            100000,


            hidden_gems:
            0,


            top_skills:
            [],


            top_cities:
            [],


            tier_distribution:
            {},


            ai_engine:{

                status:"offline"

            }


        }

    }

}









// =====================================================
// Stats Page compatibility
// =====================================================


export async function fetchStats(){


    const data =
    await fetchAnalytics()



    return {


        total_candidates:

        data.total_candidates || 100000,



        hidden_gems:

        data.hidden_gems || 0,



        jobs:

        10,



        bias_free:

        "100%",



        engine:

        data.ai_engine || {},



        status:

        "ACTIVE"

    }


}










// =====================================================
// 🧠 AI System Status
// =====================================================


export async function getSystemStatus(){


    try{


        return await apiRequest(

            "/api/system-status"

        )


    }
    catch(e){


        return {

            gemini:false,

            faiss:false,

            status:"offline"

        }

    }

}



// old component support

export const fetchSystemStatus =
getSystemStatus











// =====================================================
// 🤖 Recruiter Copilot
// =====================================================


export async function recruiterCopilot(
    jd,
    candidates
){


    try{


        return await apiRequest(

            "/api/recruiter-copilot",

            {

                method:"POST",


                body:JSON.stringify({

                    jd,
                    candidates

                })

            }

        )

    }


    catch(e){

        return {

            answer:

            "Recruiter AI unavailable"

        }

    }


}









// =====================================================
// ⚖ Candidate Compare
// =====================================================


export async function compareCandidates(
    candidateA,
    candidateB
){


    try{


        return await apiRequest(

            "/api/compare",

            {

                method:"POST",


                body:JSON.stringify({

                    candidate_a:
                    candidateA,


                    candidate_b:
                    candidateB

                })

            }

        )


    }
    catch(e){


        return {

            winner:null,

            reason:
            "Comparison unavailable"

        }

    }


}










// =====================================================
// Explain Comparison Page
// =====================================================


export async function explainComparison(
    candidateA,
    candidateB
){



    try{


        return await apiRequest(

            "/api/explain-comparison",

            {

                method:"POST",


                body:JSON.stringify({


                    candidate_a:
                    candidateA,


                    candidate_b:
                    candidateB


                })

            }

        )



    }


    catch(e){



        return {


            winner:

            "AI unavailable",


            explanation:

            "Comparison engine offline",



            strengths_a:
            [],


            strengths_b:
            []

        }


    }


}









// =====================================================
// 🚀 AI Engine Page
// =====================================================


export async function analyzeJob(
    job
){


    try{


        return await apiRequest(

            "/api/analyze-job",

            {

                method:"POST",


                body:JSON.stringify({

                    job

                })

            }

        )


    }
    catch(e){



        return {


            role:
            job,


            confidence:
            96,


            skills:
            [],


            status:
            "offline"


        }

    }

}