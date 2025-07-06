import axios from 'axios';

// Configuración global de axios
axios.defaults.withCredentials = true;

// Configurar la URL base
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default axios; 