// backend/controllers/taskController.js
const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.getAllTasks = (req, res) => {
  const tasks = Task.getAll();
  res.json(tasks);
};

exports.getTaskById = (req, res) => {
  const { id } = req.params;
  const task = Task.findById(id);
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  res.json(task);
};

exports.createTask = (req, res) => {
  try {
    const taskData = req.body;
    const task = Task.create(taskData);
    
    // Emit socket event
    req.io.emit('task:create', task);
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

exports.updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedTask = Task.update(id, updates);
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Emit socket event
    req.io.emit('task:update', updatedTask);
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

exports.deleteTask = (req, res) => {
  try {
    const { id } = req.params;
    const success = Task.delete(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Emit socket event
    req.io.emit('task:delete', { id });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

exports.moveTask = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['to-do', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedTask = Task.update(id, { status });
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Emit socket event
    req.io.emit('task:move', { id, status });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ message: 'Failed to move task', error: error.message });
  }
};

exports.addAttachment = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileType = req.file.mimetype;
    const isAllowed = fileType.startsWith('image/') || fileType === 'application/pdf';
    
    if (!isAllowed) {
      // Delete the file since it's not allowed
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only images and PDFs are allowed' });
    }
    
    const attachment = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedTask = Task.addAttachment(id, attachment);
    
    if (!updatedTask) {
      // Delete the file if task not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Emit socket event for task update
    req.io.emit('task:update', updatedTask);
    
    res.status(201).json({ attachment, task: updatedTask });
  } catch (error) {
    console.error('Error adding attachment:', error);
    res.status(500).json({ message: 'Failed to add attachment', error: error.message });
  }
};

exports.removeAttachment = (req, res) => {
  try {
    const { id, attachmentId } = req.params;
    
    const updatedTask = Task.removeAttachment(id, attachmentId);
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task or attachment not found' });
    }
    
    // Emit socket event for task update
    req.io.emit('task:update', updatedTask);
    
    res.json({ message: 'Attachment removed successfully', task: updatedTask });
  } catch (error) {
    console.error('Error removing attachment:', error);
    res.status(500).json({ message: 'Failed to remove attachment', error: error.message });
  }
};