import React from "react";

const StudyCard = ({
  category = "Robotics & Automation",
  title = "Drone",
  date = "2026. 02. 03",
  isInProgress = true,
}) => {
  return (
    <div className="bg-[#EBEBEB] flex flex-col w-[280px] h-[320px] px-[8px] pt-[8px] pb-[16px] rounded-[8px]">
      {/* 상단 화이트 카드 영역 */}
      <div className="bg-white rounded-[8px] p-[12px] h-[200px] relative overflow-hidden">
        <div className="flex justify-between items-end">
          <span className="text-[18px] font-bold text-black">{category}</span>
          <img
            src="../src/assets/icons/icon-bookmark.svg"
            alt="bookmark"
            className="w-[24px] h-[24px]"
          />
        </div>

        <h2 className="text-[32px] font-extrabold text-black mt-[24px] leading-tight">
          {title}
        </h2>

        {/* 드론 이미지 (이미지 경로를 실제 프로젝트에 맞춰 수정하세요) */}
        <div className="absolute bottom-[-10px] right-[-10px] w-[220px]">
          <img
            src="../src/assets/images/drone.png"
            alt="Drone"
            className="w-full object-contain"
          />
        </div>
      </div>

      {/* 하단 정보 및 버튼 영역 */}
      <div className="mt-[8px] px-[8px] flex-grow flex flex-col ">
        <div className="flex flex-row items-center gap-[6px] text-[#666666] ">
          <img
            src="../src/assets/icons/icon-calendar.svg"
            alt="calendar"
            className="w-[12px] h-[12px]"
          />
          <span className="text-[12px] font-medium">{date}</span>
        </div>
        <div className="flex-grow" />
        <button
          className={
            "text-white py-[8px] w-full rounded-[8px] text-[16px] font-bold transition-colors " +
            " " +
            (isInProgress
              ? " bg-[#DB7670] hover:bg-[#c9655f]"
              : " bg-[#999999] hover:bg-[#888888]")
          }
        >
          {isInProgress ? "학습 이어하기" : "학습 시작하기"}
        </button>
      </div>
    </div>
  );
};

export default StudyCard;
