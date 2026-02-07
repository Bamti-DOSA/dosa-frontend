import React from 'react';
import { RotateCcw } from 'lucide-react';

function AnimationSlider({ 
  currentFrame, 
  totalFrames, 
  onFrameChange, 
  onReset,
  modelUrl
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(modelUrl);
      const blob = await response.blob();
      
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'assembly_model.glb';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg p-4 w-[90%] max-w-2xl z-10">
      {/* 프레임 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">
          조립 애니메이션
        </div>
        <div className="text-sm text-gray-500">
          Frame: {currentFrame} / {totalFrames}
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={totalFrames}
          value={currentFrame}
          onChange={(e) => onFrameChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-main-1"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentFrame / totalFrames) * 100}%, #e5e7eb ${(currentFrame / totalFrames) * 100}%, #e5e7eb 100%)`
          }}
        />
      </div>

      {/* 리셋 버튼 + 상태 표시 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm text-gray-600"
          title="처음으로"
        >
          <RotateCcw size={16} />
          <span>처음으로</span>
        </button>

        <div className="text-xs text-gray-500">
          {currentFrame === 0 ? '🔧 분해됨' : currentFrame === totalFrames ? '✅ 조립됨' : '⚙️ 진행 중'}
        </div>
      </div>
    </div>
  );
}

export default AnimationSlider;