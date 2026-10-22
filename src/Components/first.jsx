import { useState,useEffect } from "react"
export function Myapp(){
   const[name, setname] = useState("");
   useEffect(()=>{
    const savename= localStorage.getItem("name");
    if(savename)
      setname(savename);
  },[])
  useEffect(()=>{
     localStorage.setItem("name", name);
  },[name]);
  return(
    <div>
     <input type="text" onChange={(e)=>setname(e.target.value)} />
      <p>{name}</p>
     </div>

  )
}