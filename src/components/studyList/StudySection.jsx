import React, { useState, useEffect } from "react";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";
import { getChatsByModel } from "../../api/aiDB"; // IndexedDB 접근 함수

const StudySection = ({ category, models, filterType }) => {
  const [modelsWithStatus, setModelsWithStatus] = useState([]);

  useEffect(() => {
    const updateStudyStatus = async () => {
      if (!models || models.length === 0) {
        setModelsWithStatus([]);
        return;
      }

      // 각 모델별로 IndexedDB를 조회하여 진행 상태 확인
      const updatedModels = await Promise.all(
        models.slice(0, 3).map(async (model) => {
          try {
            // 해당 모델의 채팅 내역이 있는지 확인
            const chatHistory = await getChatsByModel(String(model.objectId));

            // 기록이 존재하고 메시지가 1개라도 있으면 '학습 중(IN_PROGRESS)'으로 판단
            const hasHistory = chatHistory && chatHistory.length > 0;

            return {
              ...model,
              computedStatus: hasHistory ? "IN_PROGRESS" : "NOT_STARTED",
            };
          } catch (error) {
            console.error(`DB 조회 실패 (${model.name}):`, error);
            return { ...model, computedStatus: "NOT_STARTED" };
          }
        }),
      );
      // 2. ✨ 핵심: "진행 중인 학습" 탭일 때는 'IN_PROGRESS'만 필터링
      let finalDisplay = updatedModels;
      if (filterType === "진행 중인 학습") {
        finalDisplay = updatedModels.filter(
          (m) => m.computedStatus === "IN_PROGRESS",
        );
      }

      setModelsWithStatus(finalDisplay);
    };

    updateStudyStatus();
  }, [models, filterType]); // filterType이 바뀔 때도 다시 실행되도록 추가

  // 데이터가 없을 때 표시할 내용 (필터링 결과가 0개일 때)
  if (modelsWithStatus.length === 0 && filterType === "진행 중인 학습") {
    return null; // 혹은 "진행 중인 학습이 없습니다" 메시지 출력
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
        {modelsWithStatus.length > 0 ? (
          modelsWithStatus.map((model) => (
            <StudyCard
              key={model.objectId}
              objectId={model.objectId}
              category={model.type}
              title={model.name}
              date={model.updatedAt || "2026. 02. 07"}
              // 👇 DB에서 계산된 상태 적용
              isInProgress={model.computedStatus === "IN_PROGRESS"}
              thumbnailUrl={model.thumbnailUrl}
            />
          ))
        ) : (
          <div className="text-gray-400 self-center">
            해당하는 학습이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySection;
