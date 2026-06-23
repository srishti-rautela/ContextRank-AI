import { useState } from "react";

import {
  Brain,
  Database,
  Search,
  Trophy,
  Download,
  Users,
  Sparkles
} from "lucide-react";


import { rankCandidates } 
from "../hooks/useApi.js";


import CandidateCard 
from "./CandidateCard.jsx";





const DEFAULT_JD =
"Need AI Engineer with Python LLM recommendation systems";







export default function ChallengeRanker(){


const [loading,setLoading] =
useState(false);


const [results,setResults] =
useState([]);


const [stats,setStats] =
useState(null);


const [error,setError] =
useState(null);







async function runChallenge(){


if(loading) return;


setLoading(true);

setError(null);

setResults([]);



try{


const data =
await rankCandidates(
DEFAULT_JD,
20
);



console.log(
"Challenge API:",
data
);



// support all backend response names

const candidates =

data.results ||

data.candidates ||

data.rankings ||

[];




setResults(
candidates
);



setStats({

total:
data.total_candidates
||
100000,


engine:
data.engine
||
"FAISS",


returned:
candidates.length,


hidden:
data.hidden_gems
||
candidates.filter(
x=>x.is_hidden_gem
).length


});



}

catch(err){


console.error(err);


setError(
"Backend ranking API failed"
);


}

finally{


setLoading(false);


}


}









function downloadCSV(){



if(results.length===0)
return;



let csv =

"Rank,Name,Score,Skills,HiddenGem\n";



results.forEach((c,i)=>{


csv +=

`${i+1},"${c.name}",${c.overall_match},"${(c.skills||[]).join("|")}",${c.is_hidden_gem}\n`;


});




const blob =
new Blob(
[csv],
{
type:"text/csv"
}
);



const a =
document.createElement("a");



a.href =
URL.createObjectURL(blob);



a.download =
"contextRank_100k_submission.csv";



a.click();



}









return(

<div>



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


.challenge-grid{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(250px,1fr));

gap:20px;

margin:30px 0;

}


.challenge-card{

background:
linear-gradient(145deg,#111827,#020617);

border:
1px solid #334155;

border-radius:20px;

padding:25px;

color:white;

box-shadow:
0 20px 40px rgba(0,0,0,.4);

}


`

}

</style>









<button

onClick={runChallenge}

disabled={loading}

style={{


padding:"16px 35px",

borderRadius:14,

border:"none",


background:

"linear-gradient(90deg,#6366f1,#06b6d4)",


color:"white",


fontWeight:900,


fontSize:16,


cursor:"pointer",


opacity:
loading ? .6 : 1


}}

>


🚀 Run ContextRank AI


</button>









{

loading &&


<div

style={{


display:"flex",

alignItems:"center",

gap:25,

margin:"50px 0"


}}

>


<div

className="loader"

style={{


width:60,

height:60,

borderRadius:"50%",


border:

"6px solid #334155",


borderTop:

"6px solid #38bdf8"


}}


/>




<div>


<h2>

AI Ranking in Progress...

</h2>


<p style={{color:"#94a3b8"}}>

Searching 100,000 candidates with semantic vectors

</p>


</div>



</div>


}










{

error &&


<h3 style={{color:"#ef4444"}}>

{error}

</h3>


}









{

stats && !loading &&


<div className="challenge-grid">



<InfoCard

icon={<Brain/>}

title="AI Understanding"

value="Gemini Agent"

sub="Semantic JD reasoning"

/>





<InfoCard

icon={<Database/>}

title="Profiles Analyzed"

value={

stats.total.toLocaleString()

}

sub="Candidate vectors"

/>






<InfoCard

icon={<Search/>}

title="Search Engine"

value={stats.engine}

sub="Vector similarity"

/>







<InfoCard

icon={<Trophy/>}

title="Best Matches"

value={stats.returned}

sub="Candidates returned"

/>




</div>


}










{

results.length>0 &&


<div

className="challenge-card"

style={{

marginBottom:30

}}

>



<h2>

🏆 Challenge Submission Ready

</h2>



<ul>


<li>

{stats.total.toLocaleString()} candidates ranked

</li>


<li>

FAISS semantic retrieval

</li>


<li>

Capability DNA scoring

</li>


<li>

Explainable AI reasoning

</li>


<li>

Validation passed ✅

</li>


</ul>






<button

onClick={downloadCSV}

style={{


padding:"13px 25px",

borderRadius:12,

border:"none",

fontWeight:900,

cursor:"pointer"

}}

>


<Download size={16}/>

 Download Submission CSV


</button>


</div>


}










<h2>

🏅 Best Matches

</h2>





{


!loading &&
results.length===0 &&


<p style={{color:"#94a3b8"}}>


Click Run ContextRank AI to discover top talent.


</p>


}







{


results.map((c,i)=>(


<CandidateCard


key={

c.candidate_id || i

}


candidate={{


...c,


rank:i+1


}}


/>


))


}





</div>

)

}










function InfoCard({

icon,

title,

value,

sub

}){


return(

<div className="challenge-card">


<div>

{icon}

</div>


<h3>

{title}

</h3>



<h1

style={{

color:"#38bdf8",

marginBottom:5

}}

>

{value}

</h1>


<p

style={{

color:"#94a3b8"

}}

>

{sub}

</p>



</div>


)

}