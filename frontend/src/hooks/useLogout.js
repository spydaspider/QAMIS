import { useAuthContext } from "./useAuthContext";
export const useLogout = () =>{
    const { dispatch } = useAuthContext();
/*     const { dispatch: dispatchTodos} = useTodosContext();
 */    const logout = () =>{
        localStorage.removeItem('user');
        dispatch({type: 'LOGOUT'});
/*         dispatchTodos({type: 'SET_WORKOUTS', payload: null});
 */    }
    return { logout }
}