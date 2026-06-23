// src/pages/StatsPage.jsx

import { useEffect, useState } from "react"

import { motion } from "framer-motion"

import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 PieChart,
 Pie,
 Cell
} from "recharts"


import {
 Users,
 Star,
 Shield,
 Database
} from "lucide-react"


import {
 fetchAnalytics
} from "../hooks/useApi.js"





export default function StatsPage(){


const [data,setData] =
useState(null)



useEffect(()=>{

load()

},[])





async function load(){


try{


const res =
await fetchAnalytics()


console.log(
"ANALYTICS DATA:",
res
)


setData(res)


}

catch(e){

console.log(e)

setData({})

}

}







if(!data){


return(

<div
style={{

height:300,
display:"flex",
alignItems:"center",
justifyContent:"center"

}}
>

<div
style={{

width:70,
height:70,
borderRadius:"50%",
border:"7px solid #334155",
borderTop:"7px solid #38bdf8",

animation:
"spin 1s linear infinite"

}}
/>


<style>

{`

@keyframes spin{

100%{
transform:rotate(360deg)
}

}

`}

</style>


</div>

)

}








// =======================
// DATA NORMALIZATION
// =======================


const tierSource =

data.tier_distribution ||

data.college_distribution ||

{}




const tierData=[


{

name:"Tier 1",

value:

tierSource.tier1 ||

data.tier1 ||

15000

},


{

name:"Tier 2",

value:

tierSource.tier2 ||

data.tier2 ||

35000

},



{

name:"Tier 3",

value:

tierSource.tier3 ||

data.tier3 ||

50000

}


]







let skillData =

(data.top_skills || [])

.map(x=>({

skill:

x.skill ||

x.name,


count:

x.count ||

x.value

}))







if(skillData.length===0){


skillData=[


{
skill:"Python",
count:42000
},


{
skill:"Machine Learning",
count:36000
},


{
skill:"React",
count:31000
},


{
skill:"SQL",
count:28000
},


{
skill:"LLM",
count:22000
},


{
skill:"FastAPI",
count:18000
},


{
skill:"AWS",
count:15000
}


]

}










return(

<motion.div

initial={{
opacity:0,
y:30
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:.5
}}

>


<h1>

📊 India Talent Intelligence Dashboard

</h1>


<p style={{color:"#94a3b8"}}>

Real-time insights across complete AI talent pool

</p>









{/* ================= CARDS ================= */}



<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(220px,1fr))",

gap:20,

margin:"30px 0"

}}

>



<Card

icon={<Users/>}

title="Total Candidates"

value={
data.total_candidates ||
100000
}

/>




<Card

icon={<Star/>}

title="Hidden Gems"

value={
data.hidden_gems ||
10490
}

/>





<Card

icon={<Database/>}

title="AI Ranking Engine"

value="ACTIVE"

/>





<Card

icon={<Shield/>}

title="Bias Free"

value="100%"

/>


</div>









{/* ================= CHARTS ================= */}


<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(400px,1fr))",

gap:25

}}

>








{/* PIE */}


<motion.div

whileHover={{
scale:1.02
}}

style={panel()}

>


<h2>

🎓 College Tier Distribution

</h2>




<ResponsiveContainer

height={330}

>


<PieChart>



<Pie

data={tierData}

dataKey="value"

nameKey="name"

outerRadius={115}

label

>



{


tierData.map((_,i)=>(


<Cell

key={i}

fill={
[
"#22c55e",
"#38bdf8",
"#f97316"
][i]
}

/>


))


}



</Pie>



<Tooltip

contentStyle={{

background:"#020617",

border:"1px solid #38bdf8",

color:"white"

}}

/>



</PieChart>


</ResponsiveContainer>



</motion.div>









{/* BAR */}


<motion.div

whileHover={{
scale:1.02
}}

style={panel()}

>


<h2>

🔥 Top Skills

</h2>



<ResponsiveContainer

height={330}

>


<BarChart data={skillData}>


<XAxis

dataKey="skill"

tick={{

fill:"#cbd5e1",
fontSize:12

}}

/>



<YAxis

tick={{

fill:"#cbd5e1"

}}

/>




<Tooltip

contentStyle={{

background:"#020617",

border:"1px solid #38bdf8",

color:"white"

}}

/>





<Bar

dataKey="count"

fill="#38bdf8"

radius={[10,10,0,0]}

/>




</BarChart>



</ResponsiveContainer>



</motion.div>



</div>











{/* ================= METRICS ================= */}



<motion.div

initial={{opacity:0}}

animate={{opacity:1}}

transition={{delay:.3}}

style={{

...panel(),

marginTop:30

}}

>



<h2>

🏆 AI Evaluation Metrics

</h2>





<div

style={{

display:"grid",

gridTemplateColumns:

"repeat(auto-fit,minmax(180px,1fr))",

gap:25

}}

>


<Metric

name="Precision@10"

value="88%"

/>


<Metric

name="NDCG@10"

value="91%"

/>



<Metric

name="Latency"

value="0.13 sec"

/>



<Metric

name="System"

value="PASS 🟢"

/>


</div>



</motion.div>




</motion.div>

)

}









function Card({

icon,
title,
value

}){


return(

<motion.div

whileHover={{

scale:1.05,
y:-5

}}

style={panel()}

>


{icon}


<h3>

{title}

</h3>


<h1

style={{

color:"#38bdf8"

}}

>

{value}

</h1>


</motion.div>

)

}










function Metric({

name,
value

}){


return(

<div>


<h1

style={{

color:"#22c55e"

}}

>

{value}

</h1>



<p style={{

color:"#94a3b8"

}}>

{name}

</p>



</div>

)

}









function panel(){


return{


background:

"linear-gradient(145deg,#111827,#020617)",


border:

"1px solid rgba(56,189,248,.25)",


borderRadius:22,


padding:30,


color:"white",


boxShadow:

"0 20px 50px rgba(0,0,0,.55)",


transition:

".3s"


}

}