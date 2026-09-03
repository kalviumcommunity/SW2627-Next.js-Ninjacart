"use client"

import {useState } from "react"
import { registerUser } from "../../../lib/api"

export default function Register() {
    const [name , setName] = useState("")
    const [email,setEmail] = useState ("")
    const [password,setPassword] = useState("")
    const [role,setRole] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage("")

        if (!name.trim() || !email.trim() || !password || !role.trim()) {
            setMessage("Name, email, password, and role are required.")
            return
        }

        setIsSubmitting(true)
        try {
            await registerUser({ name, email, password, role })
            setMessage("Registration successful. You can now log in.")
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to register.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return(

    <form onSubmit={handleSubmit}>
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

         <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
         </button>
         {message && <p role="alert">{message}</p>}
     </form>
    );

}