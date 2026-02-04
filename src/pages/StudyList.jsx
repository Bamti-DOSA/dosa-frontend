import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";

const StudyList = () => {
  return (
    <>
      <div className="flex flex-row">
        <SideBar />
        <div className="px-[60px] py-[46px] items-center justify-center w-full">
          <div alt="제목" className="mt-[46px] font-semibold text-[18px] ">
            학습 페이지
          </div>
          <div alt="진행 중인 학습 목록" className="mt-[110px] mb-[40x] ">
            <div className="flex flex-row justify-between items-center mb-[24px]">
              <div className="font-semibold text-[18px]">진행 중인 학습</div>
              <div className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold">
                전체보기
                <img src="../src/assets/icons/icon-arrow-right.svg" />
              </div>
            </div>
            <div className="flex flex-row gap-[16px]">
              <StudyCard isInProgress={true} />
              <StudyCard />
              <StudyCard />
            </div>
          </div>

          <hr className="border-t-[1px] border-[##9D9D9D] mt-[40px] mb-[80px]" />

          <StudySection type={"Robotics & Automation"} />
          <StudySection type={"New Courses"} />
        </div>
      </div>
    </>
  );
};

export default StudyList;
