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

      const targetModels = filterType === "홈" ? models.slice(0, 3) : models;

      const updatedModels = await Promise.all(
        targetModels.map(async (model) => {
          try {
            const modelIdStr = String(model.objectId);
            const chatHistory = await getChatsByModel(modelIdStr);
            const memoHistory = await getMemosByModel(modelIdStr);

            // ⭐️ [날짜 로직] 최근 학습 날짜 계산
            let lastStudyDate = model.updatedAt || "-";
            const allActivities = [
              ...(chatHistory || []).map(
                (c) => new Date(c.timestamp || c.createdAt),
              ),
              ...(memoHistory || []).map(
                (m) => new Date(m.timestamp || m.createdAt),
              ),
            ].filter((date) => !isNaN(date));

            if (allActivities.length > 0) {
              const latest = new Date(Math.max(...allActivities));
              lastStudyDate = latest
                .toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\. /g, ". ")
                .slice(0, -1);
            }

            const isStarted =
              chatHistory?.length > 0 || memoHistory?.length > 0;

            return {
              ...model,
              computedStatus: isStarted ? "IN_PROGRESS" : "NOT_STARTED",
              lastStudyDate: lastStudyDate,
            };
          } catch (error) {
            return {
              ...model,
              computedStatus: "NOT_STARTED",
              lastStudyDate: model.updatedAt,
            };
          }
        }),
      );

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

  if (modelsWithStatus.length === 0 && filterType === "진행 중인 학습") {
    return null;
  }

  return (
    <div className="flex flex-row mb-[88px] justify-between">
      {/* ⭐️ 복구된 왼쪽 카테고리 영역 */}
      <div className="flex flex-col justify-start items-start min-w-[200px]">
        <div className="text-[24px] font-semibold mb-[8px]">{category}</div>
        <div className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold cursor-pointer hover:text-black items-center b-16-semi">
          전체보기 <ArrowRight size={20} color="#5A5A5A" />
        </div>
      </div>

      {/* 오른쪽 카드 리스트 영역 */}
      <div className="flex flex-row gap-[16px] overflow-x-auto justify-end">
        {modelsWithStatus.map((model) => (
          <StudyCard
            key={model.objectId}
            objectId={model.objectId}
            category={model.type}
            title={model.name}
            date={model.lastStudyDate} // 계산된 날짜 적용
            isInProgress={model.computedStatus === "IN_PROGRESS"}
            thumbnailUrl={model.thumbnailUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default StudySection;
