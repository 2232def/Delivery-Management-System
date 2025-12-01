import axios from 'axios';

// CHANGE THIS URL IF YOUR BACKEND IS ON A DIFFERENT PORT
const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
});

// Helper to set the token for requests
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};