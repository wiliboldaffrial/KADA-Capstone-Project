import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

// Sample data for monthly patients
const monthlyData = [
  { month: 'Jan', patients: 1200 },
  { month: 'Feb', patients: 2100 },
  { month: 'Mar', patients: 1800 },
  { month: 'Apr', patients: 2800 },
  { month: 'May', patients: 1900 },
  { month: 'Jun', patients: 2300 },
  { month: 'Jul', patients: 3100 },
];

const PatientBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={monthlyData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />}/>
        <Bar 
          dataKey="patients" 
          fill={'#045ae2'}
          radius={[4, 4, 0, 0]} // Rounded top corners for the bars
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PatientBarChart;