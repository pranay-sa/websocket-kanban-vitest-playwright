// src/components/Task.jsx
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './Task.css';

const Task = ({ task, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const priorityColors = {
    low: '#2ecc71',
    medium: '#f39c12',
    high: '#e74c3c'
  };

  const categoryLabels = {
    bug: 'Bug',
    feature: 'Feature',
    enhancement: 'Enhancement'
  };

  return (
    <div 
      ref={drag} 
      className={`task ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => setExpanded(!expanded)}
      data-testid={`task-${task.id}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="task-header">
        <div className="task-title">{task.title}</div>
        <div className="task-badges">
          <span 
            className="priority-badge"
            style={{ backgroundColor: priorityColors[task.priority] }}
          >
            {task.priority}
          </span>
          <span className="category-badge">
            {categoryLabels[task.category]}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className="task-details">
          <p className="task-description">{task.description}</p>
          
          {task.attachments && task.attachments.length > 0 && (
            <div className="attachments">
              <h4>Attachments:</h4>
              <div className="attachment-list">
                {task.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    {attachment.mimetype.startsWith('image/') ? (
                      <a href={attachment.path} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={attachment.path} 
                          alt={attachment.originalName} 
                          className="attachment-preview" 
                        />
                      </a>
                    ) : (
                      <a href={attachment.path} target="_blank" rel="noopener noreferrer">
                        {attachment.originalName}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="task-actions">
            <button 
              className="edit-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
            <button 
              className="delete-btn" 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDelete();
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;