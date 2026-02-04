import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Share, MessageSquare, FileText, ChevronLeft } from "lucide-react"; 
import file from "../assets/icons/icon-file.svg";

import LeftContainer from "../components/viewer/LeftContainer";
import RightContainer from "../components/viewer/RightContainer";
import AiNote from "../components/viewer/ai/AiNote"; 

const Viewer = () => {
  // --- 상태 관리 ---
  const [rightPanelWidth, setRightPanelWidth] = useState(30);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // 탭 상태 및 팝업 상태
  const [activeTab, setActiveTab] = useState('ai');
  const [showAiNote, setShowAiNote] = useState(false);

  // 팝업 채팅 데이터 (임시 저장소)
  const [floatingMessages, setFloatingMessages] = useState([]);

  // 전체 AI 채팅 목록 (중앙 관리)
  const [aiChats, setAiChats] = useState([
    { id: 'a1', date: '4. Feb 10:00', title: 'BLDC 모터 작동법 질문', messages: [] },
  ]);

  const containerRef = useRef(null); 
  const MIN_WIDTH_PERCENT = 15; 
  const DEFAULT_WIDTH_PERCENT = 30; 

  // --- 드래그 핸들러 ---
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    const newWidthPx = containerRect.right - e.clientX;
    const newWidthPercent = (newWidthPx / containerWidth) * 100;

    if (newWidthPercent > 60) return;

    setRightPanelWidth(newWidthPercent);

  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);

    if (rightPanelWidth < MIN_WIDTH_PERCENT) {
      setIsCollapsed(true);
      setRightPanelWidth(DEFAULT_WIDTH_PERCENT); 
    }
  }, [isDragging, rightPanelWidth]);

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

  // --- 복구 및 탭 전환 핸들러 ---
  const handleRestore = (targetTab) => {
    setIsCollapsed(false);
    setRightPanelWidth(DEFAULT_WIDTH_PERCENT);
    if (targetTab) {
        setActiveTab(targetTab);
    }
  };

  // --- 팝업 확대 핸들러 (내용 이관) ---
  const handleMaximizeAiNote = () => {
    setShowAiNote(false); // 팝업 닫기
    setIsCollapsed(false); // 패널 열기
    setRightPanelWidth(DEFAULT_WIDTH_PERCENT);
    setActiveTab('ai'); // AI 탭으로 이동

    // 대화 내용이 있다면 새 채팅으로 등록
    if (floatingMessages.length > 0) {
        const newChatSession = {
            id: Date.now().toString(),
            date: 'Just now', 
            title: floatingMessages[0].text.slice(0, 15) + (floatingMessages[0].text.length > 15 ? "..." : ""),
            messages: floatingMessages 
        };
        setAiChats(prev => [newChatSession, ...prev]);
        setFloatingMessages([]); // 초기화
    }
  };

  // --- 데이터 ---
  const partsData = [
    { id: "main_frame", name: "메인 프레임", description: "OnRobot Soft Gripper는 다양한 범위의 불규칙한 형태와 연약한 물체를 잡을 수 있어 식품과 음료 생산은 물론, 제조나 포장 산업에서의 픽앤플레이스 애플리케이션에 적합합니다.", model: "/models/Main frame.glb" },
    { id: "arm_gear", name: "암 기어", description: "모터 본체와 프레임을 연결하는 핵심 부품으로, 내부 기어 시스템을 통해 동력 손실 없이 날개에 강력한 회전 에너지를 전달합니다.", model: "/models/Arm gear.glb" },
    { id: "blade", name: "임펠러 블레이드", description: "공기역학적 설계를 통해 낮은 소음으로도 최대의 양력을 발생시킵니다. 수직 이착륙과 정밀한 방향 전환을 가능하게 하는 핵심 추진체입니다.", model: "/models/Impellar Blade.glb" },
    { id: "leg", name: "랜딩 레그", description: "이착륙 시 발생하는 물리적 충격을 흡수하여 정밀 센서와 메인 프레임을 보호합니다. 경사진 지면에서도 기체가 안정적으로 거치되도록 돕습니다.", model: "/models/Leg.glb" },
    { id: "beater_disc", name: "비터 디스크", description: "모터 상단에서 고속 회전 시 무게 중심을 완벽하게 잡아줍니다. 동시에 공기 흐름을 유도하여 모터에서 발생하는 열을 빠르게 식혀주는 역할을 합니다.", model: "/models/Beater disc.glb" },
    { id: "gearing", name: "기어링 시스템", description: "모터의 고속 회전을 주행에 적합한 힘으로 변환합니다. 각 축에 전달되는 동력을 일정하게 유지하여 부드럽고 안정적인 비행 성능을 완성합니다.", model: "/models/Gearing.glb" },
    { id: "nut_screw", name: "고정용 너트/볼트", description: "강한 진동에도 각 부품이 분리되지 않도록 단단히 고정합니다. 드론의 전체적인 강성을 높여 비행 중 발생할 수 있는 결합 이탈 사고를 방지합니다.", model: "/models/Nut.glb" },
    { id: "xyz_sensor", name: "XYZ 자이로 센서", description: "3축 기울기를 실시간으로 정밀하게 감지하여 비행 안정성을 유지합니다. 외부 환경 변화에도 드론이 수평을 잃지 않도록 돕는 브레인 역할을 합니다.", model: "/models/xyz.glb" },
  ];

  return (
    <div className="w-screen h-screen bg-[#E2E3E7] flex flex-col overflow-hidden font-sans select-none">
      
      {/* 팝업 */}
      {showAiNote && (
        <AiNote 
            onClose={() => setShowAiNote(false)} 
            onMaximize={handleMaximizeAiNote} 
            messages={floatingMessages}       
            setMessages={setFloatingMessages} 
        />
      )}

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
          
          {/* 1. Left Container */}
          <div className="flex-1 h-full min-w-0 transition-all duration-300 ease-out">
             <LeftContainer partsData={partsData} />
          </div>

          {/* 2. Right Container */}
          <div 
            style={{ 
                width: isCollapsed ? '0px' : `${rightPanelWidth}%`,
                opacity: isCollapsed ? 0 : 1,
                display: isCollapsed ? 'none' : 'block' 
            }} 
            className="h-full relative min-w-[300px]"
          >
             {/* 리사이저 */}
             <div
                className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize flex items-center justify-center z-50 hover:bg-black/5 active:bg-black/10 transition-colors rounded-full ${isDragging ? 'bg-black/10' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
            </div>

             <RightContainer 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onOpenAiNote={() => setShowAiNote(true)} 
                isAiNoteOpen={showAiNote} 
                aiChats={aiChats}         
                setAiChats={setAiChats}   
             />
          </div>

          {/* 3. Dock */}
          {isCollapsed && (
            <div className="w-16 h-full flex flex-col items-center animate-fade-in-right shrink-0">
                <div className="bg-white rounded-2xl border border-gray-200 p-2 flex flex-col gap-3">
                    <button 
                        onClick={() => handleRestore('ai')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-bg-1 hover:text-main-1 transition-all group relative"
                    >
                        <MessageSquare size={20} />
                    </button>
                    <button 
                        onClick={() => handleRestore('note')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-bg-1 hover:text-main-1 transition-all group relative"
                    >
                        <img src={file} alt="note" className="w-5 h-5" />
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