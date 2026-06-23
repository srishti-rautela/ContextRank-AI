import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  Brain,
  Database,
  Activity
} from "lucide-react";


import RankPage from "./pages/RankPage.jsx";
import GemsPage from "./pages/GemsPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import AIEnginePage from "./pages/AIEnginePage.jsx";
import ComparePage from "./pages/ComparePage.jsx";

import ChallengeRanker from "./components/ChallengeRanker.jsx";

import { fetchAnalytics } from "./hooks/useApi.js";





const TABS=[

{
id:"rank",
label:"🏆 Ranking"
},

{
id:"gems",
label:"⭐ Hidden Gems"
},

{
id:"ai",
label:"🚀 AI Engine"
},

{
id:"compare",
label:"⚖ Compare"
},

{
id:"stats",
label:"📊 Analytics"
},

{
id:"challenge",
label:"🏆 Challenge AI"
}

];








export default function App(){


const [tab,setTab]=useState("rank");


const [jdId,setJdId]=useState(
"Need AI Engineer with Python LLM recommendation systems"
);



const [compareMode,setCompareMode]=useState(false);


const [selected,setSelected]=useState([]);



const [stats,setStats]=useState({

total_candidates:100000,

hidden_gems:0,

engine:"loading"

});







useEffect(()=>{


loadDashboard();


},[]);





async function loadDashboard(){


try{


const res =
await fetchAnalytics();


setStats(res);



}catch(err){


console.log(
"analytics offline",
err
);


}


}








function handleCompare(candidate){



setSelected(prev=>{


const exist =
prev.find(
x=>x.candidate_id===candidate.candidate_id
);



if(exist)

return prev.filter(
x=>x.candidate_id!==candidate.candidate_id
);




if(prev.length>=2)

return [
prev[1],
candidate
];



return [
...prev,
candidate
];



});


}











return(


<div className="app">



<style>

{`



*{

box-sizing:border-box;

}



body{

margin:0;

background:#020617;

color:white;

font-family:
Inter,
Segoe UI,
sans-serif;

}




/* =========================
   LOADING FIX
========================= */



@keyframes spin{

from{

transform:
rotate(0deg);

}

to{

transform:
rotate(360deg);

}

}




.spinner,
.loader,
.loading-circle{

animation:

spin .8s linear infinite;


}







/* =========================
   GLOBAL DARK PATCH
========================= */



div{

scrollbar-color:
#334155 transparent;

}



.card,
.metric-card,
.panel,
.glass-card{


background:

rgba(15,23,42,.92)!important;


color:white!important;


border:

1px solid rgba(255,255,255,.12)!important;


box-shadow:

0 20px 40px rgba(0,0,0,.45);


}





.card *,
.metric-card *,
.panel *,
.glass-card *{


color:inherit;


}





.recharts-wrapper text{


fill:#cbd5e1!important;


}







.app{


min-height:100vh;


padding:30px;


background:

radial-gradient(circle at top left,#312e81,transparent 35%),

radial-gradient(circle at top right,#0f766e,transparent 35%),

#020617;


}







.glass{


background:

rgba(15,23,42,.65);


border:

1px solid rgba(255,255,255,.15);


backdrop-filter:

blur(20px);


border-radius:24px;


box-shadow:

0 25px 60px rgba(0,0,0,.45);


}









.nav{


background:

transparent;


border:none;


padding:

12px 18px;


color:#94a3b8;


font-size:15px;


font-weight:900;


cursor:pointer;


}



.nav.active{


color:white;


border-bottom:

3px solid #38bdf8;


}



.nav:hover{


color:#38bdf8;


}








.status{


display:grid;


grid-template-columns:

repeat(auto-fit,minmax(250px,1fr));


gap:20px;


margin-top:30px;


}





.status-card{


padding:25px;


}





.green{


color:#22c55e!important;


font-weight:900;


}





.blue{


color:#38bdf8!important;


}





button{

transition:.25s;

}



button:hover{


transform:

translateY(-3px);


}






@media(max-width:700px){


.app{

padding:15px;

}



h1{

font-size:30px!important;

}


}




`}

</style>









<div

style={{

maxWidth:1350,

margin:"auto"

}}

>









{/* ================= HERO ================= */}




<motion.div


initial={{

opacity:0,

y:-30

}}


animate={{

opacity:1,

y:0

}}



className="glass"


style={{


padding:35


}}


>






<h1

style={{

fontSize:46,

margin:0

}}

>

🚀 ContextRank AI

</h1>






<h2>

Autonomous Talent Intelligence Platform

</h2>





<p

style={{

fontSize:18,

color:"#cbd5e1"

}}

>

Beyond keyword matching —
semantic AI recruiter discovering hidden talent.

</p>









<div className="status">






<div className="glass status-card">


<Brain size={35}/>


<h2>

Gemini Brain

</h2>



<p className="green">

ONLINE ●

</p>



</div>










<div className="glass status-card">


<Database size={35}/>


<h2>

FAISS Talent Memory

</h2>



<h1 className="blue">


{

stats.total_candidates?.toLocaleString()

}

+

</h1>



<p>

Candidate Profiles Indexed

</p>


</div>









<div className="glass status-card">


<Activity size={35}/>


<h2>

XGBoost Learning

</h2>



<p className="green">

Adaptive Ranking

</p>



</div>








</div>





</motion.div>












{/* NAV */}





<div

style={{


display:"flex",

gap:18,

margin:"30px 0",

flexWrap:"wrap"


}}

>





{

TABS.map(t=>(


<button


key={t.id}


className={

tab===t.id

?

"nav active"

:

"nav"

}


onClick={()=>setTab(t.id)}


>


{t.label}


</button>



))

}







<button


className="nav"


onClick={()=>{


setCompareMode(!compareMode);

setSelected([]);


}}

>


{

compareMode

?

"✓ Compare ON"

:

"Enable Compare"

}


</button>





</div>










{/* PAGE AREA */}





<motion.div


key={tab}


initial={{

opacity:0,

y:20

}}


animate={{

opacity:1,

y:0

}}


transition={{duration:.3}}

>






{

tab==="rank" &&


<RankPage


jdId={jdId}


setJdId={setJdId}


compareMode={compareMode}


selected={selected}


onCompare={handleCompare}


/>


}








{

tab==="gems" &&


<GemsPage


jdId={jdId}


compareMode={compareMode}


selected={selected}


onCompare={handleCompare}


/>


}









{

tab==="ai" &&


<AIEnginePage/>


}







{

tab==="compare" &&


<ComparePage


selected={selected}


onClear={()=>setSelected([])}


/>


}









{

tab==="stats" &&


<StatsPage/>


}









{

tab==="challenge" &&


<ChallengeRanker/>


}








</motion.div>











<footer

style={{

textAlign:"center",

marginTop:50,

color:"#94a3b8"

}}

>


Built for Data & AI Challenge by India.Runs with Redrob AI 🏆 |
ContextRank AI Recruiting Engine 🇮🇳


</footer>









</div>



</div>


)

}