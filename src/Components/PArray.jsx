import { useState } from "react";
import blue from '../assets/bluthoth.png';
import blue2 from '../assets/blue2.jpg';
import blu3 from '../assets/blue3.jpg';
import blu4 from '../assets/blue-4.png'
import watch from '../assets/watch.png';
import laptop from '../assets/Lapto.png';
import lapto from '../assets/laptop2.png'
import lapto5 from '../assets/laptop.png';
import lap from '../assets/Laptomain.png';
import img1 from '../assets/vivo1.png';
import img2 from '../assets/vivo2.png';
import img3 from '../assets/vivo3.png';
import iph from '../assets/iphone.png';
import iph2 from '../assets/iphone2.png';
import iph3 from '../assets/iphone3.png';
import b from '../assets/bag.png';
import bb from '../assets/bag1.png';
import bbb from '../assets/bag4.png';
import bbbb from '../assets/bag2.png';
import n from '../assets/nike1.png';
import nn from '../assets/nike3.jpg';
import nnn from '../assets/nike4.png';
import nnnn from '../assets/n5.png';
import w from '../assets/w1.png';
import ww from '../assets/w2.png';
import www from '../assets/w3.png';
import bag from '../assets/bag.png';
import nike from '../assets/Nike.png';
import hpp from '../assets/hp.png';
import hppp from '../assets/hp2.png';
import Lenovo1 from '../assets/Leovo.png';
import infinx from '../assets/infinxhote2.png';
import infinix from '../assets/infinix21.png';
import infinx1 from '../assets/infinx.png';
export function ProdctsArray() {
    
 const [products, setproducts] = useState([]);
      //  const[products,setproducts] = useState([]);
    
      // async function getproducts() {
      //     const response = await fetch("https://6a4e043ee785c9ef536c237a.mockapi.io/shop/products");
      //     const data = await response.json();
      //     console.log("hello",data);
      // }
      // useEffect(()=>{
      //   getproducts();
      // },[]);

// async function addtocart(product){

// console.log("FUNCTION PRODUCT:", product);

// try{

// const user = auth.currentUser;

// if(!user){
//  toast.error("Please login first");
//  return;
// }

// await addCartItem(
//  user.uid,
//  product
// );


// // Firebase se latest cart lao
// const updatedCart = await getCartItems(user.uid);


// // Context update karo
// setCartItems(updatedCart);


// toast.success("Added to cart");

// }
// catch(error){
// console.log("CART ERROR:", error);
// }

// }
    return { products, setproducts};
}
