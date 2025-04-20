// frontend/src/services/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {
      'task:create': [],
      'task:update': [],
      'task:delete': [],
      'task:move': [],
      'sync:tasks': []
    };
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL);
    
    // Set up listeners for each event
    Object.keys(this.callbacks).forEach(event => {
      this.socket.on(event, (data) => {
        this.callbacks[event].forEach(callback => callback(data));
      });
    });

    this.socket.on('connect', () => {
      console.log('Socket connected!');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected!');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);

    // If socket is already connected, set up the listener
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.error('Socket not connected!');
      return;
    }
    this.socket.emit(event, data);
  }

  // Specific actions for our Kanban application
  createTask(task) {
    this.emit('task:create', task);
  }

  updateTask(task) {
    this.emit('task:update', task);
  }

  deleteTask(taskId) {
    this.emit('task:delete', { id: taskId });
  }

  moveTask(taskId, newStatus) {
    this.emit('task:move', { id: taskId, status: newStatus });
  }

  requestSync() {
    this.emit('sync:request');
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;