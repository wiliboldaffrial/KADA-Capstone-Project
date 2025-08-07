import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomTooltip from './CustomTooltip';

const PatientChartDay = ({ data }) => {
  return (
    // ResponsiveContainer makes the chart fit the parent container's size
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
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