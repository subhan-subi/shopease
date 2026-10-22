// import { use, useState } from "react";
// ////export function SwitchName(){
// //const[ison,switchuser] = useState(false);
// //return(
// ///   <div>
// // <h2>{ison ? "subhan": "subhi"}</h2>

// //<button onClick={()=>switchuser(!ison)}>switch to {ison ? "subhi" : "subhan"}</button>
// //</div>
// //)
// //}

// export function SwitchName() {
//    const[count,setcount] = useState(0);
//    const[cond,setcond] = useState(false)

//    const Prodcts = [
//       {
//          id:1,
//          name:"Iphone",
//          img:"https://www.phonearena.com/iphone-17-pro-max-release-date-price-features-news",
//          title:"This is the very good phone"
//       },
//       {
//          id:2,
//          name:"Mobile",
//          img:"https://techzonegadgets254.com/wp-content/uploads/2025/07/Apple-iPhone-17-Pro-White.jpg",
//          title:"This is the very good phone"
//       },
// {
//          id:3,
//          name:"Laptop",
//          img:"https://techzonegadgets254.com/wp-content/uploads/2025/07/Apple-iPhone-17-Pro-White.jpg",
//          title:"This is the very good phone"
//       },
//       {
//          id:4,
//          name:"Laptop",
//          img:"https://techzonegadgets254.com/wp-content/uploads/2025/07/Apple-iPhone-17-Pro-White.jpg",
//          title:"This is the very good phone"
//       },
//    ]
//    // const product = [
//    //    { 
//    //       id: 1, title: "shose",
//    //       image:'react.svg'
//    //     },
     
//    //     { id: 2, title: "watch" },
//    //    { id: 3, title: "I phon 17 pro max" }, { id: 4, title: "Clothe" }, { id: 5, title: "BMW M5" }, { id: 6, title: "Laptop" }, { id: 7, title: "penadol" }
//    //    , { id: 8, title: "Face Wash" }, { id: 9, title: "perfeume" }, { id: 10, title: "Mosturizer" }, { id: 11, title: "Air condtioner" },
//    //    { id: 12, title: "Electric Oven" }, { id: 13, title: "Cat food" }, { id: 14, title: "paper sheet" }, { id: 15, title: "bag" },
//    //    { id: 16, title: "Drop shirts" }, { id: 17, title: "Mobile Cover" }, { id: 18, title: "CPU" }, { id: 19, title: "Wheel chair" }, { id: 20, title: "Fan" }];
//    // const[skills,setskills] = useState(["html"," ","css"," ", "javascript", ])
//    // const[task,settask] = useState("");
//    //const[name,setName] = useState([]);
//    //  const[age,setage] = useState("");
//    //  const[city,setcity] = useState("");
//    //  const[a,switcha] = useState(false);

//    //  function Name(e){
//    //   setName(e.target.value);
//    //  }
//    //  function Age(e){
//    //         setage(e.target.value);
//    //  }
//    //  function City(e){
//    //   setcity(e.target.value);

//    //  }

//    return (
//       <div className="container">
//          <div className="row">
//             {
//                Prodcts.map((product)=>(
//                  <div>
//                   <img src={product.img} alt="" />
//                   <p>{product.id}</p>
//                   <p>{product.name}</p>
//                   <p>{product.title}</p>
//                   </div>
//                ))
//             }
//          </div>
//       </div>
      
// //       <div className="container">
// //            <div className="row">
// //          {product.map((p,i) => (
// //             <div key={i} className="col-3 card ">
// //                {p.image}
// //                <h4>product id:{p.id}</h4>
// //                <p>Title:{p.title}</p>
// //               {cond ? (<div className="btn text-white" style={{background: "black"}}><button className="btn" onClick={()=> count>0? setcount(count-1) : setcount(0) }>-</button>
// //               <span>qty {count}</span>
// //               <button className="btn " onClick={()=>setcount(count+1)}>+</button>
// //               </div>) : 
// //               <button className="btn" onClick={()=>setcond(!cond)}>Add to cart</button>
// //               }
               
            
           
         
// //            </div>
// //          ))}

// //       </div>
// // </div>
//       // <div className="container p-5">
//       //   <form className="row">
//       //     <div>
//       //       <label>Name</label>
//       //     <input className="form-control" type="text" onChange={Name} />
//       //     </div>
//       //     <div>
//       //       <label>Age</label>
//       //     <input className="form-control" type="age" onChange={Age} />
//       //     </div>
//       //      <div>
//       //       <label>city</label>
//       //     <input className="form-control" type="city" onChange={City} />
//       //     </div>
//       //     <p style={{color: "blue"}}>Name:{name}</p>
//       //  <p>Age: {age}</p>
//       //  <p>City:{city}</p>
//       //   </form>
//       //  {name.map((name,i)=>(
//       //     <li key={i}>{name}</li>
//       //   ))}
//       // </div>
//    );
// }
