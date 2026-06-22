import {useEffect,useState} from "react";
import {motion} from "framer-motion";
import {Gauge} from "lucide-react";


export default function EvaluationMetrics(){


const [data,setData]=useState(null);


useEffect(()=>{


fetch("/api/evaluation")

.then(res=>res.json())

.then(setData)


},[]);




if(!data)

return (

<div className="glass" style={{padding:25}}>

Loading Metrics...

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

<Gauge/> AI Evaluation Metrics

</h2>



<div>


<h1 style={{color:"#38bdf8"}}>

{data.dataset_size}+

</h1>

Candidates Tested


</div>





<h3>

Ranking Quality

</h3>



<p>

Precision@10

</p>


<h2 style={{color:"#22c55e"}}>

{

(data.precision_at_10*100)

}%

</h2>




<p>

NDCG@10

</p>


<h2 style={{color:"#22c55e"}}>

{

(data.ndcg_at_10*100)

}%

</h2>




<hr/>




<p>

⚡ Latency:

{

data.ranking_latency

}

</p>



<p>

🟢 {

data.api_health

}

</p>



</motion.div>

)

}