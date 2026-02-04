import React from "react";

const PartDetail = ({ selectedPart }) => {
  if (!selectedPart) return null;

  return (
    <div
      style={{
        display: "flex",
        /* 1. 가로로 더 길게 늘리기: 비율을 80% -> 90%로 확장 */
        width: "90%", // 화면 너비의 90%까지 사용
        maxWidth: "1200px", // 기존 990px에서 1200px로 대폭 확장

        /* 2. 피그마 기본 사양 유지 */
        minHeight: "200px",
        padding: "30px 40px", // 창이 커진 만큼 내부 패딩도 조금 더 늘려주면 여유로워 보여요
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
        borderRadius: "12px", // 창이 커지면 곡률도 살짝 더 주는 게 예쁩니다
        background: "#FBFDFF",

        /* 3. 배치 설정 */
        position: "absolute",
        bottom: "3vh",
        left: "0%",
        transform: "translateX(-50%)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
      }}
      className="z-30 pointer-events-auto shadow-sm transition-all duration-500 ease-in-out"
    >
      {/* 1. 제목 (name) */}
      <h2 className="text-2xl font-bold text-gray-800">{selectedPart.name}</h2>

      {/* 2. 한 줄 요약 (summary) - 제목 바로 아래 배치 */}
      <p className="text-lg text-blue-600 font-medium mb-4">
        {selectedPart.summary || "부품 요약 정보가 없습니다."}
      </p>

      {/* 3. 상세 정보 그리드 */}
      <div className="w-full grid grid-cols-[100px_1fr] gap-y-4 gap-x-6">
        {/* 재질 */}
        <span className="font-bold text-gray-400 text-lg">재질</span>
        <span className="text-gray-700 text-lg">
          {selectedPart.material || "-"}
        </span>

        {/* 역할 */}
        <span className="font-bold text-gray-400 text-lg">역할</span>
        <span className="text-gray-700 text-lg">
          {selectedPart.role || "-"}
        </span>

        {/* 상세 설명 (description) */}
        <span className="font-bold text-gray-400 text-lg">설명</span>
        <span className="text-gray-700 text-lg leading-relaxed">
          {selectedPart.description || "-"}
        </span>

        {/* 기타 */}
        <span className="font-bold text-gray-400 text-lg">기타</span>
        <span className="text-gray-700 text-lg italic">
          {selectedPart.feature || "-"}
        </span>
      </div>
    </div>
  );
};

export default PartDetail;
