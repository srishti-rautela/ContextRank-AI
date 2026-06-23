import { useEffect, useState } from "react";

import {
 Brain,
 Database,
 Zap,
 Shield,
 CheckCircle
} from "lucide-react";


import {
 fetchAnalytics
} from "../hooks/useApi.js";






export default function AIEnginePage(){


const [engine,setEngine] =
useState(null);





useEffect(()=>{

load();

},[]);






async function load(){


try{


const data =
await fetchAnalytics();


setEngine(data);


}

catch(e){

console.log(e);

}


}







if(!engine){


return(

<>

<style>

{`

@keyframes spin{

from{
transform:rotate(0deg)
}

to{
transform:rotate(360deg)
}

}


.loader{

animation:
spin 1s linear infinite;

}

`}

</style>



<div

className="loader"

style={{

width:60,

height:60,

borderRadius:"50%",

border:"6px solid #334155",

borderTop:"6px solid #38bdf8",

margin:"100px auto"

}}

/>


</>

)


}









return(

<div>



<h1>

🚀 ContextRank Intelligence Layer

</h1>



<p style={{

color:"#94a3b8",

fontSize:18

}}>

Autonomous AI Recruiting System powered by semantic intelligence

</p>









<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(300px,1fr))",

gap:25,

marginTop:35


}}

>








<Card

icon={<Brain/>}

title="AI Recruiter Brain"

big="Gemini Agent"

status="ONLINE"

items={[

"Deep job understanding",

"Intent extraction",

"Skill inference",

"Candidate reasoning"

]}

/>










<Card

icon={<Database/>}

title="FAISS Talent Memory"

big={`${

engine.total_candidates ||

100000

}+ Profiles`}

status="INDEXED"

items={[

"Vector similarity search",

"MiniLM embeddings",

"100K candidate memory",

"Sub-second retrieval"

]}

/>









<Card

icon={<Zap/>}

title="Learning Ranker"

big="XGBoost Engine"

status="ACTIVE"

items={[

"Recruiter preference learning",

"Adaptive scoring",

"Feature based ranking",

"Continuous improvement"

]}

/>










<Card

icon={<Shield/>}

title="Talent Equity Engine"

big={`${

engine.hidden_gems ||

0

} Hidden Gems`}

status="BIAS SAFE"

items={[

"Finds overlooked talent",

"College bias reduction",

"Capability based ranking",

"Fair opportunity engine"

]}

/>







</div>











<div

style={{


marginTop:35,

background:

"linear-gradient(145deg,#111827,#020617)",


border:

"1px solid #334155",


color:"white",


padding:35,


borderRadius:22,


boxShadow:

"0 20px 45px rgba(0,0,0,.45)"


}}

>



<h2>

🏆 AI Decision Pipeline

</h2>




<div

style={{

fontSize:18,

lineHeight:2,

color:"#cbd5e1"

}}

>


📄 Job Description

<br/>

⬇

<br/>

🧠 Gemini Intent Extraction

<br/>

⬇

<br/>

🔢 MiniLM Vector Embedding

<br/>

⬇

<br/>

🗄 FAISS Similarity Search

<br/>

⬇

<br/>

⚡ CapabilityDNA + XGBoost Ranking

<br/>

⬇

<br/>

🏆 Best Talent Discovery



</div>




</div>








</div>


)

}












function Card({

icon,

title,

big,

items,

status

}){



return(

<div

style={{


background:

"linear-gradient(145deg,#111827,#020617)",


border:

"1px solid #334155",


borderRadius:22,


padding:30,


color:"white",


boxShadow:

"0 20px 45px rgba(0,0,0,.45)"


}}

>



<div

style={{


display:"flex",

justifyContent:"space-between",

alignItems:"center"


}}

>


<div

style={{


color:"#38bdf8"


}}

>

{icon}

</div>




<span

style={{


fontSize:12,

padding:"5px 12px",

borderRadius:20,


background:

"rgba(34,197,94,.15)",


color:"#22c55e",


fontWeight:900


}}

>


<CheckCircle size={12}/>

 {status}


</span>



</div>








<h2>

{title}

</h2>




<h1

style={{


color:"#38bdf8",


fontSize:30


}}

>

{big}

</h1>








<ul

style={{

paddingLeft:20,

color:"#cbd5e1",

lineHeight:1.8

}}

>


{

items.map(x=>(


<li key={x}>

{x}

</li>


))

}


</ul>





</div>


)

}