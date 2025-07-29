import React from 'react';

const CustomTooltip = ({ active, payload, label, theme = 'light' }) => {
  if (active && payload && payload.length) {
    const themeClasses = {
      wrapper: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      label: theme === 'dark' ? 'text-gray-200' : 'text-gray-700',
      value: theme === 'dark' ? 'text-white' : 'text-theme-indigo',
    };

    return (
      <div className={`p-2 border rounded-md shadow-lg ${themeClasses.wrapper}`}>
        <p className={`font-bold ${themeClasses.label}`}>{label}</p>
        <p className={`text-sm ${themeClasses.value}`}>{`Patients: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;