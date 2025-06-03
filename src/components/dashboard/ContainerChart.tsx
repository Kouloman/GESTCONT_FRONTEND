import React from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DailyMovement {
  date: string;
  entries: number;
  exits: number;
}

interface ContainerChartProps {
  data: DailyMovement[];
}

const ContainerChart = ({ data }: ContainerChartProps) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-80">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Mouvements de conteneurs</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
              padding: '10px' 
            }}
            formatter={(value, name) => [value, name === 'entries' ? 'Entrées' : 'Sorties']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend 
            formatter={(value) => value === 'entries' ? 'Entrées' : 'Sorties'} 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar 
            dataKey="entries" 
            name="Entrées"
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
          <Bar 
            dataKey="exits" 
            name="Sorties"
            fill="#10B981" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1500}
            animationBegin={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContainerChart;