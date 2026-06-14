const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Setting up the phone line:
// Initialize a WebSocket server instance attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Serve static files from the 'public' folder (we'll create this next)
app.use(express.static('public'));

// Answering the phone (connection)
wss.on('connection', (ws) => {
    console.log('🔗 New client connected!');

    // Hearing someone else speak (message):
    // Listen for messages (drawing coordinates) from any client
    ws.on('message', (message) => {
        // Telling everyone else (The Broadcast)
        // Broadcast the received drawing data to ALL connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Hanging up (close)
    // Handle client disconnection
    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('🚀 Server is listening on http://localhost:3000');
});
