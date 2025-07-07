import { useAuthContext } from "./useAuthContext";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
export const useLogin = () =>{
    const [ isLoading, setIsLoading ] = useState(null);
    const [error,setError] = useState(null);
    const { dispatch } = useAuthContext();
    const navigate  = useNavigate();
    const login = async(email, password) =>{
        setIsLoading(true);
        setError(false);
    

        
         const response = await fetch('/api/users/login',{
            method: 'POST',
            headers: {
                'Content-type': 'Application/json'
            },
            body:JSON.stringify({email, password})
        })
        const json = await response.json();
    
        if(!response.ok)
        {
            setIsLoading(false);
            setError(json.error);
        }
        if(response.ok)
        {
            setIsLoading(false);
            localStorage.setItem('user',JSON.stringify(json));
            dispatch({type: 'LOGIN', payload: json});
            switch (json.role) {
        case "student":
          navigate("/studentDashboard");
          break;
        case "instructor":
          navigate("/instructorDashboard");
          break;
        default:
      }  
 
        } 
     
    }
    return { login, isLoading, error}
}