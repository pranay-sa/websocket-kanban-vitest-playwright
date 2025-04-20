// backend/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const Task = require('./models/Task');

// Initialize the app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }
});

// Initialize task data
Task.initialize();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available in request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/tasks', taskRoutes);

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send all tasks to newly connected client
  socket.emit('sync:tasks', Task.getAll());
  
  // Handle sync request
  socket.on('sync:request', () => {
    socket.emit('sync:tasks', Task.getAll());
  });
  
  // Handle task create
  socket.on('task:create', (task) => {
    try {
      const newTask = Task.create(task);
      io.emit('task:create', newTask);
    } catch (error) {
      console.error('Error creating task via socket:', error);
    }
  });
  
  // Handle task update
  socket.on('task:update', (task) => {
    try {
      const updatedTask = Task.update(task.id, task);
      if (updatedTask) {
        io.emit('task:update', updatedTask);
      }
    } catch (error) {
      console.error('Error updating task via socket:', error);
    }
  });
  
  // Handle task delete
  socket.on('task:delete', ({ id }) => {
    try {
      const success = Task.delete(id);
      if (success) {
        io.emit('task:delete', { id });
      }
    } catch (error) {
      console.error('Error deleting task via socket:', error);
    }
  });
  
  // Handle task move
  socket.on('task:move', ({ id, status }) => {
    try {
      const updatedTask = Task.update(id, { status });
      if (updatedTask) {
        io.emit('task:move', { id, status });
        io.emit('task:update', updatedTask);
      }
    } catch (error) {
      console.error('Error moving task via socket:', error);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };