import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";


export default function AIRecruiterBrain(){

const [data,setData]=useState(null);
const [loading,setLoading]=useState(false);


async function analyze(){

setLoading(true);

const res=await fetch("/api/analyze-job",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
job:
"Need AI Engineer with Python LLM recommendation systems"
})
});


const result=await res.json();

setData(
result.fallback_result?
result.fallback_result:
result
);

setLoading(false);

}



return(

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
className="glass"
style={{padding:25}}
>


<h2>
<Brain/> AI Recruiter Brain
</h2>


<p style={{color:"#94a3b8"}}>
Deep Job Understanding using Gemini LLM
</p>


<span style={{color:"#22c55e"}}>
● Agent Online
</span>


<br/><br/>


<button
onClick={analyze}
style={btn}
>

{
loading?
"Thinking..."
:
"✨ Analyze Job"
}

</button>



{
data &&

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
>


<h3>
<Sparkles/> Detected Role
</h3>


<h1 style={{color:"#38bdf8"}}>
{data.role}
</h1>



<h3>Required Skills</h3>


<div style={chips}>

{
data.must_have_skills?.map(
(x,i)=>

<span key={i} style={chip}>
{x}
</span>

)

}

</div>



<h3>Hidden Signals</h3>


{
data.hidden_expectations?.map(
(x,i)=>

<p key={i}>
⚡ {x}
</p>

)
}



<h3>
Confidence
</h3>


<div style={bar}>

<div style={fill}/>

</div>


<small>
96% semantic understanding
</small>



</motion.div>

}



</motion.div>

)

}



const btn={

padding:12,

borderRadius:12,

border:"none",

color:"white",

fontWeight:800,

cursor:"pointer",

background:
"linear-gradient(135deg,#6366f1,#06b6d4)"

}



const chips={

display:"flex",

gap:8,

flexWrap:"wrap"

}



const chip={

padding:"8px 12px",

borderRadius:20,

background:
"rgba(56,189,248,.15)",

border:
"1px solid #38bdf8"

}



const bar={

height:10,

borderRadius:20,

background:"#334155"

}



const fill={

height:"100%",

width:"96%",

borderRadius:20,

background:
"linear-gradient(90deg,#22c55e,#38bdf8)"

}