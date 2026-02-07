import React from "react";
import { Bookmark, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudyCard = ({ category, title, date, isInProgress = true, imgUrl, objectId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (objectId) {
      navigate(`/viewer/${objectId}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white flex flex-col w-[248px] h-[256px] p-[16px] rounded-[8px] cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* 상단 화이트 카드 영역 */}
      <div className="h-[151px] relative overflow-hidden">
        <div className="flex justify-between items-start mb-[16px]">
          <span className="b-14-semi text-gray-7">{category}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
              setIsBookmarked(!isBookmarked);
            }}
            className="transition-transform active:scale-90"
          >
            <Bookmark
              size={20}
              color={isBookmarked ? "#4B85E2" : "#ADB4BC"}
              fill={isBookmarked ? "#4B85E2" : "none"}
              strokeWidth={isBookmarked ? 2.5 : 2}
              className="transition-colors duration-200"
            />
          </button>
        </div>
        {/* 드론 이미지 */}
        <div className="absolute bottom-[-10px] right-[-10px] w-[220px]">
          <img src={imgUrl} alt={title} className="w-full object-contain" />
        </div>

        <h2 className="t-24-bold">{title}</h2>
      </div>

      {/* 하단 정보 및 버튼 영역 */}
      <div className="mt-[8px] flex-grow flex flex-col gap-[16px]">
        <div className="flex flex-row items-center justify-start gap-[6px] text-gray-6">
          <Calendar color="#888E96" size={12} />
          <span className="text-[12px] font-medium">{date}</span>
        </div>
        <button
          className={
            "text-white py-[8px] px-[10px] w-full rounded-[8px] b-16-semi transition-colors " +
            (isInProgress
              ? "bg-acc-red-light hover:bg-acc-red"
              : "bg-gray-7 hover:bg-gray-8")
          }
        >
          {isInProgress ? "학습 이어하기" : "학습 시작하기"}
        </button>
      </div>
    </div>
  );
};

export default StudyCard;
