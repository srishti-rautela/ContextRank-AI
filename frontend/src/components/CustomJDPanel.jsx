import { useState } from "react"
import { rankCandidates } from "../hooks/useApi.js"
import { Spinner } from "./ui.jsx"


const EXAMPLES = [

  "Need AI Engineer with Python, LLM, RAG, vector databases, LangChain and production ML systems.",

  "Looking for Backend Engineer experienced with FastAPI, distributed systems, SQL, cloud and APIs.",

  "Need Data Scientist skilled in machine learning, NLP, deep learning and analytics."

]



export default function CustomJDPanel(
{
onResults
}
){


const [text,setText] = useState("")

const [loading,setLoading] = useState(false)

const [error,setError] = useState(null)

const [open,setOpen] = useState(false)




const run = async()=>{


if(text.trim().length < 15){

setError(
"Enter a complete job description"
)

return

}


try{


setLoading(true)

setError(null)



console.log(
"Custom JD:",
text
)



const data =
await rankCandidates(
text,
100
)



console.log(
"Custom JD RESPONSE:",
data
)



onResults(data)



}

catch(e){


console.error(e)


setError(
"Could not reach ContextRank API"
)


}

finally{

setLoading(false)

}


}






return(


<div

style={{

background:
"linear-gradient(135deg,#F5F3FF,#EFF6FF)",

border:
"1.5px solid #C7D2FE",

borderRadius:14,

padding:"16px 18px",

marginBottom:16

}}

>



<div

onClick={()=>setOpen(!open)}

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center",

cursor:"pointer"

}}

>



<div>


<div

style={{

fontSize:14,

fontWeight:700,

color:"#3730A3"

}}

>

🧠 Live AI Recruiter

</div>



<div

style={{

fontSize:12,

color:"#4338CA",

marginTop:3

}}

>

Paste any JD — ContextRank searches 100K candidates using semantic AI

</div>



</div>




<span>

{open ? "▲":"▼"}

</span>


</div>







{

open &&


<div style={{marginTop:14}}>



<textarea


value={text}


onChange={

e=>setText(e.target.value)

}


placeholder=

"Example: Need AI engineer experienced with LLM systems, embeddings and scalable deployment..."


rows={4}


style={{


width:"100%",

padding:12,

borderRadius:10,

border:"1px solid #C7D2FE",

fontSize:13,

resize:"vertical",

boxSizing:"border-box"

}}


/>






<div

style={{

display:"flex",

gap:8,

flexWrap:"wrap",

marginTop:10

}}

>


{

EXAMPLES.map(

(ex,i)=>(


<button


key={i}


onClick={()=>setText(ex)}



style={{


padding:"5px 10px",

borderRadius:20,

border:"1px solid #C7D2FE",

background:"#fff",

cursor:"pointer",

fontSize:12

}}


>


Example {i+1}


</button>


)

)


}


</div>








<button


onClick={run}


disabled={loading}


style={{


marginTop:12,

padding:"10px 18px",

borderRadius:10,

border:"none",

background:"#6366F1",

color:"#fff",

fontWeight:700,

cursor:"pointer",

display:"flex",

gap:8,

alignItems:"center"


}}


>


{

loading && <Spinner size={14}/>

}


{


loading

?

"Analyzing 100K candidates..."

:

"🚀 Rank Candidates"


}


</button>








{

error &&


<div

style={{

marginTop:10,

fontSize:12,

color:"#991B1B"

}}

>

{error}

</div>


}



</div>


}




</div>

)

}