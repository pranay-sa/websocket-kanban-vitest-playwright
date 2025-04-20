// src/components/ProgressChart.jsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './ProgressChart.css';

const ProgressChart = ({ stats }) => {
  const { counts, percentDone, total } = stats;
  
  const barData = [
    { name: 'To Do', value: counts['to-do'], color: '#3498db' },
    { name: 'In Progress', value: counts['in-progress'], color: '#f39c12' },
    { name: 'Done', value: counts.done, color: '#2ecc71' }
  ];
  
  const pieData = [
    { name: 'Done', value: counts.done, color: '#2ecc71' },
    { name: 'Remaining', value: total - counts.done, color: '#e74c3c' }
  ];

  return (
    <div className="progress-chart" data-testid="progress-chart">
      <h2>Task Progress</h2>
      
      <div className="stat-summary">
        <div className="stat-item">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{percentDone}%</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>
      
      <div className="chart-wrapper bar-chart">
        <h3>Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Count">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-wrapper pie-chart">
        <h3>Completion Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;