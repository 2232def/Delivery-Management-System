import express from 'express';
import { createServer } from 'http';
import { initSocket, getIO } from '../src/config/socketConfig'; // Assuming config/socket.ts is next to this
import path from 'path';

const app = express();
const httpServer = createServer(app);
const PORT = 3000;

// 1. Initialize Socket.io
const io = initSocket(httpServer);

// --- Simple Express Routes for Testing ---

// Serves the client HTML file for testing
app.get('/', (req, res) => {
    // NOTE: In a real project, this path needs adjustment
    res.sendFile(path.join(__dirname, 'client.html')); 
});

// A dummy API route to test getIO() usage
app.get('/api/test-emit', (req, res) => {
    try {
        const socketInstance = getIO();
        
        // This simulates a database event (e.g., an order being created)
        // It sends a message to all sockets connected to the 'admin_room'
        socketInstance.to('admin_room').emit('test_message', {
            status: 'success',
            data: `Test emitted at ${new Date().toLocaleTimeString()}`
        });

        res.status(200).json({ message: 'Test message emitted to admin_room.' });
    } catch (error) {
        console.error("Error getting or using socket:", error);
        res.status(500).json({ message: 'Socket.io is not running or failed to initialize.' });
    }
});

// 2. Start the HTTP server
httpServer.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
    console.log(`Socket.io running on port ${PORT}`);
});