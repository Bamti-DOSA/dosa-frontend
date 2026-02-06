import React from 'react';
import { X, Sparkles } from 'lucide-react';

// 👇 className prop 추가
const AiBriefing = ({ onClose, className = '' }) => {
  return (
    <div className={`w-[320px] backdrop-blur-md rounded-2xl shadow-xl border border-ai-gradient p-5  ${className}`} style={{ backgroundColor: 'rgba(237, 242, 246, 0.85)' }}>
      
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-gray-800 text-sm tracking-tight">지난 학습 AI 브리핑</h3>
        </div>
        <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* 날짜 */}
      <p className="text-[11px] text-gray-400 font-medium mb-4 ml-1">2026. 02. 03 학습 기준</p>
      
      {/* 본문 (스크롤 영역) mock데이터 입니다아앙아아*/}
      <div className="text-xs text-gray-600 space-y-4 leading-relaxed max-h-[260px] overflow-y-auto thin-scrollbar pr-2">
        <p>
          사용자님은 지난 학습 때 <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">Impellar Blade, Leg, Arm gear</span>에 대하여 학습하셨습니다.
        </p>
        
        <ul className="space-y-3">
            <li className="flex gap-2 items-start">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                    <span className="font-bold text-gray-800">Impellar Blade (날개):</span> 프로펠러의 곡률에 따른 양력 발생 원리와 비행 시 공기 저항을 최소화하는 유선형 설계를 확인하셨습니다.
                </span>
            </li>
            <li className="flex gap-2 items-start">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                    <span className="font-bold text-gray-800">Leg (착륙 장치):</span> 착륙 시 기체에 가해지는 수직 충격을 분산시키는 구조적 강성과 랜딩 기어의 배치 방식을 살펴보셨습니다.
                </span>
            </li>
             <li className="flex gap-2 items-start">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                    <span className="font-bold text-gray-800">Arm gear (구동 기어):</span> 모터의 회전력을 날개로 전달하는 내부 기어의 맞물림 구조와 동력 전달 효율에 대해 학습하셨습니다.
                </span>
            </li>
            <li className="flex gap-2 items-start">
                <span className="text-blue-500 mt-1">•</span>
                <span>
                    이번 학습에서는 각 부품의 설계 의도와 기능적 역할에 대한 이해를 바탕으로, 향후 드론 설계 시 고려해야 할 핵심 요소들을 파악하셨습니다.
                </span>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default AiBriefing;