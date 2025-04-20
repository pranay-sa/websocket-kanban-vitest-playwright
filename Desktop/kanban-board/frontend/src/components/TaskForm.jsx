// src/components/TaskForm.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel, task = null }) => {
  const [formData, setFormData] = useState({
    id: task?.id || '',
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'to-do',
    priority: task?.priority || 'medium',
    category: task?.category || 'feature',
    attachments: task?.attachments || []
  });
  
  const [files, setFiles] = useState([]);
  
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  const categoryOptions = [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'enhancement', label: 'Enhancement' }
  ];
  
  const statusOptions = [
    { value: 'to-do', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (selectedOption, field) => {
    setFormData({
      ...formData,
      [field]: selectedOption.value
    });
  };
  
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (task) {
      // Update existing task
      if (files.length > 0) {
        // If there are new files, use FormData and upload them
        const formDataObj = new FormData();
        formDataObj.append('taskData', JSON.stringify(formData));
        files.forEach(file => {
          formDataObj.append('attachments', file);
        });
        
        try {
          const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            body: formDataObj
          });
          
          if (response.ok) {
            const updatedTask = await response.json();
            onSubmit(updatedTask);
          }
        } catch (error) {
          console.error('Error updating task:', error);
        }
      } else {
        // If no new files, just update the task data via socket
        onSubmit(formData);
      }
    } else {
      // Create new task
      if (files.length > 0) {
        // If there are files, use FormData and upload them
        const formDataObj = new FormData();
        formDataObj.append('taskData', JSON.stringify(formData));
        files.forEach(file => {
          formDataObj.append('attachments', file);
        });
        
        try {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            body: formDataObj
          });
          
          if (response.ok) {
            const newTask = await response.json();
            onSubmit(newTask);
          }
        } catch (error) {
          console.error('Error creating task:', error);
        }
      } else {
        // If no files, just create the task data via socket
        onSubmit(formData);
      }
    }
  };
  
  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          data-testid="task-title-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          data-testid="task-description-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <Select
          id="status"
          options={statusOptions}
          onChange={(option) => handleSelectChange(option, 'status')}
          value={statusOptions.find(option => option.value === formData.status)}
          className="react-select"
          classNamePrefix="react-select"
          data-testid="task-status-select"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <Select
          id="priority"
          options={priorityOptions}
          onChange={(option) => handleSelectChange(option, 'priority')}
          value={priorityOptions.find(option => option.value === formData.priority)}
          className="react-select"
          classNamePrefix="react-select"
          data-testid="task-priority-select"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <Select
          id="category"
          options={categoryOptions}
          onChange={(option) => handleSelectChange(option, 'category')}
          value={categoryOptions.find(option => option.value === formData.category)}
          className="react-select"
          classNamePrefix="react-select"
          data-testid="task-category-select"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="attachments">Attachments</label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          onChange={handleFileChange}
          multiple
          data-testid="task-attachments-input"
        />
        <small>You can upload multiple files (images, PDFs, etc.)</small>
      </div>
      
      {formData.attachments && formData.attachments.length > 0 && (
        <div className="existing-attachments">
          <label>Existing Attachments:</label>
          <ul>
            {formData.attachments.map((attachment, index) => (
              <li key={index}>
                {attachment.originalName || attachment.filename}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-btn" 
          onClick={onCancel}
          data-testid="task-cancel-btn"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          data-testid="task-submit-btn"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;