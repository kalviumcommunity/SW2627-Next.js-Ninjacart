"use client"

import {useState } from "react"

export default function Register() {
    const [name , setName] = useState("")
    const [email,setEmail] = useState ("")
    const [password,setPassword] = useState("")
    const [role,setRole] = useState("")

    return(

    <div>
        <input type="text" name="" id=""
        placeholder="Name"
        value={name}
        onChange={(e) =>setName(e.target.value)} 
        />

        <input type="email"
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}/>

        <input type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} />

       <input type="text"
       placeholder="role"
       value={role}
       onChange={(e) => setRole(e.target.value)} />

    </div>
    );

}