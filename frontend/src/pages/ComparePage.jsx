import { useState } from "react"

import {
 Brain,
 Trophy,
 XCircle
} from "lucide-react"

import {
 explainComparison
} from "../hooks/useApi.js"





export default function ComparePage({

selected=[],
onClear

}){


const [analysis,setAnalysis]=useState(null)

const [loading,setLoading]=useState(false)





async function runCompare(){


if(selected.length!==2)
return



setLoading(true)

setAnalysis(null)



try{


const res =
await explainComparison(

selected[0],

selected[1]

)


setAnalysis(res)



}

catch(e){


setAnalysis({

winner:"AI unavailable",

explanation:
"Comparison service failed. Showing local capability comparison."

})


}



setLoading(false)



}









if(selected.length<2){


return(

<div className="empty">


<h1>

⚖ Candidate Comparison

</h1>


<p>

Enable compare mode and select any 2 candidates.

</p>



<h2>

Selected {selected.length}/2

</h2>


</div>

)


}








const a=selected[0]

const b=selected[1]








return(


<div>



<h1>

⚖ AI Candidate Battle

</h1>



<p style={{color:"#94a3b8"}}>

ContextRank compares candidates beyond keywords using semantic capability signals.

</p>






<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(320px,1fr))",

gap:25,

marginTop:30

}}

>


<CandidateBox candidate={a}/>


<CandidateBox candidate={b}/>


</div>









<button

onClick={runCompare}

disabled={loading}


style={{

marginTop:30,

padding:"15px 35px",

borderRadius:14,

border:"none",

background:
"linear-gradient(90deg,#6366f1,#06b6d4)",

color:"white",

fontWeight:900,

fontSize:15,

display:"flex",

alignItems:"center",

gap:10,

cursor:"pointer"

}}

>


<Brain size={20}/>



{

loading

?

"AI analyzing..."

:

"Compare with AI"

}



</button>








{

loading &&


<div

style={{

margin:"40px auto",

width:50,

height:50,

borderRadius:"50%",

border:"5px solid #334155",

borderTop:"5px solid white",

animation:"spin 1s linear infinite"

}}

/>


}









{

analysis &&


<div className="decision">


<Trophy size={35}/>



<h2>

🏆 AI Decision

</h2>



<h1>

{

analysis.winner ||

"Best Match Selected"

}

</h1>




<p>

{

analysis.explanation ||

analysis.reason ||

"Candidate selected based on stronger semantic match, skills and potential."

}

</p>




<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(250px,1fr))",

gap:15

}}

>


<Mini title="Candidate A Strengths"
items={analysis.strengths_a}/>


<Mini title="Candidate B Strengths"
items={analysis.strengths_b}/>


</div>



</div>


}









<button

onClick={onClear}


style={{

marginTop:25,

padding:"12px 25px",

borderRadius:12,

background:"#7f1d1d",

border:"none",

color:"white",

fontWeight:800,

cursor:"pointer",

display:"flex",

gap:8,

alignItems:"center"

}}

>


<XCircle size={18}/>

Clear Comparison


</button>







<style>

{`

.empty,

.decision{

background:

linear-gradient(145deg,#111827,#020617);


border:

1px solid rgba(255,255,255,.15);


color:white;


padding:30px;


border-radius:20px;


box-shadow:

0 20px 40px rgba(0,0,0,.5);


}



@keyframes spin{

from{

transform:rotate(0deg);

}

to{

transform:rotate(360deg);

}

}


`}

</style>




</div>


)


}










function CandidateBox({candidate}){


return(

<div

style={{

background:

"linear-gradient(145deg,#111827,#020617)",


border:

"1px solid rgba(255,255,255,.15)",


padding:25,


borderRadius:20,


color:"white",


boxShadow:

"0 20px 40px rgba(0,0,0,.45)"

}}

>



<h2>

🏅 Rank #{candidate.rank}

</h2>




<h1>

{

candidate.name ||

candidate.candidate_id

}

</h1>






<h1

style={{

color:"#22c55e",

fontSize:45

}}

>


{

Math.round(

candidate.overall_match ||

candidate.rank_score ||

candidate.score ||

0

)

}

%

</h1>






<p style={{color:"#94a3b8"}}>


{

candidate.reasoning ||

"AI generated talent profile."

}


</p>







<div

style={{

display:"flex",

gap:8,

flexWrap:"wrap"

}}

>


{


(candidate.skills || [])

.slice(0,10)

.map(s=>(


<span

key={s}


style={{


background:

"rgba(56,189,248,.15)",


border:

"1px solid #38bdf8",


color:"#7dd3fc",


padding:"6px 12px",


borderRadius:20,


fontSize:12


}}

>


{s}


</span>


))


}


</div>



</div>


)

}









function Mini({title,items=[]}){


return(

<div

style={{

background:

"rgba(255,255,255,.08)",

padding:15,

borderRadius:12,

marginTop:20

}}

>


<h4>

{title}

</h4>



{

(items.length?items:["Strong capability signals"])

.map((x,i)=>(

<p key={i}>

✓ {x}

</p>

))

}



</div>

)

}