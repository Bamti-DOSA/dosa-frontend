import SideBar from "./SideBar";
import StudyCard from "./StudyCard";
import { ArrowRight } from "lucide-react";

const StudySection = ({ type }) => {
  return (
    <>
      <div className="flex flex-row justify-between">
        <div alt="제목" className="flex flex-col gap-[16px]">
          <div className="text-[24px] font-semibold w-[150px]">{type}</div>
          <div className="gap-[8px] flex flex-row text-gray-7 font-semibold">
            전체보기
            <ArrowRight color="#5A5A5A" />
          </div>
        </div>
        <div
          alt="학습 카드 목록"
          className="flex flex-row gap-[16px] mb-[88px]"
        >
          <StudyCard isInProgress={true} />
          <StudyCard isInProgress={type === "진행 중인 학습"} />
          <StudyCard isInProgress={type === "진행 중인 학습"} />
        </div>
      </div>
    </>
  );
};

export default StudySection;
