// src/components/ui/Input.tsx

// 1. Import 'forwardRef' from React
import React, { forwardRef } from 'react';

// The interface stays exactly the same
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

// 2. Change the component definition to use `forwardRef`
export const Input = forwardRef<HTMLInputElement, InputProps>(
  // 3. The component function now receives 'props' and 'ref'
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            className={`
              block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500
              focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
              disabled:bg-gray-50 disabled:text-gray-500
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
            // 4. This is the most important part: pass the ref to the actual input
            ref={ref}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

// Optional but good practice: Add a display name for easier debugging
Input.displayName = 'Input';