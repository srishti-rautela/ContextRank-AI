import {useState} from "react";
import {motion} from "framer-motion";
import {Activity} from "lucide-react";


export default function LearningRanker(){


const [count,setCount]=useState(0);



async function train(){


const res=await fetch(

"/api/feedback",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

candidate_id:101,

skill_score:95,

project_score:90,

experience_score:85,

selected:1

})

}

);



const data=await res.json();


setCount(

data.training_samples

);


}




return(

<motion.div

initial={{opacity:0,y:30}}

animate={{opacity:1,y:0}}

className="glass"

style={{padding:25}}

>



<h2>
<Activity/> Learning Ranker
</h2>



<p style={{color:"#94a3b8"}}>

Learns recruiter hiring decisions

</p>




<h1 style={{color:"#22c55e"}}>

XGBoost

</h1>




<button

onClick={train}

style={btn}

>

Train AI

</button>



<h3>

Training Samples:

{" "}

<span style={{color:"#38bdf8"}}>

{count}

</span>

</h3>



<ul>

<li>✔ Learns selections</li>

<li>✔ Improves ranking</li>

<li>✔ Adapts recruiter preference</li>

</ul>




</motion.div>

)


}



const btn={

padding:"12px 18px",

borderRadius:14,

border:"none",

fontWeight:900,

cursor:"pointer",

color:"white",

background:
"linear-gradient(135deg,#22c55e,#14b8a6)"

}