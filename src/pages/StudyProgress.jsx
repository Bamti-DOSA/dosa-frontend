import SideBar from "../components/studyList/SideBar.jsx";

const StudyProgress = () => {
  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="ml-[275px] px-[60px] py-[46px] items-center justify-center w-full bg-gray-50">
        <div alt="제목" className="mt-[46px] t-24-semi ">
          학습 페이지
        </div>
      </div>
    </div>
  );
};
export default StudyProgress;
