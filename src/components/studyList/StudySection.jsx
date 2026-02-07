import SideBar from "./SideBar";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";

const StudySection = ({ category, models }) => {
  return (
    // justify-between 대신 justify-start로 변경하여 왼쪽으로 붙입니다.
    // gap을 주어 제목과 카드 사이의 간격을 조절합니다.
    <div className="flex flex-row mb-[88px] justify-between">
      {/* 제목 영역: 너비를 고정(예: 200px)하면 아래 섹션들과 세로 정렬이 맞습니다 */}
      <div className="flex flex-col justify-start items-start min-w-[200px]">
        <div className="text-[24px] font-semibold mb-[8px]">{category}</div>
        <div className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold cursor-pointer hover:text-black items-center b-16-semi">
          전체보기 <ArrowRight size={20} color="#5A5A5A" />
        </div>
      </div>

      {/* 카드 영역: justify-start로 카드들을 왼쪽부터 채웁니다 */}
      <div className="flex flex-row gap-[16px] grid-cols-3 overflow-x-auto justify-end">
        {models && models.length > 0 ? (
          models.slice(0, 3).map((model) => (
            <StudyCard
              key={model.objectId || model.id}
              category={model.type} // 서버 데이터 필드명에 맞춰 type으로 변경
              title={model.name}
              date={model.updatedAt || "2026. 02. 07"}
              isInProgress={model.status === "IN_PROGRESS"}
              imgUrl={model.thumbnailUrl} // 서버에서 주는 필드명으로 연결
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
