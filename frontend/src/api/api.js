import axios from "axios"


export const baseUrl = 'http://localhost:4000';
 
 export const fetchAllTeams = async () =>{
 
  const response = await axios.get(`${baseUrl}/api/teams`);
  console.log('response 44',response)
  return response
 }


 export const fetchAllUsers = async () =>{
    const response = await axios.get(`${baseUrl}/api/users`);
    return response
   }
  
  /*  export const fetchUserRestaurant = async (id) =>{
   const response =   await axios.get(`${baseUrl}/api/v1/restaurant/userRestaurant/${id}`)
      return response
     }
  
     
     export const fetchReviews = async () =>{
      const response = await axios.get(`${baseUrl}/api/v1/review/reviews`);
      return response
     }


     export const fetchAllUsers = async () =>{
      const response = await axios.get(`${baseUrl}/api/v1/review/reviews/api/v1/user/allUsers`);
      return response
     }
     export const fetchSingleRestaurant = async (userId) =>{
      const response = await axios.get(`${baseUrl}/api/v1/restaurant/${userId}`);
      return response
     }


     export const approveRestaurant = async (restaurantId) =>{
      const response = await axios.get(`${baseUrl}/api/v1/admin/activateRestaurant/${restaurantId}`);
      return response
     }

     export const deleteUser = async (userId) =>{
      const response = await axios.delete(`${baseUrl}/api/v1/admin/deleteUser/${userId}`);
      return response
     }

     */