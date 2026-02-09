import React from 'react';

const CoordinateDisplay = ({ position, className = '' }) => {
  const { x = 0, y = 0, z = 0 } = position || {};

  return (
    <div className={`bg-bg-2 rounded-xl px-3 py-2 min-w-[130px] ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-gray-8">X</span>
          <span className="text-[12px] text-gray-8 ">
            {x.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[12px] text-gray-8">Y</span>
          <span className="text-[12px] text-gray-8 ">
            {y.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[12px] text-gray-8">Z</span>
          <span className="text-[12px] text-gray-8 ">
            {z.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoordinateDisplay;