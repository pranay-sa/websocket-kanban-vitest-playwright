// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import KanbanBoard from './components/KanbanBoard';
import TaskForm from './components/TaskForm';
import apiService from './services/api';
import socketService from './services/socket';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Initialize and fetch data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.fetchTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    // Connect to socket
    socketService.connect();

    // Set up socket event listeners
    socketService.on('sync:tasks', (allTasks) => {
      setTasks(allTasks);
    });

    socketService.on('task:create', (newTask) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    socketService.on('task:update', (updatedTask) => {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
    });

    socketService.on('task:delete', ({ id }) => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    });

    socketService.on('task:move', ({ id, status }) => {
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === id ? { ...task, status } : task)
      );
    });

    // Initial fetch
    fetchTasks();

    // Request sync from server
    socketService.requestSync();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      setIsLoading(true);
      const newTask = await apiService.createTask(taskData);
      setTasks([...tasks, newTask]);
      setIsTaskFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      setIsLoading(true);
      const updatedTask = await apiService.updateTask(taskId, updates);
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      setIsTaskFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = async (taskId, newStatus) => {
    try {
      setIsLoading(true);
      await apiService.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('Error moving task:', err);
      setError('Failed to move task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormSubmit = (taskData) => {
    if (editingTask) {
      handleUpdateTask(editingTask.id, taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Board</h1>
        <button 
          className="add-task-button"
          data-testid="add-task-button"
          onClick={() => {
            setEditingTask(null);
            setIsTaskFormOpen(true);
          }}
        >
          Add Task
        </button>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard 
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          isLoading={isLoading}
        />
      </DndProvider>
      
      {isTaskFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TaskForm 
              initialData={editingTask}
              onSubmit={handleTaskFormSubmit}
              onCancel={() => {
                setIsTaskFormOpen(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;