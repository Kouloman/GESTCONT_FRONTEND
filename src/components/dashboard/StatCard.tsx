import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const StatCard = ({ title, value, icon, change, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    red: 'bg-red-50 text-red-900',
    yellow: 'bg-yellow-50 text-yellow-900',
  };

  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-900',
    green: 'bg-green-100 text-green-900',
    red: 'bg-red-100 text-red-900',
    yellow: 'bg-yellow-100 text-yellow-900',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">depuis le mois dernier</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;