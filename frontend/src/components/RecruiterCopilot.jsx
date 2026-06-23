// src/components/RecruiterCopilot.jsx

import { useState } from "react"

import {
    Badge,
    Spinner
} from "./ui.jsx"



const API =
"http://127.0.0.1:8000/api"





export default function RecruiterCopilot({

jdId,
candidates=[]

}){


const [selectedId,setSelectedId] =
useState("")


const [messages,setMessages] =
useState([])


const [loading,setLoading] =
useState(false)


const [open,setOpen] =
useState(false)






async function ask(){


if(!selectedId)
return



const candidate =
candidates.find(
c=>c.candidate_id===selectedId
)




setMessages(prev=>[

...prev,

{
role:"user",
text:
`Why is ${candidate?.name || selectedId} ranked where they are?`
}

])



setLoading(true)



try{


const res =
await fetch(

`${API}/copilot/ask`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

jd_id:jdId,

candidate_id:selectedId

})

}

)




if(!res.ok)

throw new Error("API failed")




const data =
await res.json()




setMessages(prev=>[

...prev,

{

role:"copilot",

data

}

])



}

catch(e){


setMessages(prev=>[

...prev,

{

role:"copilot",

error:
"Could not reach the AI recruiter engine."

}

])


}

finally{

setLoading(false)

}



}









return(


<div

style={{


background:

"linear-gradient(145deg,#111827,#020617)",


border:

"1px solid #334155",


borderRadius:18,


marginBottom:20,


overflow:"hidden",


color:"white",


boxShadow:

"0 20px 40px rgba(0,0,0,.45)"


}}


>





{/* HEADER */}


<div

onClick={()=>setOpen(!open)}


style={{


display:"flex",

justifyContent:"space-between",

alignItems:"center",


padding:18,


cursor:"pointer"


}}

>



<div>


<h3

style={{

margin:0,

color:"white"

}}

>

💬 Ask the recruiter copilot

</h3>




<p

style={{

fontSize:13,

color:"#94a3b8"

}}

>


"Why is this candidate ranked here?"
— answered from real scores, not guesses.


</p>


</div>




<span>

{open?"▲":"▼"}

</span>



</div>









{

open &&


<div

style={{

padding:18

}}

>






<div

style={{

display:"flex",

gap:10

}}

>




<select


value={selectedId}


onChange={e=>setSelectedId(e.target.value)}



style={{


flex:1,


padding:12,


borderRadius:10,


background:"#020617",


color:"white",


border:"1px solid #334155"



}}

>


<option value="">

Select a candidate to ask about...

</option>




{

candidates.map(c=>(



<option

key={c.candidate_id}

value={c.candidate_id}

>


#{c.rank} {c.name}
 ({c.overall_match}%)


</option>



))

}



</select>







<button


onClick={ask}


disabled={loading || !selectedId}


style={{


padding:"10px 22px",


borderRadius:10,


border:"none",


background:"#6366f1",


color:"white",


fontWeight:900,


cursor:"pointer"


}}

>

Ask

</button>




</div>








<div

style={{


display:"flex",

flexDirection:"column",

gap:14,


marginTop:20


}}

>



{


messages.map((m,i)=>(


<ChatBubble

key={i}

message={m}

/>


))


}




{

loading &&


<div

style={{

textAlign:"center"

}}

>

<Spinner size={22}/>

</div>


}




</div>




</div>


}




</div>


)


}














function ChatBubble({

message

}){






// USER MESSAGE

if(message.role==="user"){


return(


<div

style={{


alignSelf:"flex-end",


background:"#6366f1",


padding:"12px 18px",


borderRadius:

"16px 16px 0 16px",


color:"white",


maxWidth:"80%"


}}

>

{message.text}

</div>


)

}






// ERROR


if(message.error){


return(

<div

style={{


background:"#450a0a",

color:"#fecaca",

padding:15,

borderRadius:14

}}

>

{message.error}

</div>

)

}






const d =
message.data || {}





return(



<div


style={{



background:

"linear-gradient(135deg,#082f49,#0f172a)",



border:

"1px solid rgba(56,189,248,.35)",



padding:18,


borderRadius:18,


color:"#e0f2fe",


lineHeight:1.7,


maxWidth:"90%"



}}


>






<p

style={{


color:"#f8fafc",


margin:0,


whiteSpace:"pre-line"



}}

>


{

d.answer ||

"Candidate ranked using ContextRank AI semantic scoring."

}


</p>








{

d.is_hidden_gem &&


<div style={{marginTop:10}}>


<Badge variant="gem">

⭐ Hidden Gem

</Badge>


</div>

}









{

d.growth_plan &&

d.growth_plan.length>0 &&



<div style={{marginTop:15}}>



<h4

style={{


color:"#38bdf8",


marginBottom:8


}}

>


🚀 GROWTH PLAN


</h4>






{


d.growth_plan.map((g,i)=>(



<p


key={i}


style={{


color:"#e0f2fe",


margin:"5px 0"



}}

>


• {g}


</p>



))


}




</div>


}




</div>



)



}