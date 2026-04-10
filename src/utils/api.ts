import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://157.66.100.182:5100',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
