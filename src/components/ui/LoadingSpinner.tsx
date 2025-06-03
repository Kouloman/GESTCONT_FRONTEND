import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner = ({ fullScreen = false, size = 'medium' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-t-blue-900 border-r-blue-900 border-b-blue-200 border-l-blue-200 rounded-full animate-spin`}
      ></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;