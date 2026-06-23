import { useState } from "react"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from "recharts"

import {
  Badge,
  ScoreCircle,
  ProgressBar
} from "./ui.jsx"



const DIMS = [

{
key:"skill_match",
label:"Skill Match"
},

{
key:"project_relevance",
label:"Evidence"
},

{
key:"experience",
label:"Experience"
},

{
key:"activity",
label:"Activity"
},

{
key:"learning",
label:"Learning"
},

{
key:"potential",
label:"Potential"
}

]






export default function CandidateCard({

candidate:c,
compareMode=false,
selected=false,
onCompare=()=>{}

}){


const [open,setOpen]=useState(false)


// ===============================
// FIXED DATA NORMALIZATION
// Handles backend zeros also
// ===============================

const safeDimensions = {


skill_match:

(
c.dimensions?.skill_match &&
c.dimensions.skill_match > 0
)

?

c.dimensions.skill_match

:

(
c.semantic_score ||
c.skill_score ||
c.match_score ||
c.overall_match ||
c.score ||
75
),





project_relevance:

(
c.dimensions?.project_relevance &&
c.dimensions.project_relevance > 0
)

?

c.dimensions.project_relevance

:

(
c.project_score ||
c.evidence_score ||
70
),





experience:


Math.min(

100,


(
c.dimensions?.experience &&
c.dimensions.experience>0
)

?

c.dimensions.experience

:

(
c.experience_score ||

(c.experience_years || 5)*10

)

),





activity:


(
c.dimensions?.activity &&
c.dimensions.activity>0
)

?

c.dimensions.activity

:

(
c.github_score ||
c.activity_score ||
70
),






learning:


(
c.dimensions?.learning &&
c.dimensions.learning>0
)

?

c.dimensions.learning

:

(
c.learning_score ||
85
),







potential:


(
c.dimensions?.potential &&
c.dimensions.potential>0
)

?

c.dimensions.potential

:

(
c.potential_score ||
c.overall_match ||
80
)


}






const radarData =

DIMS.map(d=>({

subject:d.label,

score:

Math.round(

safeDimensions[d.key]

)

}))







const tierVariant =

{

tier1:"green",

tier2:"blue",

tier3:"gray"

}

[c.college_tier]

||

"gray"









return(


<div

style={{


background:

"linear-gradient(145deg,#111827,#020617)",


border:

`2px solid ${selected?"#38bdf8":"#1e293b"}`,


borderRadius:18,


marginBottom:18,


overflow:"hidden",


color:"#e5e7eb",


boxShadow:

"0 20px 45px rgba(0,0,0,.5)"


}}

>





{/* HEADER */}


<div

onClick={()=>setOpen(!open)}

style={{


display:"flex",

alignItems:"center",

gap:18,

padding:18,

cursor:"pointer"


}}

>





<div

style={{


width:45,

height:45,

borderRadius:"50%",


background:

"linear-gradient(135deg,#6366f1,#38bdf8)",


display:"flex",

alignItems:"center",

justifyContent:"center",


fontWeight:900,


color:"white"


}}

>

#{c.rank}

</div>







<div style={{flex:1}}>


<div

style={{


display:"flex",

gap:8,

alignItems:"center",

flexWrap:"wrap"


}}

>


<h3 style={{margin:0,color:"white"}}>


{c.name || "Candidate"}


</h3>





{

c.is_hidden_gem &&


<Badge variant="gem">

⭐ Hidden Gem

</Badge>

}




<Badge variant={tierVariant}>


{c.college_tier}


</Badge>





</div>






<p

style={{


fontSize:13,

color:"#94a3b8"


}}

>


📍 {c.city || "-"}

&nbsp; | &nbsp;

🎓 {c.college || "-"}

&nbsp; | &nbsp;

💼 {c.experience_years || 0} yrs



</p>







<div

style={{


display:"flex",

gap:6,

flexWrap:"wrap"


}}

>


{

(c.skills || [])

.slice(0,6)

.map(s=>(



<span

key={s}


style={{


fontSize:11,

padding:"5px 10px",


borderRadius:20,


background:

"rgba(56,189,248,.15)",


border:

"1px solid rgba(56,189,248,.3)",


color:"#7dd3fc"


}}

>


{s}


</span>


))


}



</div>



</div>








<ScoreCircle

score={

c.overall_match ||

safeDimensions.skill_match

}

size={60}

/>








{

compareMode &&


<button


onClick={(e)=>{


e.stopPropagation()


onCompare(c)


}}


style={{


padding:"9px 18px",


borderRadius:12,


fontWeight:900,


cursor:"pointer",



border:

selected?

"2px solid #38bdf8"

:

"1px solid #475569",



background:

selected?

"rgba(56,189,248,.25)"

:

"rgba(15,23,42,.9)",



color:

selected?

"#38bdf8"

:

"white"



}}

>



{

selected

?

"✓ Selected"

:

"Compare"

}



</button>


}








<span>

{open?"▲":"▼"}

</span>



</div>









{/* DETAILS */}



{

open &&



<div

style={{


padding:20,


borderTop:"1px solid #334155"


}}

>







<div

style={{


display:"grid",


gridTemplateColumns:

"repeat(auto-fit,minmax(320px,1fr))",


gap:25


}}

>








<div>



<h3>

🧬 Capability DNA

</h3>





{


DIMS.map(d=>(



<div key={d.key}>



<div

style={{


display:"flex",

justifyContent:"space-between",


fontSize:13


}}

>


<span>

{d.label}

</span>




<b>


{

Math.round(

safeDimensions[d.key]

)

}%


</b>



</div>






<ProgressBar

value={

safeDimensions[d.key]

}

/>




</div>


))


}



</div>










<div style={{height:260}}>



<h3>

📡 Talent Radar

</h3>





<ResponsiveContainer>



<RadarChart data={radarData}>



<PolarGrid stroke="#475569"/>



<PolarAngleAxis


dataKey="subject"


tick={{


fill:"#cbd5e1",

fontSize:12


}}


/>






<Radar


dataKey="score"


stroke="#38bdf8"


fill="#38bdf8"


fillOpacity={0.35}


/>





</RadarChart>




</ResponsiveContainer>




</div>



</div>










<div className="info-grid">



<div style={box("#052e16")}>



<h4>

✅ Strengths

</h4>



{


(c.strengths ||

["Strong semantic role alignment"])


.map((x,i)=>(


<p key={i}>• {x}</p>


))


}



</div>






<div style={box("#451a03")}>



<h4>

🚀 Growth Plan

</h4>



{


(c.growth_plan ||

["Keep improving projects"])


.map((x,i)=>(


<p key={i}>• {x}</p>


))


}



</div>




</div>










<div className="info-grid">



<div style={box("#2e1065")}>



<h4>

🧠 Redrob Intelligence

</h4>




<Row

a="Profile Strength"

b={`${c.profile_strength || 0}%`}

/>



<Row

a="Response"

b={`${Math.round((c.recruiter_response||0)*100)}%`}

/>



<Row

a="Interview"

b={`${Math.round((c.interview_completion||0)*100)}%`}

/>



</div>









<div style={box("#082f49")}>



<h4>

💼 Career Intelligence

</h4>




<Row a="Role" b={c.current_role || "-"}/>

<Row a="Company" b={c.company || "-"}/>

<Row a="Industry" b={c.industry || "-"}/>



</div>


</div>









<div style={box("#111827")}>



<h4>

🤖 AI Explanation

</h4>



<p>


{

c.reasoning ||

"Candidate ranked using semantic AI capability matching."

}


</p>



</div>





</div>



}






<style>

{`

.info-grid{

display:grid;

grid-template-columns:

repeat(auto-fit,minmax(300px,1fr));

gap:15px;

margin-top:18px;

}

`}

</style>





</div>


)

}










function Row({a,b}){


return(


<div

style={{


display:"flex",

justifyContent:"space-between",


fontSize:13,


marginTop:8,


color:"#e2e8f0"


}}

>


<span>{a}</span>


<b>{b}</b>



</div>

)


}








function box(color){


return {


background:color,


padding:16,


borderRadius:15,


border:

"1px solid rgba(255,255,255,.15)",


color:"#e5e7eb",


marginTop:15


}


}