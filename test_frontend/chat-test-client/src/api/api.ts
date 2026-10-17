import axios from 'axios';
import type { User, LoginRequest } from '../types/auth.types';
import { getToken, removeToken } from '../utils/auth.utils';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi={
    register:(userData:User)=>{
        return api.post('/auth/register', userData);
        },
    login:(credential:LoginRequest)=>{
        return api.post('/auth/login', credential);
    },
    logout:()=>{
        return api.post('/auth/logout') ;
    }

};

export const chatApi={
    createChat:(sessionId:string)=>{
        return api.post(`/chat/createChat/${sessionId}`);
    }
};


export default api;
