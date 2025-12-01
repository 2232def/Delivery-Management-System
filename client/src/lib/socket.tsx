import { io } from 'socket.io-client';

// Initialize socket connection
export const socket = io('http://localhost:5000', {
    autoConnect: false, // We connect manually after login
});

export const connectSocket = (role: string, userId: string) => {
    if (!socket.connected) {
        socket.auth = { role, userId }; // Optional: Pass auth data if backend needs it
        socket.connect();
        
        // Join specific rooms based on logic
        socket.emit('join_room', `${role.toLowerCase()}_${userId}`); // e.g., "buyer_123"
        if (role === 'ADMIN') socket.emit('join_room', 'admin_room');
    }
};