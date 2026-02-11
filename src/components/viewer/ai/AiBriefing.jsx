import React from "react";
import { X } from "lucide-react";

const AiBriefing = ({ onClose, className = "", data }) => {
  // 1. 데이터 파싱 로직
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

  // 데이터 존재 여부 확인
  const hasData = parsedData && parsedData.items && parsedData.items.length > 0;

  return (
    <div
      className={`
        w-[420px] 
        backdrop-blur-xl 
        border-ai-gradient 
        p-5 
        animate-in fade-in zoom-in duration-300 
        ${className} `}
    >
      {/* 헤더: 데이터 여부와 상관없이 항상 표시하여 닫기 버튼을 유지함 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-9 t-18-semi tracking-tight">
            지난 학습 AI 브리핑
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-8 cursor-pointer hover:text-gray-9 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} />
        </button>
      </div>

      <p className="d-12-med text-gray-400 mb-2 ml-1">
        {new Date().toLocaleDateString()} 학습 기준
      </p>

      {/* 본문 영역 */}
      {hasData ? (
        <>
          <p className="b-14-semi text-main-1 mb-[14px]">{parsedData.title}</p>
          <div className="b-14-med text-gray-9 space-y-2 leading-relaxed max-h-[290px] overflow-y-auto thin-scrollbar pr-2">
            <ul className="space-y-4">
              {parsedData.items.map((item, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="text-main-1 shrink-0">•</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-bold text-gray-800">
                      {item.name}:
                    </span>
                    <span className="text-gray-7">{item.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        /* ✨ 데이터가 없을 때 표시할 영역 */
        <div className="pt-4 pb-7 flex flex-col items-center justify-center text-center">
          <p className="b-16-med text-gray-400">브리핑할 대화가 없습니다.</p>
          <p className="d-12-med text-gray-400 mt-1">
            의미 있는 학습 대화를 더 쌓아보세요!
          </p>
        </div>
      )}
    </div>
  );
};

export default AiBriefing;
