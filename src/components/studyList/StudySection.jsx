import SideBar from "./SideBar";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";

const StudySection = ({ category, models }) => {
  return (
    <div className="flex flex-row mb-[88px] justify-between">
      <div className="flex flex-col justify-start items-start min-w-[200px]">
        <div className="text-[24px] font-semibold mb-[8px]">{category}</div>
        <div className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold cursor-pointer hover:text-black items-center b-16-semi">
          전체보기 <ArrowRight size={20} color="#5A5A5A" />
        </div>
      </div>

      <div className="flex flex-row gap-[16px] grid-cols-3 overflow-x-auto justify-end">
        {models && models.length > 0 ? (
          models.slice(0, 3).map((model) => (
            <StudyCard
              key={model.objectId}
              objectId={model.objectId}
              category={model.type}
              title={model.name}
              date={model.updatedAt || "2026. 02. 07"}
              isInProgress={model.status === "IN_PROGRESS"}
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
