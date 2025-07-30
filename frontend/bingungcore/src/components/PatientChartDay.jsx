import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

// Sample data for visualization purposes
const chartData = [
  { day: 'Mon', patients: 22 },
  { day: 'Tue', patients: 18 },
  { day: 'Wed', patients: 24 },
  { day: 'Thu', patients: 33 },
  { day: 'Fri', patients: 35 },
  { day: 'Sat', patients: 62 },
  { day: 'Sun', patients: 55 },
];

const PatientChartDay = () => {
  return (
    // ResponsiveContainer makes the chart fit the parent container's size
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="day" stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
        <YAxis stroke="white" tick={{ fill: 'white', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip theme="dark" />} />
        <Line 
          type="monotone" 
          dataKey="patients" 
          stroke="#ffffff" // Line color
          strokeWidth={2}
          dot={{ r: 4, fill: '#ffffff' }} // The dots on the line
          activeDot={{ r: 6 }} // The dot when hover
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PatientChartDay;