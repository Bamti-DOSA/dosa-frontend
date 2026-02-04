import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Share, MessageSquare, FileText, ChevronLeft } from "lucide-react"; 

import LeftContainer from "../components/viewer/LeftContainer";
import RightContainer from "../components/viewer/RightContainer";

const Viewer = () => {
  // --- 상태 관리 ---
  const [rightPanelWidth, setRightPanelWidth] = useState(30); // % 단위
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isDragging, setIsDragging] = useState(false); 
  const [activeTab, setActiveTab] = useState('ai');

  const containerRef = useRef(null); 

  // --- 상수 설정 ---
  const MIN_WIDTH_PERCENT = 15; // 15% 미만이면 접힘
  const DEFAULT_WIDTH_PERCENT = 30; // 복구 시 너비

  // --- 드래그 핸들러 ---
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // 마우스 위치 기준으로 오른쪽 패널 너비 계산
    // (컨테이너 오른쪽 끝 - 현재 마우스 X 좌표) = 오른쪽 패널의 너비
    const newWidthPx = containerRect.right - e.clientX;
    const newWidthPercent = (newWidthPx / containerWidth) * 100;

    // 최대 60%까지만 늘어나게 제한
    if (newWidthPercent > 60) return;

    setRightPanelWidth(newWidthPercent);

  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);

    // 드래그 종료 시, 너무 작으면 접어버리기 (Snap)
    if (rightPanelWidth < MIN_WIDTH_PERCENT) {
      setIsCollapsed(true);
      setRightPanelWidth(DEFAULT_WIDTH_PERCENT); 
    }
  }, [isDragging, rightPanelWidth]);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- 복구 핸들러 ---
  const handleRestore = (targetTab) => {
    setIsCollapsed(false);
    setRightPanelWidth(DEFAULT_WIDTH_PERCENT);
    
    // 인자가 있으면 해당 탭으로 변경 (아이콘 클릭 시)
    // 인자가 없으면(그냥 화살표 클릭 등) 기존 탭 유지
    if (targetTab) {
        setActiveTab(targetTab);
    }
  };

  // --- 데이터 (생략 - 기존과 동일) ---
  const partsData = [
    { id: "main_frame", name: "메인 프레임", description: "설명...", model: "/models/Main frame.glb" },
    { id: "arm_gear", name: "암 기어", description: "설명...", model: "/models/Arm gear.glb" },
    { id: "blade", name: "임펠러 블레이드", description: "설명...", model: "/models/Impellar Blade.glb" },
    { id: "leg", name: "랜딩 레그", description: "설명...", model: "/models/Leg.glb" },
    { id: "beater_disc", name: "비터 디스크", description: "설명...", model: "/models/Beater disc.glb" },
    { id: "gearing", name: "기어링 시스템", description: "설명...", model: "/models/Gearing.glb" },
    { id: "nut_screw", name: "고정용 너트/볼트", description: "설명...", model: "/models/Nut.glb" },
    { id: "xyz_sensor", name: "XYZ 자이로 센서", description: "설명...", model: "/models/xyz.glb" },
  ];

  return (
    <div className="w-screen h-screen bg-[#E2E3E7] flex flex-col overflow-hidden font-sans select-none">
      
      {/* 헤더 */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded hover:bg-gray-200 transition-colors">
            <Menu className="text-gray-700" size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E2E3E7] rounded-lg shadow-sm"></div>
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">Robot Gripper</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <Share size={18} />
          <span>내보내기</span>
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 pb-6 min-h-0">
        <div 
            ref={containerRef}
            className="w-full h-full flex bg-[#E2E3E7] relative gap-4"
        >
          
          {/* 1. 왼쪽 컨테이너 (자동 채움) */}
          <div className="flex-1 h-full min-w-0 transition-all duration-300 ease-out">
             <LeftContainer partsData={partsData} />
          </div>

          {/* 2. 오른쪽 컨테이너 영역 (가변 너비) */}
          {/* Collapse 상태가 아닐 때 */}
          <div 
            style={{ 
                width: isCollapsed ? '0px' : `${rightPanelWidth}%`,
                opacity: isCollapsed ? 0 : 1,
                display: isCollapsed ? 'none' : 'block' 
            }} 
            className="h-full relative min-w-[300px]" // min-w로 최소한의 UI 깨짐 방지
          >
             <div
                className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize flex items-center justify-center z-50 hover:bg-black/5 active:bg-black/10 transition-colors rounded-full ${isDragging ? 'bg-black/10' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
            </div>

             <RightContainer activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* 3. 접혔을 때 나타나는 아이콘 도크 (Dock) */}
          {isCollapsed && (
            <div className="w-16 h-full flex flex-col items-center animate-fade-in-right shrink-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex flex-col gap-3">
                    <button 
                        onClick={() => handleRestore('note')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm group relative"                    >
                        <FileText size={20} />
                        {/* 툴팁 */}
                        <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            메모장 열기
                        </span>
                    </button>
                    <button 
                        onClick={() => handleRestore('ai')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm group relative"
                    >
                        <MessageSquare size={20} />
                         <span className="absolute right-full mr-2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            AI 채팅 열기
                        </span>
                    </button>
                    
                    <div className="w-full h-[1px] bg-gray-100 my-1"></div>

                    <button 
                        onClick={() => handleRestore()} 
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
                    >
                         <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Viewer;