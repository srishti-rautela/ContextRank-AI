import { motion } from "framer-motion";
import { Database, Search } from "lucide-react";


export default function VectorMemory(){


return(

<motion.div

initial={{opacity:0,y:30}}

animate={{opacity:1,y:0}}

className="glass"

style={{padding:25}}

>


<h2>
<Database/> FAISS Talent Memory
</h2>


<p style={{color:"#94a3b8"}}>
Semantic vector search engine
</p>



<h1 style={{color:"#38bdf8"}}>
1000+
</h1>


<p>
Candidate Profiles Indexed
</p>



<div>

<Search/>

<p>
Understands meaning, not keywords
</p>


</div>



<ul>

<li>🚀 Millisecond Retrieval</li>

<li>🧠 Embedding Similarity</li>

<li>🎯 Context Matching</li>

</ul>



<h3 style={{color:"#22c55e"}}>

● VECTOR DB ACTIVE

</h3>



</motion.div>


)

}