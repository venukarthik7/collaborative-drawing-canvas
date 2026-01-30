# Technical Architecture - Collaborative Canvas

## 🚀 Data Flow
1. **User Action**: A user moves the mouse on the canvas.
2. **Local Render**: The `client.js` draws a line immediately for zero-latency feedback.
3. **Emit**: The client sends the coordinates, color, and size to the server via `socket.emit('draw-data')`.
4. **Broadcast**: The Node.js server receives the data and uses `socket.broadcast.emit` to send it to all other connected clients.
5. **Remote Render**: Other clients receive the data and use the `draw()` function to render the line on their respective canvases.

## 🛠️ WebSocket Protocol
- **Connection**: Socket.io establishes a persistent bidirectional connection.
- **draw-data**: Sends `{ start, end, color, size }` objects.
- **init-history**: On connection, the server sends the entire `drawingHistory` array so new users see the existing drawing.
- **undo**: Removes the last element from the server-side array and triggers a global re-render for all users.

## 🎨 Performance Decisions
- **Line Segments**: Instead of sending every single pixel, we send start and end points of a segment to reduce network traffic.
- **Canvas Optimization**: Used `lineCap: 'round'` and `lineJoin: 'round'` to ensure strokes look smooth and not jagged.