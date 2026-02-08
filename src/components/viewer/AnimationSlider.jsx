import React from "react";
import { RotateCcw } from "lucide-react";

function AnimationSlider({
  currentFrame,
  totalFrames,
  onFrameChange,
  onReset,
  modelUrl,
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(modelUrl);
      const blob = await response.blob();

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "assembly_model.glb";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("❌ Download failed:", error);
    }
  };

  return (
    <div className="w-full py-2">
      <div className="flex items-center w-full">
        <input
          type="range"
          min="0"
          max={totalFrames}
          value={currentFrame}
          onChange={(e) => onFrameChange(Number(e.target.value))}
          className="custom-slider w-full h-[6px] bg-[#E4EBF1] rounded-full appearance-none cursor-pointer outline-none"
          style={{
            // 슬라이더 진행바 색상 (이미지처럼 은은한 파란색 계열)
            background: `linear-gradient(to right, #5A8CAF 0%, #5A8CAF ${(currentFrame / totalFrames) * 100}%, #E5E7EB ${(currentFrame / totalFrames) * 100}%, #E5E7EB 100%)`,
          }}
        />
      </div>

      {/* 가로로 긴 캡슐 모양 Thumb을 위한 커스텀 CSS */}
      <style jsx>{`
        /* 크롬, 사파리, 엣지용 */
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 39.634px; /* 👈 가로로 긴 캡슐 형태 */
          height: 18px; /* 👈 세로 높이 */
          background-color: #5a8caf; /* 👈 이미지의 조절 바 색상 */
          border-radius: 10px; /* 캡슐 모양을 위한 라운드 */
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          background-color: #4a7b9d; /* 호버 시 약간 진하게 */
          transform: scaleY(1.1);
        }

        /* 파이어폭스용 */
        .custom-slider::-moz-range-thumb {
          width: 24px;
          height: 12px;
          background-color: #5a8caf;
          border-radius: 6px;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default AnimationSlider;
