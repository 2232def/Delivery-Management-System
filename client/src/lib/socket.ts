import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:8000'
  : 'https://dms-backend-3h2p.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
