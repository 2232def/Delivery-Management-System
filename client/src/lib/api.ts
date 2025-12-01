import axios from 'axios';

const API_URL = 'https://dms-backend-3h2p.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});
