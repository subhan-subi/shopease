import { Sidebar2 } from "./Sidebar2";
import { Outlet } from "react-router-dom";
import { Slider } from "./slider";
import { useContext, useState } from "react";
import { Sidebar } from "./sidebar";
import { Addtocart } from "./Usercontext";
import { Header } from "./header";
import { Footer } from "./Footer";
export function Layout({ children }) {
    const { side, setside, darkmode } = useContext(Addtocart);
    return (
        <div className="container-fluid">
            <Header />
            <div className="row">
                {side && (
                    <div
                        className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
                        style={{ zIndex: 1040 }}
                        onClick={() => setside(false)}
                    />
                )}
                <div className={`sidebar ${side ? 'col-lg-2 show col-12  n' : 'col-lg-1 d-none d-lg-block  n'}`} 
                style={{
                    boxShadow: "4px 0 15px rgba(0,0,0,0.2)",
                    background: darkmode ? "#000000" : "#ffffff",
                    color: darkmode ? "white" : "black",
                    width: side ? "220px" : "50px",
                    transition: "all 0.8s ease",

                }}>
                    <Sidebar />
                </div>
                <div className="col" style={{ transition: "all 0.8s ease", paddingLeft: "20px", paddingTop: "80px", color: darkmode ? "white" : "" 
                      , width: side ? "960px" : "50px",
                }}>
                    {children}
                </div>
               
            </div>
           
        </div>
    )
}