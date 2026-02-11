import React, { useState } from 'react';
import maximize from '../../assets/icons/icon-maximize.svg';
import minimize from '../../assets/icons/icon-minimize-2.svg';

const CoordinateDisplay = ({ transform, className = '' }) => {
  // 1. 기본값: 축소 상태(false)
  const [isExpanded, setIsExpanded] = useState(false);

  const { 
    position = { x: 0, y: 0, z: 0 }, 
    rotation = { x: 0, y: 0, z: 0 }, 
    scale = { x: 1, y: 1, z: 1 } 
  } = transform || {};

  const toDeg = (rad) => (rad * 180 / Math.PI).toFixed(4);

  return (
    <div 
      className={`
        bg-bg-2 rounded-xl transition-all duration-300
        ${className}
        
        /* 2. 상태에 따른 박스 크기 및 여백 동적 변경 */
        ${isExpanded 
          ? 'px-4 py-3 min-w-[180px]' // 확대: 넉넉한 너비와 여백
          : 'px-3 py-2 min-w-fit'     // 축소: 내용물에 딱 맞는 크기 (Fit)
        }
      `}
    >
      
      {/* ========================================================= */}
      {/* 🟢 CASE 1: 확대 상태 (isExpanded === true) */}
      {/* ========================================================= */}
      {isExpanded ? (
        <>
          {/* 헤더: 제목 + 축소 버튼 */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="text-[12px] text-gray-9 font-bold">Transform</div>
            <button 
              onClick={() => setIsExpanded(false)}
              title="접기"
              className="hover:bg-gray-100 p-1 rounded transition-colors"
            >
              <img src={minimize} alt="접기" className="w-4 h-4" />
            </button>
          </div>

          {/* 데이터 영역 */}
          <div className="space-y-4 pl-6 animate-fade-in-down">
            
            {/* Location */}
            <div className="flex gap-4 text-[12px] text-gray-9">
              <span className="font-medium pt-[2px] w-10">Location</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">X</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {position.x.toFixed(3)} m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Y</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {position.y.toFixed(3)} m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Z</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {position.z.toFixed(3)} m
                  </span>
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="flex gap-4 text-[12px] text-gray-9">
              <span className="font-medium pt-[2px] w-10">Rotation</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">X</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {toDeg(rotation.x)} °
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Y</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {toDeg(rotation.y)} °
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Z</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {toDeg(rotation.z)} °
                  </span>
                </div>
              </div>
            </div>

            {/* Scale */}
            <div className="flex gap-4 text-[12px] text-gray-9">
              <span className="font-medium pt-[2px] w-10">Scale</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">X</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {scale.x.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Y</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {scale.y.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 text-center text-gray-9">Z</span>
                  <span className='bg-bg-1 rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-900'>
                    {scale.z.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ========================================================= */
        /* 🔴 CASE 2: 축소 상태 (isExpanded === false) */
        /* ========================================================= */
        <div className="flex items-start gap-2">
          
          {/* 좌표 데이터 (X, Y, Z) */}
          <div className="flex flex-col gap-1 text-[12px] text-gray-9">
            <div className="flex items-center gap-2">
              <span className="w-3 text-center text-gray-9">X</span>
              <span className=' rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-9'>
                {position.x.toFixed(4)} m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-center text-gray-9">Y</span>
              <span className=' rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-9'>
                {position.y.toFixed(4)} m
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 text-center text-gray-9">Z</span>
              <span className=' rounded-sm px-2 min-w-[70px] text-center font-mono text-gray-9'>
                {position.z.toFixed(4)} m
              </span>
            </div>
          </div>

          {/* 확대 버튼 (X값 우측에 위치) */}
          <button 
            onClick={() => setIsExpanded(true)}
            title="펼치기"
            className="hover:bg-gray-100 p-1 rounded transition-colors -mt-0.5"
          >
            <img src={maximize} alt="펼치기" className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default CoordinateDisplay;