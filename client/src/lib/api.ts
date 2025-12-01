import axios from 'axios';

const API_URL = 'https://dms-theta-opal.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});
