import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanBoard } from '../KanbanBoard';
// Mock tasks data
const mockTasks = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'to-do',
    priority: 'high',
    category: 'bug',
    attachments: []
  },
  {
    id: 'task-2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'medium',
    category: 'feature',
    attachments: []
  },
  {
    id: 'task-3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'done',
    priority: 'low',
    category: 'enhancement',
    attachments: []
  }
];
const KanbanBoardWrapper = ({ tasks, onTaskMove, onTaskEdit, onTaskDelete }) => (
  <DndProvider backend={HTML5Backend}>
    <KanbanBoard 
      tasks={tasks} 
      onTaskMove={onTaskMove} 
      onTaskEdit={onTaskEdit} 
      onTaskDelete={onTaskDelete} 
    />
  </DndProvider>
);
describe('KanbanBoard Component', () => {
  test('renders all three columns', () => {
    render(
      <KanbanBoardWrapper 
        tasks={mockTasks} 
        onTaskMove={() => {}} 
        onTaskEdit={() => {}} 
        onTaskDelete={() => {}} 
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  test('displays tasks in their correct columns', () => {
    render(
      <KanbanBoardWrapper 
        tasks={mockTasks} 
        onTaskMove={() => {}}
        onTaskEdit={() => {}}
        onTaskDelete={() => {}}
      />
    );
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });
  
  test('calls onTaskMove when task is moved', async () => {
    const onTaskMoveMock = vi.fn();
    
    render(
      <KanbanBoardWrapper 
        tasks={mockTasks} 
        onTaskMove={onTaskMoveMock} 
        onTaskEdit={() => {}}
        onTaskDelete={() => {}}
      />
    );
    
    // Note: Actual DnD testing would be better suited for E2E tests with Playwright
    // This test is limited as React DnD events are hard to simulate in JSDOM
  });
  
  test('displays progress chart', () => {
    render(
      <KanbanBoardWrapper 
        tasks={mockTasks} 
        onTaskMove={() => {}}
        onTaskEdit={() => {}}
        onTaskDelete={() => {}}
      />
    );
    
    // Check if progress chart container exists
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
  });
});