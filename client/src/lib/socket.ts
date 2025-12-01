import { io } from 'socket.io-client';

const SOCKET_URL = 'https://dms-theta-opal.vercel.app/';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
