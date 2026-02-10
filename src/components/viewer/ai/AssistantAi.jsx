import React, { useState, useEffect, useRef, useMemo } from "react";
import { Camera, FolderPlus, Plus, ArrowUp, X, File } from "lucide-react";
import { fetchAiResponse } from "../../../api/aiAPI";
import { getChatsByModel, saveChat, getLastChatId } from "../../../api/aiDB";

const AssistantAi = ({
  modelName,
  modelId,
  currentChatId,
  setCurrentChatId,
  messages,
  setMessages,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);

  const scrollRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const initialMsg = useMemo(
    () => [
      {
        id: 1,
        role: "assistant",
        content: "안녕하세요! 무엇이 궁금하신가요?",
      },
    ],
    [],
  );

  // 초기 로드 및 자동 채팅 생성 로직
  // 모델이 바뀌거나 세션이 없을 때 초기화하는 로직
  useEffect(() => {
    const loadSession = async () => {
      if (!modelId) return;
      setIsDbLoading(true);

      try {
        const savedChats = await getChatsByModel(modelId);

        if (currentChatId) {
          // 1. 현재 ID가 DB에 이미 존재하는지 확인
          const target = savedChats.find(
            (c) => Number(c.chatId) === Number(currentChatId),
          );

          if (target) {
            // DB에 있으면 해당 메시지 로드
            setMessages(target.messages);
          } else {
            // ✨ 핵심: DB에 없는데 ID가 활성화되었다면 '새 채팅' 클릭 상황임
            // 과거 데이터를 불러오지 않고 즉시 UI를 초기화함
            setMessages(initialMsg);
          }
        } else {
          // 2. 진입 시 ID가 없는 경우 (기존 로직 유지)
          if (savedChats.length > 0) {
            const lastSession = [...savedChats].sort(
              (a, b) => b.lastUpdated - a.lastUpdated,
            )[0];
            setCurrentChatId(lastSession.chatId);
            setMessages(lastSession.messages);
          } else {
            // 3. 기록이 아예 없는 신규 모델인 경우 (기존 로직 유지)
            const lastId = await getLastChatId();
            const newId = (Number(lastId) || 0) + 1;
            setCurrentChatId(newId);
            setMessages(initialMsg);
          }
        }
      } catch (error) {
        console.error("세션 로드 에러:", error);
      } finally {
        setIsDbLoading(false);
      }
    };

    loadSession();
    // messages를 의존성 배열에 넣지 않아야 무한 루프가 발생하지 않습니다.
  }, [modelId, currentChatId, setCurrentChatId, setMessages, initialMsg]);

  // 스크롤 제어
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    // 1. 디버깅 로그: 전송 버튼을 눌렀을 때의 상태를 최우선으로 확인
    console.log("🚀 전송 시도:", {
      inputValue: !!inputValue.trim(),
      modelName,
      currentChatId,
      isLoading,
    });

    // 2. 가드 클로저 최소화: 입력값이 있고, 로딩 중만 아니면 일단 보낸다!
    if (!inputValue.trim() && selectedFiles.length === 0) return;
    if (isLoading) return;

    // modelName이나 chatId가 없으면 경고만 띄우고 중단 (완전 차단 대신 유연하게)
    if (!modelName || !currentChatId) {
      console.warn("⚠️ 필수 정보 누락으로 전송을 준비 중입니다.", {
        modelName,
        currentChatId,
      });
      // 만약 ID가 아직 null이라면 여기서 강제로 로드 세션을 다시 부를 수도 있습니다.
      return;
    }

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userText,
      attachments: [...selectedFiles],
    };

    // UI 즉시 반영
    const updatedWithUser = [...messages, newUserMsg];
    setMessages(updatedWithUser);
    setInputValue("");
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      // DB 저장
      await saveChat({
        chatId: Number(currentChatId),
        modelId: String(modelId),
        messages: updatedWithUser,
        lastUpdated: Date.now(),
      });

      // AI 응답 호출 (modelName이 무엇이든 일단 던짐)
      const aiReply = await fetchAiResponse(modelName, userText);
      const newAiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiReply,
      };

      const finalMessages = [...updatedWithUser, newAiMsg];
      setMessages(finalMessages);

      // 최종 결과 저장
      await saveChat({
        chatId: Number(currentChatId),
        modelId: String(modelId),
        messages: finalMessages,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("❌ 전송 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFiles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type,
            name: file.name,
            preview: reader.result,
          },
        ]);
      };
      if (type === "image") reader.readAsDataURL(file);
      else reader.onloadend();
    });
    setIsMenuOpen(false);
    e.target.value = null;
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
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
              {msg.attachments?.some((a) => a.type === "image") && (
                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                  {msg.attachments
                    .filter((a) => a.type === "image")
                    .map((img) => (
                      <img
                        key={img.id}
                        src={img.preview}
                        alt="attached"
                        className="w-24 h-24 object-cover rounded-md border border-gray-200"
                      />
                    ))}
                </div>
              )}
              {msg.content}
              {msg.attachments
                ?.filter((a) => a.type !== "image")
                .map((file) => (
                  <div
                    key={file.id}
                    className="mt-2 pt-2 border-t border-gray-400/20 text-[11px] flex items-center gap-1 opacity-80"
                  >
                    <File size={12} className="text-gray-500" />
                    {file.name}
                  </div>
                ))}
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
        {selectedFiles.length > 0 && (
          <div className="absolute bottom-full left-0 mb-3 flex flex-wrap gap-2 p-2 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-100 w-full max-h-32 overflow-y-auto">
            {selectedFiles.map((file) => (
              <div key={file.id} className="relative group">
                {file.type === "image" ? (
                  <img
                    src={file.preview}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    alt="preview"
                  />
                ) : (
                  <div className="h-16 px-3 flex items-center gap-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
                    <File size={14} />{" "}
                    <span className="max-w-[80px] truncate">{file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing)
                handleSendMessage();
            }}
            disabled={!modelName || isLoading}
            placeholder={
              !modelName ? "모델 정보를 불러오는 중..." : "메시지를 입력하세요."
            }
            className="outline-none flex- min-w-0 p-2 bg-transparent b-16-med"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              (!inputValue.trim() && selectedFiles.length === 0) || isLoading
            }
            className={`p-2 rounded-full text-white transition-colors 
    ${
      (!inputValue.trim() && selectedFiles.length === 0) || isLoading
        ? "bg-gray-300 " // 비활성화 시: 회색 배경 + 금지 커서
        : "bg-main-1 hover:bg-bg-1 hover:text-main-1" // 활성화 시: 원래 색상 + 호버 효과
    }`}
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute bottom-[60px] left-0 bg-white rounded-[12px] shadow-md border-gray-5 border-[1.5px] p-2 min-w-[180px] z-50">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-1 rounded-[8px] b-14-reg-160 text-gray-6"
            >
              <Camera size={20} /> 사진 첨부
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-1 rounded-[8px] b-14-reg-160 text-gray-6"
            >
              <FolderPlus size={20} /> 파일 첨부
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        ref={imageInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => handleFileChange(e, "file")}
      />
    </div>
  );
};

export default AssistantAi;
