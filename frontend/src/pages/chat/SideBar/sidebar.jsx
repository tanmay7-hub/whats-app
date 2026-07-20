import "./chat.css";
import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function sidebar(){
     const [search, setsearch] = useState("");


    const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
    );
    return  (
        <>

          
        </>
    )
}