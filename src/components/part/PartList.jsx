import React from "react";
import PartItem from "./PartItem";

const PartList = ({ parts, selectedId, onSelect }) => {
  if (!parts || parts.length === 0) {
    return <div className="text-gray-400 text-sm">부품 데이터가 없습니다.</div>;
  }

  return (
    <div
      style={{
        width: "97px",
        position: "absolute",
        left: "53px",
        top: "50%",
        transform: "translateY(-50%)",
        maxHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        gap: "8.24px",
        opacity: 1,
      }}
      className="
        overflow-y-auto 
        overflow-x-hidden 
        z-20
        
        /* 1. 크롬, 사파리, 엣지에서 스크롤바 숨기기 */
        [&::-webkit-scrollbar]:display-none
        
        /* 2. 파이어폭스에서 스크롤바 숨기기 */
        [scrollbar-width:none]
        
        /* 3. IE, 구형 엣지에서 스크롤바 숨기기 */
        [-ms-overflow-style:none]
      "
    >
      {parts.map((part) => (
        <PartItem
          key={part.id} // 👈 key 추가
          part={part}
          isSelected={selectedId === part.id}
          onClick={() => onSelect(part.id)}
        />
      ))}
    </div>
  );
};

export default PartList;
