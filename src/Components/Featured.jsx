import { Link } from "react-router-dom"
 export function Featured(){
   return(
     <div className='container '>
            <h3>Featured Products</h3>
          <div className='row'>
             <div className='col-md-3 text-center'><Link to="/category/electronics" style={{textDecoration:"none"}}><div className='card  bg-danger '><img className='img-fluid'  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbpXz6wJCYnCn5QQtLE4phra7SYA1Y7K9IwWctyA-fOQ&s=10" alt=""  /><h3 style={{fontFamily:"emoji", textDecoration:"none"}}>Electronics</h3></div></Link></div>
             <div className='col-md-3 ' style={{border:"3px", }}> <Link to="/" style={{textDecoration:"none"}}> <div className='card'><img className='img-fluid' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRohipnXa3mKE-XUqVOoJAD7Fl8qNHQ-uh4xogelL3vkg&s=10" alt="" /><h3 style={{fontFamily:"emoji"}}>Accessorios</h3></div> </Link></div>
             <div className='col-md-3 text-center'><Link to="/category/electronics" style={{textDecoration:"none"}}><div className='card  '><img className='img-fluid'  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbpXz6wJCYnCn5QQtLE4phra7SYA1Y7K9IwWctyA-fOQ&s=10" alt=""  /><h3 style={{fontFamily:"emoji", textDecoration:"none"}}>Electronics</h3></div></Link> </div>
             <div className='col-md-3 text-center'><Link to="/category/electronics" style={{textDecoration:"none"}}><div className='card  '><img className='img-fluid'  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbpXz6wJCYnCn5QQtLE4phra7SYA1Y7K9IwWctyA-fOQ&s=10" alt=""  /><h3 style={{fontFamily:"emoji", textDecoration:"none"}}>Electronics</h3></div></Link></div>
          </div>
          </div>
   )
 } 
  
  
 