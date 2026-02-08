import React from "react";
import { X } from "lucide-react";

const AiBriefing = ({ onClose, className = "", data }) => {
  console.log("AiBriefing에 들어온 데이터:", data);
  // 데이터가 없거나 형식이 맞지 않을 때 방어 코드
  let parsedData = null;
  try {
    if (typeof data?.summary === "string") {
      parsedData = JSON.parse(data.summary);
    } else {
      parsedData = data?.summary;
    }
  } catch (e) {
    console.error("JSON 파싱 에러:", e);
  }

  // 2. 파싱된 데이터가 없거나 items가 없으면 방어 처리
  if (!parsedData || !parsedData.items) {
    console.log("파싱된 데이터에 items가 없습니다.", parsedData);
    return null;
  }

  return (
    <div
      className={`
        w-[420px] 
        /* 💡 뒤에 있는 3D 모델을 흐릿하게 비춰주는 핵심 속성 */
        backdrop-blur-xl 
        border-ai-gradient 
        p-5 
        animate-in fade-in zoom-in duration-300 
        ${className} `}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-9 t-18-semi tracking-tight">
            지난 학습 AI 브리핑
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-8 hover:text-gray-9 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>
      </div>

      {/* 날짜 (오늘 날짜 반영) */}
      <p className="d-12-med text-gray-400 mb-2 ml-1">
        {new Date().toLocaleDateString()} 학습 기준
      </p>

      {/* 본문 영역 */}
      {/* 상단 타이틀 요약 */}
      <p className="b-14-semi text-main-1 mb-[14px]">{parsedData.title}</p>
      <div className="b-14-med text-gray-9 space-y-2 leading-relaxed max-h-[300px] overflow-y-auto thin-scrollbar pr-2">
        {/* 세부 항목 리스트 */}
        <ul className="space-y-4">
          {parsedData.items.map((item, index) => (
            <li key={index} className="flex gap-2 items-start">
              <span className="text-main-1 shrink-0">•</span>
              <span className="flex flex-col gap-0.5">
                {/* 부품명 강조 */}
                <span className="font-bold text-gray-800">{item.name}:</span>
                {/* 부품 설명 */}
                <span className="text-gray-7">{item.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AiBriefing;
