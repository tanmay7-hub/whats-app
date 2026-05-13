import { useState } from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import './App.css'
import Login from  "./pages/login.jsx"
import Register from "./pages/register.jsx"
import Chat from "./pages/chat/chat.jsx"
function App() {
 

  return (
    <>
    <BrowserRouter>
        <Routes>
           <Route path ="/register" element ={<Register/>} />
           <Route path ="/login"    element={<Login/>} />
           <Route path = "/chat"   element = {<Chat/>}/>
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
