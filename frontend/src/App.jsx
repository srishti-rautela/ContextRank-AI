// src/App.jsx

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Database, Activity } from "lucide-react";

import RankPage from "./pages/RankPage.jsx";
import GemsPage from "./pages/GemsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";

import AIRecruiterBrain from "./components/AIRecruiterBrain";
import VectorMemory from "./components/VectorMemory";
import LearningRanker from "./components/LearningRanker";
import BiasDashboard from "./components/BiasDashboard";

import EvaluationMetrics from "./components/EvaluationMetrics";

const TABS=[
 {id:"rank",label:"🏆 Ranking"},
 {id:"gems",label:"⭐ Hidden Gems"},
 {id:"ai",label:"🚀 AI Engine"},
 {id:"compare",label:"⚖ Compare"},
 {id:"stats",label:"📊 Analytics"}
];


export default function App(){


const [tab,setTab]=useState("rank");
const [jdId,setJdId]=useState("JD001");
const [compareMode,setCompareMode]=useState(false);
const [selected,setSelected]=useState([]);


const handleCompare=(candidate)=>{

setSelected(prev=>{

const exist=prev.find(
c=>c.candidate_id===candidate.candidate_id
);

if(exist)
return prev.filter(
c=>c.candidate_id!==candidate.candidate_id
);

if(prev.length>=2)
return [prev[1],candidate];

return [...prev,candidate];

});

};



return(

<div className="app">


<style>

{`

body{
margin:0;
}

@keyframes spin {

0% {
transform: rotate(0deg);
}

100% {
transform: rotate(360deg);
}

}


.loader,
.spinner {

animation:
spin 1s linear infinite;

}
.app{

min-height:100vh;

padding:30px;

font-family:
Inter,
Segoe UI,
sans-serif;


background:
radial-gradient(circle at top left,#312e81,transparent 30%),
radial-gradient(circle at top right,#0f766e,transparent 30%),
#020617;


color:white;

}



.glass{

background:
rgba(255,255,255,.08);

border:
1px solid rgba(255,255,255,.15);

backdrop-filter:
blur(18px);

box-shadow:
0 20px 50px rgba(0,0,0,.4);

border-radius:22px;

}



.nav{

background:transparent;

border:none;

color:#94a3b8;

padding:12px 18px;

font-weight:800;

cursor:pointer;

}



.nav.active{

color:white;

border-bottom:
3px solid #38bdf8;

}



.ai-grid{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(260px,1fr));

gap:20px;

}



.status{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(220px,1fr));

gap:15px;

margin:25px 0;

}



.status-card{

padding:18px;

}



.green{

color:#22c55e;

font-weight:900;

}



button{

transition:.25s;

}



button:hover{

transform:
translateY(-3px);

}

`}

</style>




<div style={{maxWidth:1200,margin:"auto"}}>



{/* HERO */}

<motion.div

initial={{opacity:0,y:-30}}

animate={{opacity:1,y:0}}

className="glass"

style={{padding:30}}

>


<h1 style={{fontSize:42,margin:0}}>

🚀 ContextRank AI

</h1>


<h3>

Autonomous Talent Intelligence Platform

</h3>


<p style={{color:"#cbd5e1"}}>

Beyond keyword matching —
semantic AI recruiter discovering hidden talent.

</p>



<div className="status">


<div className="glass status-card">

<Brain/>

<h3>Gemini Brain</h3>

<p className="green">

ONLINE ●

</p>

</div>



<div className="glass status-card">

<Database/>

<h3>FAISS Memory</h3>

<p className="green">

1000 Profiles Indexed

</p>

</div>




<div className="glass status-card">

<Activity/>

<h3>XGBoost Learning</h3>

<p className="green">

Adaptive Ranking

</p>

</div>


</div>


</motion.div>






{/* NAVIGATION */}


<div

style={{

display:"flex",

gap:15,

margin:"25px 0",

flexWrap:"wrap"

}}

>


{

TABS.map(t=>

<button

key={t.id}

className={
tab===t.id?
"nav active":
"nav"
}

onClick={()=>setTab(t.id)}

>

{t.label}

</button>

)

}


<button

onClick={()=>{

setCompareMode(!compareMode);

setSelected([]);

}}

className="nav"

>

{
compareMode?
"✓ Compare ON":
"Enable Compare"
}

</button>


</div>







<motion.div

key={tab}

initial={{opacity:0,y:25}}

animate={{opacity:1,y:0}}

transition={{duration:.4}}

>


{tab==="rank" &&

<RankPage

jdId={jdId}

setJdId={setJdId}

compareMode={compareMode}

selected={selected}

onCompare={handleCompare}

/>

}




{tab==="gems" &&

<GemsPage

jdId={jdId}

compareMode={compareMode}

selected={selected}

onCompare={handleCompare}

/>

}



{tab==="compare" &&

<ComparePage

jdId={jdId}

selected={selected}

onClear={()=>setSelected([])}

/>

}



{tab==="stats" &&

<StatsPage/>

}




{tab==="ai" &&


<div>


<h2>

🧬 ContextRank Intelligence Layer

</h2>


<div className="ai-grid">


<AIRecruiterBrain/>


<VectorMemory/>


<LearningRanker/>


<BiasDashboard/>


<EvaluationMetrics/>


</div>



<div

className="glass"

style={{

padding:25,

marginTop:25

}}

>


<h2>

🏆 AI Decision Pipeline

</h2>


<p>

Job Description

→ Gemini Intent Extraction

→ FAISS Semantic Retrieval

→ CapabilityDNA Scoring

→ XGBoost Feedback Learning

→ Ranked Talent

</p>


</div>


</div>


}


</motion.div>






<footer

style={{

textAlign:"center",

marginTop:40,

color:"#94a3b8"

}}

>

Built for Data & AI Challenge 🏆 |
ContextRank AI Recruiting Engine 🇮🇳


</footer>




</div>


</div>

)

}