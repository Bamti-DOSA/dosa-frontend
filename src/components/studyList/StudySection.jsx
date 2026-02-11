import React from "react"; // useState, useEffect 제거 (안 쓰면 지우는 게 깔끔합니다)
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";

const StudySection = ({ category, models, filterType }) => {
  // 1. props로 받은 models를 기준으로 진행 중인 모델 필터링
  const displayModels =
    filterType === "진행 중인 학습"
      ? models.filter((m) => m.lastStudyDateStr)
      : models;

  // 2. 보여줄 모델이 없으면 아무것도 렌더링하지 않음
  if (displayModels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row mb-[88px] justify-between">
      <div className="flex flex-col justify-start items-start min-w-[200px]">
        <div className="text-[24px] font-semibold mb-[8px]">{category}</div>
        <div className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold cursor-pointer hover:text-black items-center b-16-semi">
          전체보기 <ArrowRight size={20} color="#5A5A5A" />
        </div>
      </div>

      <div className="flex flex-row gap-[16px] overflow-x-auto justify-end">
        {displayModels.map((model) => (
          <StudyCard
            key={model.objectId}
            objectId={model.objectId}
            category={model.type}
            title={model.name}
            date={model.lastStudyDateStr || "-"}
            isInProgress={!!model.lastStudyDateStr}
            thumbnailUrl={model.thumbnailUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default StudySection;
