import React, { useState, useEffect, useRef } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";
import AssistantAi from "../ai/AssistantAi";
import { getLastChatId, saveChat } from "../../../api/aiDB";
import { getModelById } from "../../../api/modelAPI";
import { formatSystemName } from "../../../utils/formatModelName";

const AiNote = ({ onClose, onMaximize, modelId }) => {
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 190,
    y: window.innerHeight / 2 - 270,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);

  // 상태 초기화
  const [currentChatId, setCurrentChatId] = useState(null);
  const [modelName, setModelName] = useState("");
  const [isReady, setIsReady] = useState(false);

  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef(null);

  // 🚀 세션 생성 로직 최적화
  useEffect(() => {
    const initSession = async () => {
      if (!modelId) return;

      try {
        setIsReady(false);

        // 1. 💡 모델 ID로 직접 모델 이름 찾기 (가져오신 로직 활용)
        const currentModel = await getModelById(modelId);
        let formattedName = "";

        if (currentModel && currentModel.name) {
          formattedName = formatSystemName(currentModel.name);
          setModelName(formattedName);
          console.log("✅ AiNote - 모델명 설정 완료:", formattedName);
        }

        // 2. 새 세션 생성
        const lastId = await getLastChatId();
        const newId = (Number(lastId) || 0) + 1;

        const initialMsg = [
          {
            id: Date.now(),
            role: "assistant",
            content: `안녕하세요! 무엇이 궁금하신가요?`,
          },
        ];

        await saveChat({
          chatId: newId,
          modelId: String(modelId),
          messages: initialMsg,
          lastUpdated: Date.now(),
        });

        setCurrentChatId(newId);
        setIsReady(true);
      } catch (err) {
        console.error("AiNote 초기화 실패:", err);
        setIsReady(true); // 에러 발생 시에도 로딩은 풀어줌
      }
    };

    initSession();
  }, [modelId]);

  // 드래그 로직 (생략 - 기존과 동일)
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (e.target.closest("input") || e.target.closest("button")) return;
    e.preventDefault();
    setIsDragging(true);

    if (isExpanded) {
      setIsExpanded(false);
      const currentX = e.clientX;
      const currentY = e.clientY;
      dragOffset.current = { x: 180, y: 24 };
      setPosition({ x: currentX - 180, y: currentY - 24 });
    } else {
      const rect = noteRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      setIsDragging(false);

      // 💡 화면의 오른쪽 70% 영역을 넘어가면 도킹(최대화) 실행
      const dockThreshold = window.innerWidth * 0.7;
      if (e.clientX > dockThreshold) {
        // 현재 나눈 대화방 ID를 함께 넘겨주어 연속성을 유지합니다.
        onMaximize(currentChatId);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, currentChatId, onMaximize]);

  return (
    <div
      ref={noteRef}
      style={
        isExpanded
          ? {
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              width: "380px",
              zIndex: 9999,
            }
          : {
              position: "fixed",
              left: `${position.x}px`,
              top: `${position.y}px`,
              height: "540px",
              width: "380px",
              borderRadius: "16px",
              zIndex: 9999,
            }
      }
      className="bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scale-in"
    >
      <div
        onMouseDown={handleMouseDown}
        className="h-14 bg-white flex justify-between items-center px-4 cursor-move  shrink-0"
      >
        <span className="t-18-bold p-2 text-gray-800">AI 어시스턴트</span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-black transition-colors"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-white">
        {!isReady ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-main-1 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-[12px]">
              대화를 준비하고 있습니다...
            </p>
          </div>
        ) : (
          <AssistantAi
            modelId={modelId}
            modelName={modelName}
            currentChatId={currentChatId}
            setCurrentChatId={setCurrentChatId}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </div>
    </div>
  );
};

export default AiNote;
