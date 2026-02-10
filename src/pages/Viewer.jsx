import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, MessageSquare, File, ChevronLeft } from "lucide-react";
import LeftContainer from "../components/viewer/LeftContainer";
import RightContainer from "../components/viewer/RightContainer";
import ReportExporter from "../components/viewer/report/ReportExporter";
import { getModelDetail } from "../api/modelAPI";
import { getModelById } from "../api/modelAPI";
import { formatSystemName } from "../utils/formatModelName";
import { fetchAiBriefing } from "../api/aiAPI";

const Viewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLightOn, setIsLightOn] = useState(true); // 조명 상태 추가

  const [currentPartForReport, setCurrentPartForReport] = useState(null);

  // API 데이터 관련
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState("note");
  const [aiChats, setAiChats] = useState([]);
  const [showAiNote, setShowAiNote] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState([]);

  // 리사이즈 관련
  const [rightPanelWidth, setRightPanelWidth] = useState(33);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const captureRef = useRef(null);

  const [modelName, setModelName] = useState("");

  const [currentChatMessages, setCurrentChatMessages] = useState([]);

  //PDF관련
  const [pdfSummary, setPdfSummary] = useState([]);

  useEffect(() => {
    const generateReportBriefing = async () => {
      // 유의미한 메시지가 쌓였을 때만 실행 (로그상 24개 등 기준)
      if (currentChatMessages.length < 2) return;

      try {
        const response = await fetchAiBriefing(currentChatMessages);

        if (response && response.summary) {
          const parsed =
            typeof response.summary === "string"
              ? JSON.parse(response.summary)
              : response.summary;

          // 보고서Exporter에 전달할 배열 형식으로 저장
          setPdfSummary([
            {
              title: parsed.title || "종합 학습 분석 브리핑",
              items: parsed.items || [],
              date: new Date().toLocaleDateString(),
            },
          ]);
        }
      } catch (error) {
        console.error("보고서용 브리핑 생성 실패:", error);
      }
    };

    generateReportBriefing();
  }, [currentChatMessages]);

  // 2. 새로운 요약을 배열에 추가하는 함수 (선택 사항: 더 명확한 관리를 위해)
  const handleAddPdfSummary = (newSummary) => {
    setPdfSummary((prev) => [
      ...prev,
      {
        ...newSummary,
        date: new Date().toLocaleDateString(), // 날짜 추가
      },
    ]);
  };

  // ✅ id 값 확인 로그 추가
  useEffect(() => {}, [id]);

  // API 데이터 로딩
  useEffect(() => {
    const loadModelData = async () => {
      if (!id) {
        console.error("❌ URL에 ID가 없습니다!");
        setError("잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getModelDetail(id);

        if (!data) {
          throw new Error(`ID ${id}에 해당하는 모델을 찾을 수 없습니다.`);
        }

        setApiData(data);
      } catch (err) {
        console.error("❌ 데이터 로딩 실패:", err);
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadModelData();
  }, [id]);

  useEffect(() => {
    const fetchAndSetModelName = async () => {
      if (!id) return;
      try {
        const currentModel = await getModelById(id);
        if (currentModel && currentModel.name) {
          // "Machine Vice" -> "MACHINE_VICE" 형태로 변환
          const formattedName = formatSystemName(currentModel.name);
          setModelName(formattedName);
        }
      } catch (err) {
        console.error("모델명 로드 실패:", err);
      }
    };
    fetchAndSetModelName();
  }, [id]);

  // 리사이즈 핸들러 (접기 로직 추가)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = rightPanelWidth;
    const containerWidth = containerRef.current?.offsetWidth || 1;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newWidth = startWidth + deltaPercent;

      // 최소값: 15% 미만이면 접기
      if (newWidth < 15) {
        setIsCollapsed(true);
        setRightPanelWidth(33); // 다시 펼칠 때를 위해 기본값 유지
        return;
      }

      // 최대값 제한
      if (newWidth > 50) newWidth = 50;
      if (newWidth < 20) newWidth = 20;

      setRightPanelWidth(newWidth);
      setIsCollapsed(false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMaximizeAiNote = () => {
    setShowAiNote(false);
    setActiveTab("ai");
  };

  const handleRestore = (tab) => {
    setIsCollapsed(false);
    if (tab) setActiveTab(tab);
  };

  // const briefingHistory = aiChats
  //   .map((chat) => {
  //     try {
  //       // AiBriefing.jsx와 동일한 파싱 로직 적용
  //       const parsed =
  //         typeof chat.summary === "string"
  //           ? JSON.parse(chat.summary)
  //           : chat.summary;
  //       return {
  //         title: parsed?.title || chat.title || "학습 브리핑",
  //         items: parsed?.items || [],
  //         date: new Date(chat.lastUpdated).toLocaleDateString(),
  //       };
  //     } catch (e) {
  //       return null;
  //     }
  //   })
  //   .filter(Boolean);

  // 로딩 중
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bg-1">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-1"></div>
          <div className="text-gray-500">모델 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error || !apiData) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-bg-1">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500 text-xl font-bold">
            {error || "모델 데이터를 찾을 수 없습니다."}
          </div>
          <div className="text-sm text-gray-400">요청한 ID: {id}</div>
          <button
            onClick={() => navigate("/study-list")}
            className="mt-4 px-6 py-3 bg-main-1 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            학습 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-bg-1 flex flex-col overflow-hidden font-sans select-none">
      {/* 헤더 */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // 부모 요소로의 이벤트 전파 방지
              navigate("/study-list", { replace: true }); // 히스토리 스택 꼬임 방지
            }}
            className="p-2 rounded-[8px] hover:bg-main-1/30 transition-colors"
          >
            <ChevronLeft
              className="text-gray-700"
              size={24}
              strokeWidth={2.5}
            />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-5 rounded-lg"></div>
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">
              {apiData.name}
            </span>
          </div>
        </div>

        <ReportExporter
          captureRef={captureRef}
          currentPart={currentPartForReport}
          modelId={id} // ✅ id가 제대로 있는지 확인
          modelName={modelName}
          chatHistory={pdfSummary}
        />
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 px-6 pb-6 min-h-0">
        <div
          ref={containerRef}
          className="w-full h-full flex bg-bg-1 relative gap-4"
        >
          {/* 1. Left Container */}
          <div
            ref={captureRef}
            className="flex-1 h-full min-w-0 transition-all duration-300 ease-out"
          >
            <LeftContainer
              onPartSelect={(part) => setCurrentPartForReport(part)}
              apiData={apiData}
              showAiNote={showAiNote}
              setShowAiNote={setShowAiNote}
              onMaximize={handleMaximizeAiNote}
              floatingMessages={floatingMessages}
              setFloatingMessages={setFloatingMessages}
              modelId={id}
              isLightOn={isLightOn}
              setIsLightOn={setIsLightOn}
            />
          </div>

          {/* 2. Right Container */}
          <div
            style={{
              width: isCollapsed ? "0px" : `${rightPanelWidth}%`,
              opacity: isCollapsed ? 0 : 1,
              display: isCollapsed ? "none" : "block",
            }}
            className="h-full relative min-w-[300px] transition-all duration-300"
          >
            {/* 리사이저 */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize flex items-center justify-center z-50 hover:bg-black/5 active:bg-black/10 transition-colors rounded-full ${isDragging ? "bg-black/10" : ""}`}
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
              modelId={id}
              modelName={modelName}
              onMessagesUpdate={setCurrentChatMessages}
              setPdfSummary={setPdfSummary}
            />
          </div>

          {/* 3. Dock */}
          {isCollapsed && (
            <div className="w-16 h-full flex flex-col items-center shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-2 flex flex-col gap-3">
                <button
                  onClick={() => handleRestore("ai")}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-bg-1 hover:text-main-1 transition-all"
                  title="AI 채팅"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  onClick={() => handleRestore("note")}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-bg-1 hover:text-main-1 transition-all"
                  title="노트"
                >
                  <File size={20} />
                </button>

                <div className="w-full h-[1px] bg-gray-100 my-1"></div>

                <button
                  onClick={() => handleRestore()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-bg-1 hover:text-main-1 transition-all"
                  title="패널 펼치기"
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
