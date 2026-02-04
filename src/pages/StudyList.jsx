import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";
import { ArrowRight } from "lucide-react";

const StudyList = () => {
  return (
    <>
      <div className="flex flex-row">
        <SideBar />
        <div className="ml-[275px] px-[60px] py-[46px] items-center justify-center w-full bg-gray-50">
          <div alt="제목" className="mt-[46px] t-24-semi ">
            학습 페이지
          </div>
          <div alt="진행 중인 학습 목록" className="mt-[110px] mb-[40x] ">
            <div className="flex flex-row justify-between items-center mb-[24px]">
              <div className="t-18-semi">진행 중인 학습</div>
              <div className="gap-[8px] flex flex-row text-[#5A5A5A] b-16-semi justify-center items-center">
                전체보기
                <ArrowRight color="#5A5A5A" />
              </div>
            </div>
            <div className="flex flex-row gap-[16px]">
              <StudyCard isInProgress={true} />
              <StudyCard />
              <StudyCard />
            </div>
          </div>

          <hr className="border-b-[1px] border-gray-5 mt-[24px] mb-[72px]" />

          <StudySection type={"Robotics & Automation"} />
          <StudySection type={"New Courses"} />
        </div>
      </div>
    </>
  );
};

export default StudyList;
