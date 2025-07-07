import { useAuthContext } from "./useAuthContext";
import { useState } from 'react';
export const useSignup = () =>{
    const [ isLoading, setIsLoading ] = useState(null);
    const [error,setError] = useState(null);
    const { dispatch } = useAuthContext();
    const signup = async(username, email, password, passwordAgain,role) =>{
        setIsLoading(true);
        setError(false);
    
        if(password !== passwordAgain)
        {
            setIsLoading(false);
            setError('Passwords do not match');
            
        
        }
        else{
        
         const response = await fetch('/api/users/signup',{
            method: 'POST',
            headers: {
                'Content-type': 'Application/json'
            },
            body:JSON.stringify({username, email, password,role})
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
 
        } 
     }
    }
    return { signup, isLoading, error}
}