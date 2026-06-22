import {useEffect,useState} from "react";
import {motion} from "framer-motion";
import {Scale, Users} from "lucide-react";


export default function BiasDashboard(){


const [data,setData]=useState(null);


useEffect(()=>{

fetch("/api/bias-report")
.then(res=>res.json())
.then(setData)

},[]);



if(!data)

return (

<div className="glass" style={{padding:25}}>

Loading Bias Intelligence...

</div>

);



return(


<motion.div

initial={{opacity:0,y:30}}

animate={{opacity:1,y:0}}

className="glass"

style={{padding:25}}

>


<h2>
<Scale/> Talent Equity Intelligence 🇮🇳
</h2>



<p style={{color:"#94a3b8"}}>

Detecting hidden talent beyond college and brand bias

</p>



<h3>

Traditional ATS

</h3>


<p>

College Bias Risk

</p>



<div style={bar}>

<div

style={{

...fill,

width:

data.traditional_ats.tier1_advantage+"%"

}}

/>

</div>



<h1 style={{color:"#ef4444"}}>

{data.traditional_ats.tier1_advantage}%

</h1>





<h3>

ContextRank AI

</h3>



<div

style={{

display:"flex",

gap:20

}}

>


<div>

<Users/>

<h2 style={{color:"#22c55e"}}>

{
data.contextrank_ai.hidden_gems_found
}+

</h2>


<p>

Hidden Gems Found

</p>

</div>




<div>

<h2 style={{color:"#38bdf8"}}>

{
data.contextrank_ai.fairness_score
}%

</h2>


<p>

Fairness Score

</p>

</div>


</div>



<h3 style={{color:"#22c55e"}}>

+{

data.contextrank_ai.tier2_tier3_recovery

}% Opportunity Recovery

</h3>



</motion.div>

)

}



const bar={

height:10,

background:"#334155",

borderRadius:20

}



const fill={

height:"100%",

background:

"linear-gradient(90deg,#ef4444,#f97316)",

borderRadius:20

}