const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the static files from the "Public" folder
app.use(express.static(path.join(__dirname, 'Public')));

// This array will store the drawing history so new users see what was already drawn
let drawingHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 1. Send existing drawing history to the new user immediately
    socket.emit('init-history', drawingHistory);

    // 2. Listen for drawing data from a user
    socket.on('draw-data', (data) => {
        // Save it to history
        drawingHistory.push(data);
        // Broadcast it to every other connected user
        socket.broadcast.emit('draw-data', data);
    });

    // 3. Global Undo: Remove the last stroke for everyone
    socket.on('undo', () => {
        drawingHistory.pop();
        io.emit('clear-and-redraw', drawingHistory);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running! Go to http://localhost:${PORT}`);
});
// This tells the server to send index.html when someone visits the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});