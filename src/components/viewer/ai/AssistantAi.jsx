import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  FolderPlus,
  Plus,
  ArrowUp,
  X,
  Link as LinkIcon,
} from "lucide-react";
import IconPaperClip from "../../../assets/icons/icon-paperclip.svg";
import { fetchAiResponse } from "../../../api/aiAPI";
import { getChatsByModel, saveChat, getLastChatId } from "../../../api/aiDB";

const AssistantAi = ({
  modelName,
  modelId,
  currentChatId,
  setCurrentChatId,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);

  const scrollRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // 2. 아예 데이터가 없을 때만 실행되는 초기 생성
  const createNewInitialChat = async () => {
    const lastId = await getLastChatId();
    const newId = lastId + 1;
    const initialMsg = [
      {
        id: 1,
        role: "assistant",
        content: "안녕하세요! 무엇이 궁금하신가요?",
      },
    ];

    await saveChat({ chatId: newId, modelId, messages: initialMsg });
    setCurrentChatId(newId);
    setMessages(initialMsg);
  };

  // 1. 초기 로드 및 chatId 변경 대응
  useEffect(() => {
    const loadSession = async () => {
      setIsDbLoading(true);
      try {
        const savedChats = await getChatsByModel(modelId);

        if (currentChatId) {
          // 💡 부모(AiNote)가 준 ID가 DB에 있는지 확인
          const target = savedChats.find((c) => c.chatId === currentChatId);
          if (target) {
            setMessages(target.messages);
          } else {
            // 💡 ID는 있지만 DB에 아직 없다면(방금 생성된 경우), 빈 배열로 시작
            setMessages([]);
          }
        } else if (savedChats.length > 0) {
          const lastSession = savedChats.sort(
            (a, b) => b.lastUpdated - a.lastUpdated,
          )[0];
          setCurrentChatId(lastSession.chatId);
          setMessages(lastSession.messages);
        } else {
          await createNewInitialChat();
        }
      } catch (error) {
        console.error("세션 로드 중 에러:", error);
      } finally {
        // ✅ 어떤 경우에도 로딩 상태를 해제하여 화면을 보여줌
        setIsDbLoading(false);
      }
    };

    if (modelId) loadSession();
  }, [modelId, currentChatId]);

  // 3. 스크롤 제어
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 4. 메시지 전송 및 저장
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !modelName) {
      console.warn("⚠️ modelName이 아직 준비되지 않았습니다.");
      return;
    }
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userText,
      attachment: selectedItem,
    };

    // 사용자 메시지 저장
    const updatedWithUser = [...messages, newUserMsg];
    setMessages(updatedWithUser);
    await saveChat({
      chatId: currentChatId,
      modelId,
      messages: updatedWithUser,
    });

    setInputValue("");
    setSelectedItem(null);
    setIsMenuOpen(false);
    setIsLoading(true);

    // AI 응답 호출
    const aiReply = await fetchAiResponse(modelName, userText);
    const newAiMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiReply,
    };

    // AI 메시지 최종 저장
    const finalMessages = [...updatedWithUser, newAiMsg];
    setMessages(finalMessages);
    await saveChat({ chatId: currentChatId, modelId, messages: finalMessages });

    setIsLoading(false);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedItem({ type, name: file.name, file });
      setIsMenuOpen(false);
    }
  };

  if (isDbLoading)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        대화 내역 확인 중...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-[#FFF] relative">
      <div
        className="flex-1 overflow-y-auto custom-scrollbar px-2"
        ref={scrollRef}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2 mx-[20px] my-[12px] b-16-med leading-relaxed ${
                msg.role === "user"
                  ? "bg-bg-2 text-gray-9 rounded-[8px]"
                  : "bg-white border border-bg-1 border-[1.5px] text-gray-9 rounded-[8px]"
              }`}
            >
              {msg.content}
              {msg.attachment && (
                <div className="mt-2 pt-2 border-t border-gray-400/20 text-[11px] flex items-center gap-1 opacity-80">
                  {msg.attachment.type === "link" ? (
                    <img src={IconPaperClip} alt="link" className="w-3 h-3" />
                  ) : (
                    "📁"
                  )}
                  {msg.attachment.name}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] b-16-med px-4 py-2 mx-[20px] my-[12px] bg-white border border-bg-1 border-[1.5px] text-gray-4 rounded-[8px] animate-pulse">
              AI가 답변을 생각하고 있습니다...
            </div>
          </div>
        )}
      </div>

      <div className="bg-white relative m-[25px] shrink-0">
        {selectedItem && (
          <div className="absolute bottom-full left-5 mb-2 flex items-center gap-2 bg-main-2 text-white px-3 py-1.5 rounded-full text-xs">
            <span>
              {selectedItem.type === "link" ? "🔗" : "📁"} {selectedItem.name}
            </span>
            <button onClick={() => setSelectedItem(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 rounded-full pr-2 pl-4 py-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`transition-transform ${isMenuOpen ? "rotate-45" : ""}`}
          >
            <Plus size={24} className="text-gray-500" />
          </button>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            // 💡 modelName이 없으면 입력창 비활성화
            disabled={!modelName || isLoading}
            placeholder={
              !modelName ? "모델 정보를 불러오는 중..." : "메시지를 입력하세요."
            }
            className="outline-none flex-1 p-2 rounded-lg b-16-med"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-full text-white bg-main-1 hover:bg-bg-1 hover:text-main-1 disabled:bg-gray-300"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute bottom-[60px] left-0 bg-white rounded-2xl shadow-md border p-3 min-w-[180px] z-50">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-xl text-sm text-gray-500"
            >
              <Camera size={20} /> 사진 첨부
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-xl text-sm text-gray-500"
            >
              <FolderPlus size={20} /> 파일 첨부
            </button>
          </div>
        )}
      </div>

      {/* 숨겨진 Input */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e, "file")}
      />
    </div>
  );
};

export default AssistantAi;
