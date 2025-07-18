import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean>;
}

// Crear instancia de axios con configuración base
const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Importante: permite enviar y recibir cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no válido - redirigir a login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    queryParams = {},
  } = options;

  const axiosConfig: AxiosRequestConfig = {
    method: method.toLowerCase() as any,
    url: endpoint,
    headers: {
      ...headers,
    },
    params: queryParams,
    data: body,
  };

  try {
    const response: AxiosResponse<T> = await apiInstance(axiosConfig);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const data = error.response.data;
      console.log('Respuesta de error del backend:', data); // <-- LOG 1
      let errorMessage = data?.message || data?.error || `Error ${error.response.status}: ${error.response.statusText}`;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(', ');
      }
      console.log('Mensaje de error procesado:', errorMessage); // <-- LOG 2
      throw new Error(errorMessage);
    } else if (error.request) {
      console.log('No se recibió respuesta del backend:', error.request); // <-- LOG 3
      throw new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      console.log('Error desconocido:', error.message); // <-- LOG 4
      throw new Error(error.message || 'Error desconocido');
    }
  }
} 