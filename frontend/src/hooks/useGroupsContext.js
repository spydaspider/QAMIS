import { useContext } from 'react';
import { GroupsContext } from '../context/groupsContext';
export const useGroupsContext = () =>{
    const context = useContext(GroupsContext);
    if(!context)
    {
        throw Error('GroupsContext must be used inside GroupsContextProvider');
    }
    return context;
}