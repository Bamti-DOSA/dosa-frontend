import React, { useState, useEffect } from "react";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";
import { getChatsByModel, getMemosByModel } from "../../api/aiDB";

const StudySection = ({ category, models, filterType }) => {
  const [modelsWithStatus, setModelsWithStatus] = useState([]);

  useEffect(() => {
    const updateStudyStatus = async () => {
      if (!models || models.length === 0) {
        setModelsWithStatus([]);
        return;
      }

      // "홈" 탭에서는 상위 3개만, 그 외에는 전체 모델을 대상으로 상태 확인
      const targetModels = filterType === "홈" ? models.slice(0, 3) : models;

      const updatedModels = await Promise.all(
        targetModels.map(async (model) => {
          try {
            const modelIdStr = String(model.objectId); // ✨ ID를 문자열로 통일

            // 1. 해당 모델의 채팅 내역 확인
            const chatHistory = await getChatsByModel(modelIdStr);
            const hasHistory = chatHistory && chatHistory.length > 0;

            // 2. 해당 모델의 메모 내역 확인
            const memoHistory = await getMemosByModel(modelIdStr);
            const hasMemos = memoHistory && memoHistory.length > 0;

            // 3. 채팅 혹은 메모 기록이 하나라도 있으면 '학습 중'으로 판단
            const isStarted = hasHistory || hasMemos;

            return {
              ...model,
              computedStatus: isStarted ? "IN_PROGRESS" : "NOT_STARTED",
            };
          } catch (error) {
            console.error(`DB 조회 실패 (${model.name}):`, error);
            return { ...model, computedStatus: "NOT_STARTED" };
          }
        }),
      );

      // 4. "진행 중인 학습" 탭일 때는 'IN_PROGRESS'인 모델만 필터링해서 보여줌
      let finalDisplay = updatedModels;
      if (filterType === "진행 중인 학습") {
        finalDisplay = updatedModels.filter(
          (m) => m.computedStatus === "IN_PROGRESS",
        );
      }

      setModelsWithStatus(finalDisplay);
    };

    updateStudyStatus();
  }, [models, filterType]);

  // 진행 중인 학습 탭에서 결과가 없으면 섹션 자체를 숨김
  if (modelsWithStatus.length === 0 && filterType === "진행 중인 학습") {
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
        {modelsWithStatus.length > 0 ? (
          modelsWithStatus.map((model) => (
            <StudyCard
              key={model.objectId}
              objectId={model.objectId}
              category={model.type}
              title={model.name}
              date={model.updatedAt || "2026. 02. 07"}
              // 계산된 상태에 따라 버튼과 UI가 변함
              isInProgress={model.computedStatus === "IN_PROGRESS"}
              imgUrl={model.thumbnailUrl}
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
