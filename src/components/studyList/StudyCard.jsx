import React from "react";
import { Bookmark, Calendar } from "lucide-react";

const StudyCard = ({
  category = "Robotics & Automation",
  title = "Drone",
  date = "2026. 02. 03",
  isInProgress = true,
}) => {
  return (
    <div className="bg-white flex flex-col w-[248px] h-[256px] p-[16px] rounded-[8px]">
      {/* 상단 화이트 카드 영역 */}
      <div className="h-[151px] relative overflow-hidden">
        <div className="flex justify-between items-start mb-[16px]">
          <span className="b-14-semi text-gray-7">{category}</span>
          <Bookmark />
        </div>
        {/* 드론 이미지 (이미지 경로를 실제 프로젝트에 맞춰 수정하세요) */}
        <div className="absolute bottom-[-10px] right-[-10px] w-[220px]">
          <img
            src="../src/assets/images/drone.png"
            alt="Drone"
            className="w-full object-contain"
          />
        </div>

        <h2 className="t-24-bold">{title}</h2>
      </div>

      {/* 하단 정보 및 버튼 영역 */}
      <div className="mt-[8px] px-[8px] flex-grow flex flex-col ">
        <div className="flex flex-row items-center justify-start gap-[6px] text-gray-6 ">
          <Calendar color="#888E96" size={12} />
          <span className="text-[12px] font-medium">{date}</span>
        </div>
        <div className="flex-grow" />
        <button
          className={
            "text-white py-[8px] w-full rounded-[8px] text-[16px] font-bold transition-colors " +
            " " +
            (isInProgress
              ? " bg-acc-red-light hover:bg-acc-red"
              : " bg-gray-7 hover:bg-gray-8")
          }
        >
          {isInProgress ? "학습 이어하기" : "학습 시작하기"}
        </button>
      </div>
    </div>
  );
};

export default StudyCard;
