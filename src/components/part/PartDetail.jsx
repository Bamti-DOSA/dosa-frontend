import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { MATERIAL_LIST } from "../../db/materialDB";

const PartDetail = ({ selectedPart, onMaterialSelect, onHeightChange }) => {
  const [leftWidth, setLeftWidth] = useState(65);
  const [height, setHeight] = useState(200);
  const [isHidden, setIsHidden] = useState(false);
  // 현재 선택된 재질의 이름과 상세 설명을 상태로 관리합니다
  const [selectedMaterial, setSelectedMaterial] = useState({
    name: "기본 재질",
    desc: "기체 설계 시 표준으로 적용되는 경량 합성 소재입니다.",
  });

  // 높이가 바뀔 때마다 부모(LeftContainer)에게 알림
  useEffect(() => {
    if (onHeightChange) {
      // 숨겨진 상태일 때는 최소 높이(40)만 반영, 아닐 때는 현재 높이 반영
      onHeightChange(isHidden ? 40 : height);
    }
  }, [height, isHidden, onHeightChange]);

  // 💡 2. 높이 제한 설정: 슬라이더 전까지만 올라가도록 maxHeight 조절
  // 윈도우 높이에 따라 적절히 제한 (예: 264px)
  const handleResize = (moveE) => {
    const deltaY = startY - moveE.clientY;
    const newHeight = startHeight + deltaY;
    // 최대 높이를 264px 정도로 제한하여 슬라이더 영역을 지키도록 함
    setHeight(Math.min(Math.max(newHeight, 120), 264));
  };

  // 재질 데이터 예시 (나중에 실제 데이터로 교체하세요)
  // const materialList = [
  //   {
  //     id: 1,
  //     name: "카본 파이버",
  //     desc: "초경량 고강성 소재로 드론의 비행 시간을 극대화합니다.",
  //     props: { color: "#1A1A1A", metalness: 0.8, roughness: 0.2 }
  //   },
  //   {
  //     id: 2,
  //     name: "알루미늄 6061",
  //     desc: "내식성이 뛰어나고 구조적 강도가 우수한 항공 등급 금속입니다.",
  //     props: { color: "#D1D5DB", metalness: 0.9, roughness: 0.1 }
  //   },
  //   {
  //     id: 3,
  //     name: "강화 플라스틱",
  //     desc: "충격 흡수력이 뛰어나며 유지보수 비용이 저렴한 범용 소재입니다.",
  //     props: { color: "#4B5563", metalness: 0.2, roughness: 0.8 }
  //   },
  //   {
  //     id: 4,
  //     name: "티타늄 합금",
  //     desc: "극한의 환경에서도 변형이 없는 최고급 고강도 합금입니다.",
  //   },
  //   {
  //     id: 5,
  //     name: "매트 블랙 코팅",
  //     desc: "빛 반사를 최소화하여 스텔스 비행 및 고급스러운 외관을 제공합니다.",
  //   },
  // ];

  // 마우스 드래그 스크롤을 위한 Ref와 상태
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 드래그 시작
  const onDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // 드래그 중
  const onDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 드래그 종료
  const onDragEnd = () => {
    setIsDragging(false);
  };

  if (!selectedPart) return null;

  return (
    <motion.div
      animate={{ y: isHidden ? height - 40 : 0 }}
      style={{
        display: "flex",
        height: `${height}px`,
        position: "absolute",
        width: "100%",
        bottom: "0px",
        zIndex: 40,
        gap: "2px",
        padding: "0 10px 10px 10px",
      }}
      className="pointer-events-auto"
    >
      {/* --- 상단 테두리 핸들 --- */}
      <div
        style={{ cursor: "ns-resize" }}
        className="absolute -top-3 left-0 right-0 h-10 z-50 flex items-center justify-center group"
        onMouseDown={(e) => {
          if (isHidden) return;
          const startY = e.clientY;
          const startHeight = height;
          const onMouseMove = (moveE) => {
            const deltaY = startY - moveE.clientY;
            const newHeight = startHeight + deltaY;
            setHeight(Math.min(Math.max(newHeight, 150), 200));
          };
          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      >
        <div className="w-16 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors" />
      </div>

      {/* 1. 왼쪽 카드: 이름 & 설명 */}
      <div
        style={{ width: `${leftWidth}%` }}
        className="bg-[#EDF2F6] backdrop-blur-md rounded-lg pt-5 pr-3 pb-5 pl-6 border border-white/40 flex flex-col min-h-0 overflow-hidden shadow-none"
      >
        <div className="shrink-0 mb-2">
          <h2 className="t-18-bold text-gray-9">{selectedPart.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
          <p className="text-gray-8 b-16-med leading-relaxed whitespace-pre-line">
            {selectedPart.description}
          </p>
        </div>
      </div>

      {/* 2. 중앙 리사이즈 핸들 */}
      <div
        className="w-2 cursor-col-resize flex items-center justify-center group shrink-0"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = leftWidth;
          const onMouseMove = (moveE) => {
            const deltaX = ((moveE.clientX - startX) / window.innerWidth) * 100;
            setLeftWidth(Math.min(Math.max(startWidth + deltaX, 30), 80));
          };
          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        }}
      >
        <div className="w-[2px] h-12 bg-gray-200 group-hover:bg-blue-500 rounded-full transition-colors" />
      </div>

      {/* 3. 오른쪽 카드: 재질 선택 (스크롤 개선) */}
      <div
        style={{ width: `${100 - leftWidth}%` }}
        className="bg-[#EDF2F6] backdrop-blur-md rounded-lg p-5 border border-white/40 flex flex-col min-h-0 overflow-hidden"
      >
        <h3 className="b-14-med text-[#888E96] mb-1 shrink-0">재질</h3>

        <div className="flex-1 overflow-y-auto min-h-0 mb-4 pr-2 custom-scrollbar">
          <p className="t-18-bold text-gray-9">{selectedMaterial.name}</p>
          <p className="b-14-med text-[#3A3C40] mt-1 leading-snug">
            {selectedMaterial.desc}
          </p>
        </div>

        {/* 재질 구체 리스트 (하단 고정) */}
        <div
          ref={scrollRef}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          className={`flex gap-3 overflow-x-auto pb-2 shrink-0 no-scrollbar select-none
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
        >
          {MATERIAL_LIST.map((mat) => (
            <div
              key={mat.id}
              onClick={() => {
                if (!isDragging) {
                  // 1. UI 표시를 위해 상태 업데이트 (비동기)
                  setSelectedMaterial(mat);

                  // 2. 부모에게는 '상태'가 아니라 '클릭한 놈(mat)'을 직접 전달 (즉시 반영)
                  if (mat.id === 0) {
                    onMaterialSelect(null);
                  } else {
                    // 🚨 selectedMaterial.props가 아니라 mat.materialProps를 직접 씁니다!
                    const propsToSend = mat.materialProps || mat.props;
                    if (onMaterialSelect && propsToSend) {
                      onMaterialSelect(propsToSend);
                    }
                  }
                }
              }}
              className={`flex-shrink-0 w-12 h-12 rounded-xl transition-all border-px bg-gray-3 p-2
                ${selectedMaterial.name === mat.name ? "border border-main-1 shadow-md" : "border-transparent opacity-70"}
              `}
            >
              <img
                src={mat.img}
                alt={mat.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PartDetail;
