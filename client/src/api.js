import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
