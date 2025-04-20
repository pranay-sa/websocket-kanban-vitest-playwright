// src/components/KanbanBoard.jsx
import React from 'react';
import Column from './Column';
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, onTaskMove, onTaskEdit, onTaskDelete }) => {
  const columns = [
    {
      id: 'to-do',
      title: 'To Do',
      tasks: tasks.filter(task => task.status === 'to-do')
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => task.status === 'in-progress')
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(task => task.status === 'done')
    }
  ];

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <Column
          key={column.id}
          id={column.id}
          title={column.title}
          tasks={column.tasks}
          onTaskMove={onTaskMove}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;