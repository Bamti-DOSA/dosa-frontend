import React from "react";
import PartItem from "./PartItem";

const PartList = ({ parts, selectedId, onSelect }) => {
  if (!parts || parts.length === 0) {
    return <div className="text-gray-400 text-sm">부품 데이터가 없습니다.</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingBottom: "20px",
      }}
      className="
        overflow-y-auto 
        overflow-x-hidden 
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:display-none
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
