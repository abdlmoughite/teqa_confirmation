import { useState } from "react";
import Saidbar from "../compnent/Saidbar.jsx";

import { BrowserRouter, Route , Routes } from "react-router-dom";

import { Navigate } from "react-router-dom";

import { useEffect } from "react";
import { getCurrentUser } from "../api/auth.js";


const AppConfirmation = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [user , setUser] = useState("INACTIVE");

  useEffect(async () => {
    const res = await getCurrentUser();
    setUser(res.data);
  }, []);

  if (user.status === "INACTIVE") {
    return (<>account INACTIVE</>);
  }
  
  return (
  <BrowserRouter>
    <div className="min-h-screen bg-slate-50">
      
      {/* Sidebar */}
      <Saidbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main content */}
      <div
        className={`
          transition-all duration-300
          ${collapsed ? "md:pl-20" : "md:pl-72"}
        `}
      >
        {/* <Nav /> */}
        <main className="p-4 md:p-6">
                <Routes>
                      <Route path="*" element={<>home</>} />
                </Routes>
        </main>
      </div>
    </div>
   </BrowserRouter>

   );
};

export default AppConfirmation;
