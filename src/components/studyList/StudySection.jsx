import React, { useState, useEffect } from "react";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";
import { getChatsByModel, getMemosByModel } from "../../api/aiDB"; // IndexedDB 접근 함수

const StudySection = ({ category, models, filterType }) => {
  const [modelsWithStatus, setModelsWithStatus] = useState([]);

  // 데이터가 없을 때 표시할 내용 (필터링 결과가 0개일 때)
  if (modelsWithStatus.length === 0 && filterType === "진행 중인 학습") {
    return null; // 혹은 "진행 중인 학습이 없습니다" 메시지 출력
  }

  const displayModels =
    filterType === "진행 중인 학습"
      ? models.filter((m) => m.lastStudyDateStr) // 날짜가 있다는 것은 진행 이력이 있다는 뜻
      : models;

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
            // StudyList에서 넘겨준 lastStudyDateStr를 우선 사용
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
