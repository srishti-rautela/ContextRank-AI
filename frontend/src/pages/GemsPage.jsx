// src/pages/GemsPage.jsx

import { useEffect, useState } from "react"
import { fetchHiddenGems } from "../hooks/useApi.js"



export default function GemsPage(){


const [gems,setGems] =
useState([])


const [loading,setLoading] =
useState(true)





useEffect(()=>{

load()

},[])






async function load(){


try{


const data =
await fetchHiddenGems()


setGems(

data.gems ||

data.results ||

[]

)


}

catch(e){

console.log(e)

setGems([])

}

finally{

setLoading(false)

}


}








if(loading){


return(


<div

style={{

display:"flex",

alignItems:"center",

justifyContent:"center",

height:300,

color:"#e5e7eb",

fontSize:22

}}

>


<div

className="loader"

style={{

width:50,

height:50,

borderRadius:"50%",

border:"5px solid #334155",

borderTop:"5px solid #38bdf8",

marginRight:20

}}

/>


Finding hidden talent...


</div>


)


}









return(


<div>


{/* HEADER */}


<h1

style={{

color:"white",

fontSize:36

}}

>

⭐ Hidden Gems Discovery

</h1>





<p

style={{

color:"#cbd5e1",

fontSize:17

}}

>

AI finds candidates ignored by traditional ATS but with strong real ability.

</p>










{/* INFO BOX */}



<div

style={{


background:

"linear-gradient(135deg,#451a03,#111827)",


border:

"1px solid rgba(251,191,36,.35)",


padding:25,


borderRadius:18,


marginBottom:30,


color:"#fef3c7",


boxShadow:

"0 20px 40px rgba(0,0,0,.4)"

}}

>


<h2>

🏆 What is a Hidden Gem?

</h2>



<p>

Tier-3 / unknown college candidates with exceptional
skills, projects, learning velocity and AI potential.

</p>



<h2

style={{

color:"#facc15"

}}

>

Total Hidden Gems Found: {gems.length}

</h2>


</div>









{/* GEM GRID */}


<div

style={{


display:"grid",


gridTemplateColumns:

"repeat(auto-fit,minmax(320px,1fr))",


gap:25


}}

>






{


gems.map((c,i)=>(



<div


key={

c.candidate_id || i

}



style={{



background:

"linear-gradient(145deg,#111827,#020617)",



border:

"1px solid rgba(56,189,248,.25)",



borderRadius:20,


padding:25,


color:"#e5e7eb",



boxShadow:

"0 20px 45px rgba(0,0,0,.5)"



}}


>








<h2

style={{

color:"#38bdf8"

}}

>

#{i+1} 💎

</h2>









<h2

style={{

color:"white",

marginBottom:5

}}

>


{

c.name ||

c.candidate_id ||

"Hidden Talent"

}


</h2>









<p

style={{

color:"#94a3b8"

}}

>


🎓 {c.college || "Emerging College"}

<br/>


📍 {c.city || "India"}


</p>











<div>


⭐ Potential Score



<h1

style={{


color:"#22c55e",


fontSize:42,


margin:"10px 0"


}}

>


{

Math.round(

c.score ||

c.overall_match ||

c.potential_score ||

90

)

}

%


</h1>



</div>












<b

style={{

color:"#f8fafc"

}}

>

Skills

</b>







<div

style={{


display:"flex",


gap:8,


flexWrap:"wrap",


marginTop:12


}}

>




{


(c.skills || [])

.slice(0,8)

.map(s=>(



<span


key={s}


style={{


background:

"rgba(56,189,248,.15)",


border:

"1px solid rgba(56,189,248,.35)",


padding:"6px 12px",


borderRadius:20,


fontSize:12,


color:"#7dd3fc"



}}

>


{s}


</span>




))


}




</div>









<p

style={{


marginTop:20,


color:"#cbd5e1",


lineHeight:1.6


}}

>


{


c.reason ||

c.reasoning ||

"High potential talent overlooked by traditional ATS. ContextRank discovered capability signals beyond college brand."


}


</p>








</div>




))


}



</div>









{

gems.length===0 &&


<div

style={{


textAlign:"center",


padding:80,


color:"#94a3b8",


fontSize:22



}}

>


💎 No hidden gems found


</div>


}







</div>


)


}