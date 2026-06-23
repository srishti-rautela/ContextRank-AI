// src/pages/RankPage.jsx

import { useEffect, useState, useCallback } from "react"

import { rankCandidates } from "../hooks/useApi.js"

import {
  Badge,
  Spinner,
  EmptyState
} from "../components/ui.jsx"

import CandidateCard from "../components/CandidateCard.jsx"
import LiveRankAnimation from "../components/LiveRankAnimation.jsx"
import SystemStatusBadge from "../components/SystemStatusBadge.jsx"
import CustomJDPanel from "../components/CustomJDPanel.jsx"
import RecruiterCopilot from "../components/RecruiterCopilot.jsx"



const JOBS = [

  {
    id:
    "Need AI Engineer skilled in Python, LLM, RAG, embeddings, vector databases, NLP and MLOps",

    label:
    "AI Engineer"
  },


  {
    id:
    "Backend Engineer with Python, Spark, Kafka, SQL, distributed systems and cloud",

    label:
    "Backend Engineer"
  },


  {
    id:
    "Data Scientist with machine learning, NLP, deep learning, statistics and Python",

    label:
    "Data Scientist"
  },


  {
    id:
    "Full Stack Developer React Node Python databases and cloud deployment",

    label:
    "Full Stack"
  },


  {
    id:
    "Computer Vision Engineer PyTorch OpenCV image classification models",

    label:
    "Computer Vision"
  }

]





export default function RankPage(
{
 jdId,
 setJdId,
 compareMode,
 selected,
 onCompare
}
){


const [results,setResults] =
useState(null)


const [loading,setLoading] =
useState(false)


const [error,setError] =
useState(null)


const [showAnimation,setShowAnimation] =
useState(false)


const [animationDone,setAnimationDone] =
useState(false)





const load = useCallback(

async (jobText)=>{


try{


setLoading(true)

setError(null)

setAnimationDone(false)


console.log(
"Sending JD:",
jobText
)



const data =
await rankCandidates(
jobText,
100
)



console.log(
"API RESPONSE:",
data
)



setResults(data)


setShowAnimation(true)


}

catch(err){


console.error(err)


setError(
"Could not connect ranking API"
)


}

finally{

setLoading(false)

}


},[]

)





useEffect(()=>{


if(jdId){

load(jdId)

}


},[
jdId,
load
])






function handleCustomResults(data){


console.log(
"CUSTOM JD RESULT:",
data
)


setResults(data)


setShowAnimation(true)


setAnimationDone(false)


}






const candidates =

results?.results
||
results?.shortlisted
||
[]







return (


<div>



{/* CUSTOM JD */}
<CustomJDPanel

onResults={
handleCustomResults
}

/>





{/* JOB SELECTOR */}

<div

style={{

background:"#fff",

border:"1px solid #E5E7EB",

borderRadius:12,

padding:"14px 16px",

marginBottom:16

}}

>


<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

marginBottom:10

}}

>


<div

style={{

fontSize:11,

fontWeight:700,

color:"#94a3b8",

textTransform:"uppercase"

}}

>

Select Job Description

</div>



<SystemStatusBadge/>


</div>





<div

style={{

display:"flex",

gap:8,

flexWrap:"wrap"

}}

>


{

JOBS.map(

j=>(


<button


key={j.label}


onClick={()=>setJdId(j.id)}



style={{


padding:"8px 14px",

borderRadius:8,

cursor:"pointer",

border:

jdId===j.id

?

"none"

:

"1px solid #D1D5DB",



background:

jdId===j.id

?

"#6366F1"

:

"#fff",



color:

jdId===j.id

?

"#fff"

:

"#94a3b8",



fontWeight:600


}}


>


{j.label}


</button>


)

)


}


</div>


</div>






{/* COMPARE MODE */}


{

compareMode &&

<div
style={{

background:
"linear-gradient(145deg,#111827,#020617)",

border:
"1px solid rgba(56,189,248,.35)",

boxShadow:
"0 15px 35px rgba(0,0,0,.45)",

padding:"18px 22px",

borderRadius:16,

margin:"20px 0",

color:"white",

fontWeight:800

}}
>


<span
style={{
color:"#38bdf8",
fontSize:18
}}
>
🔍
</span>

{" "}

Compare Mode Active ({selected.length}/2)


</div>

}








{/* LOADING */}


{

loading &&


<div

style={{

display:"flex",

justifyContent:"center",

padding:50

}}

>


<Spinner size={35}/>


</div>


}








{/* ERROR */}


{

error &&

<div

style={{

background:"#FEE2E2",

padding:15,

borderRadius:10,

color:"#991B1B"

}}

>


{error}


</div>


}









{/* ANIMATION */}


{


!loading

&&

results

&&

showAnimation

&&

!animationDone

&&


<LiveRankAnimation


candidates={

candidates

}


onComplete={()=>{

setAnimationDone(true)

}}


/>


}









{/* RESULTS */}


{


results

&&

animationDone

&&

(


<>



<div

style={{

marginBottom:10

}}

>


<b>

Ranked for:

</b>


{" "}


{

results.jd_title

||

results.job_understood

}



</div>







<div

style={{

display:"flex",

gap:8,

flexWrap:"wrap",

marginBottom:12

}}

>



<Badge variant="purple">


{

results.total_pool

||

results.total_candidates_analyzed

}


{" "}

candidates analyzed


</Badge>




<Badge variant="gem">


⭐ {


results.hidden_gems_found

||

0

}


 hidden gems


</Badge>






{

(

results.decoded_skills

||

[]

)

.map(

s=>(


<Badge

key={s}

variant="blue"

>

{s}

</Badge>


)

)


}




</div>







<RecruiterCopilot


jdId={jdId}


candidates={candidates}


/>







{


candidates.map(

c=>(


<CandidateCard


key={c.candidate_id}


candidate={c}


compareMode={compareMode}


selected={

selected.some(

x=>

x.candidate_id

===

c.candidate_id

)

}


onCompare={onCompare}


/>


)

)

}







{

candidates.length===0

&&


<EmptyState


icon="🔍"


title="No candidates"


subtitle="Try another JD"


/>


}




</>


)


}



</div>


)

}