// backend/models/Task.js
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// In-memory task store for this implementation
// In a real app, this would be a database
let tasks = [];

class Task {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status || 'to-do'; // to-do, in-progress, done
    this.priority = data.priority || 'medium'; // low, medium, high
    this.category = data.category || 'feature'; // bug, feature, enhancement
    this.attachments = data.attachments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static initialize() {
    // Load tasks from data file if it exists
    try {
      const dataPath = path.join(__dirname, '../data/tasks.json');
      
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        tasks = JSON.parse(data);
        console.log(`Loaded ${tasks.length} tasks from data file`);
      } else {
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Create some sample tasks
        tasks = [
          new Task({
            title: 'Implement Login Feature',
            description: 'Create login form with email and password',
            status: 'to-do',
            priority: 'high',
            category: 'feature'
          }),
          new Task({
            title: 'Fix Navigation Menu',
            description: 'Menu disappears on mobile view',
            status: 'in-progress',
            priority: 'medium',
            category: 'bug'
          }),
          new Task({
            title: 'Add Dark Mode',
            description: 'Implement dark mode toggle',
            status: 'done',
            priority: 'low',
            category: 'enhancement'
          })
        ];
        
        // Save initial tasks
        Task.saveTasks();
      }
    } catch (error) {
      console.error('Error initializing tasks:', error);
      tasks = [];
    }
  }

  static saveTasks() {
    try {
      const dataPath = path.join(__dirname, '../data/tasks.json');
      fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  static getAll() {
    return tasks;
  }

  static findById(id) {
    return tasks.find(task => task.id === id);
  }

  static create(data) {
    const task = new Task(data);
    tasks.push(task);
    Task.saveTasks();
    return task;
  }

  static update(id, updates) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    const updatedTask = {
      ...tasks[index],
      ...updates,
      id, // Ensure ID remains the same
      updatedAt: new Date().toISOString()
    };

    tasks[index] = updatedTask;
    Task.saveTasks();
    return updatedTask;
  }

  static delete(id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return false;

    // Check for attachments to clean up
    const task = tasks[index];
    if (task.attachments && task.attachments.length > 0) {
      task.attachments.forEach(attachment => {
        try {
          const filePath = path.join(__dirname, '../uploads', attachment.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error(`Error deleting attachment file: ${error}`);
        }
      });
    }

    tasks.splice(index, 1);
    Task.saveTasks();
    return true;
  }

  static addAttachment(taskId, attachment) {
    const task = Task.findById(taskId);
    if (!task) return null;

    task.attachments.push(attachment);
    task.updatedAt = new Date().toISOString();
    Task.saveTasks();
    return task;
  }

  static removeAttachment(taskId, attachmentId) {
    const task = Task.findById(taskId);
    if (!task) return null;

    const attachmentIndex = task.attachments.findIndex(att => att.id === attachmentId);
    if (attachmentIndex === -1) return null;

    const attachment = task.attachments[attachmentIndex];
    
    // Delete the file
    try {
      const filePath = path.join(__dirname, '../uploads', attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting attachment file: ${error}`);
    }

    // Remove from task
    task.attachments.splice(attachmentIndex, 1);
    task.updatedAt = new Date().toISOString();
    Task.saveTasks();
    
    return task;
  }
}

module.exports = Task;