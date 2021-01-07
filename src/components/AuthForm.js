import { authService } from "fbInstance";
import React, {useState} from "react";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(true);
    const [error, setError] = useState("");
    
    const toggleAccount = () => setNewAccount((prev) => !prev);

    const onChange = (event) => {
        const {target : { name, value }} = event;
        if(name === "email")
            setEmail(value)
        else if(name === "password")
            setPassword(value)
    }
    
    const onSubmit = async(event) => {
        event.preventDefault();
        try{
            if(newAccount){
               await authService.createUserWithEmailAndPassword(email,password);
            }
            else{
                await authService.signInWithEmailAndPassword(email,password);
            }
        } catch(error){
            setError(error.message);
        }   
    }

    return (
        <>
            <form onSubmit={onSubmit} className="container">
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    required 
                    value={email}
                    onChange={onChange}
                    className="authInput"
                />
                <input 
                    name="password" 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={password}
                    onChange={onChange}
                    className="authInput"
                />
                <input type="submit" 
                       className="authInput authSubmit"
                       value={newAccount ? "Create Account" : "Log In"}
                />
                {error && <span className="authError">{error}</span>}
            </form>  
            <span onClick={toggleAccount} className="authSwitch">
                {newAccount ? "Sign In" : "Create Account"}
            </span>
        </>
    )
}
export default AuthForm;