import React from 'react';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ShippingLineStat {
  id: string;
  name: string;
  count: number;
}

interface ShippingLineChartProps {
  data: ShippingLineStat[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ShippingLineChart = ({ data }: ShippingLineChartProps) => {
  const totalContainers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-80">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Conteneurs par armateur</h3>
      <p className="text-sm text-gray-500 mb-4">Total: {totalContainers} conteneurs</p>
      
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${value} conteneurs`, props.payload.name]}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
              padding: '10px' 
            }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={(value, entry, index) => {
              const { payload } = entry;
              return `${payload.name} (${payload.count})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ShippingLineChart;