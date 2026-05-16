import Axios from "axios"

// console.log(import.meta.env.VITE_BACKEND_URL)
const axios = Axios.create({
       
      baseURL:import.meta.env.VITE_BACKEND_URL
})
export default axios;