// src/components/Column.jsx
import React from 'react';
import { useDrop } from 'react-dnd';
import Task from './Task';
import './Column.css';

const Column = ({ id, title, tasks, onTaskMove, onTaskEdit, onTaskDelete }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => {
      if (item.status !== id) {
        onTaskMove(item.id, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop} 
      className={`column ${isOver ? 'is-over' : ''}`}
      data-testid={`column-${id}`}
    >
      <div className="column-header">
        <h2>{title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="column-content">
        {tasks.map(task => (
          <Task 
            key={task.id} 
            task={task} 
            onEdit={() => onTaskEdit(task)} 
            onDelete={() => onTaskDelete(task.id)} 
          />
        ))}
        {tasks.length === 0 && (
          <div className="empty-column">No tasks yet</div>
        )}
      </div>
    </div>
  );
};

export default Column;