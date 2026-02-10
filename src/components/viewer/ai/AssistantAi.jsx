import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  setPdfSummary,
  onMessagesUpdate,
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
        id: Date.now(),
        role: "assistant",
        content: "안녕하세요! 무엇이 궁금하신가요?",
      },
    ],
    [],
  );

  // 1. 세션 로드 및 PDF 요약 데이터 동기화
  useEffect(() => {
    const initSession = async () => {
      if (!modelId) return;
      setIsDbLoading(true);

      try {
        const savedChats = await getChatsByModel(modelId);

        // 과거 요약본들 추출 (중복 방지를 위해 기존 데이터와 병합)
        const pastSummaries = savedChats
          .filter((chat) => chat.summary)
          .map((chat) => {
            const parsed =
              typeof chat.summary === "string"
                ? JSON.parse(chat.summary)
                : chat.summary;
            return {
              title: parsed.title || "지난 학습 요약",
              items: parsed.items || [],
              date: new Date(chat.lastUpdated).toLocaleDateString(),
            };
          });

        if (pastSummaries.length > 0) {
          setPdfSummary((prev) => {
            // 이미 존재하는 타이틀은 제외하고 추가
            const existingTitles = new Set(prev.map((p) => p.title));
            const newSummaries = pastSummaries.filter(
              (p) => !existingTitles.has(p.title),
            );
            return [...prev, ...newSummaries];
          });
        }

        // 현재 채팅 세션 설정
        if (currentChatId) {
          const target = savedChats.find(
            (c) => Number(c.chatId) === Number(currentChatId),
          );
          if (target) {
            setMessages(target.messages);
            if (onMessagesUpdate) onMessagesUpdate(target.messages);
          } else {
            setMessages(initialMsg);
          }
        } else if (savedChats.length > 0) {
          const lastSession = [...savedChats].sort(
            (a, b) => b.lastUpdated - a.lastUpdated,
          )[0];
          setCurrentChatId(lastSession.chatId);
          setMessages(lastSession.messages);
        } else {
          const lastId = await getLastChatId();
          setCurrentChatId((Number(lastId) || 0) + 1);
          setMessages(initialMsg);
        }
      } catch (error) {
        console.error("세션 로드 실패:", error);
      } finally {
        setIsDbLoading(false);
      }
    };

    initSession();
  }, [modelId, currentChatId]); // 의존성에서 setMessages, setPdfSummary 제외하여 무한루프 방지

  // 2. 메시지 변경 시 부모 컴포넌트(Viewer)로 데이터 전송
  useEffect(() => {
    if (onMessagesUpdate && messages.length > 0) {
      onMessagesUpdate(messages);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, onMessagesUpdate]);

  // 3. 메시지 전송 로직
  const handleSendMessage = async () => {
    if (
      (!inputValue.trim() && selectedFiles.length === 0) ||
      isLoading ||
      !modelName ||
      !currentChatId
    )
      return;

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userText,
      attachments: [...selectedFiles],
    };

    const updatedWithUser = [...messages, newUserMsg];
    setMessages(updatedWithUser);
    setInputValue("");
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      const aiReply = await fetchAiResponse(modelName, userText);

      let summaryData = null;
      if (aiReply && aiReply.summary) {
        summaryData =
          typeof aiReply.summary === "string"
            ? JSON.parse(aiReply.summary)
            : aiReply.summary;

        const newSummaryEntry = {
          title: summaryData.title || "실시간 학습 요약",
          items: summaryData.items || [],
          date: new Date().toLocaleDateString(),
        };
        // PDF 데이터 즉시 반영
        setPdfSummary((prev) => [...prev, newSummaryEntry]);
      }

      const aiContent =
        aiReply.answer ||
        aiReply.content ||
        (typeof aiReply === "string" ? aiReply : "");
      const newAiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiContent,
      };

      const finalMessages = [...updatedWithUser, newAiMsg];
      setMessages(finalMessages);

      // DB 저장
      await saveChat({
        chatId: Number(currentChatId),
        modelId: String(modelId),
        messages: finalMessages,
        summary: aiReply.summary, // 원본 summary 저장
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 핸들러 (생략된 기존 로직과 동일)
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
      else reader.readAsText(file);
    });
    setIsMenuOpen(false);
    e.target.value = null;
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
              className={`max-w-[85%] px-4 py-2 mx-[20px] my-[12px] b-16-med leading-relaxed chat-message ${
                msg.role === "user"
                  ? "bg-bg-2 text-gray-9 rounded-[8px]"
                  : "bg-white border border-bg-1 border-[1.5px] text-gray-9 rounded-[8px]"
              }`}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {msg.attachments
                ?.filter((a) => a.type === "image")
                .map((img) => (
                  <img
                    key={img.id}
                    src={img.preview}
                    alt="attached"
                    className="w-24 h-24 object-cover rounded-md border mb-2"
                  />
                ))}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.attachments
                ?.filter((a) => a.type !== "image")
                .map((file) => (
                  <div
                    key={file.id}
                    className="mt-2 pt-2 border-t border-gray-100 text-[11px] flex items-center gap-1 opacity-70"
                  >
                    <File size={12} /> {file.name}
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

      {/* 입력부 (기존 UI 유지) */}
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
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((f) => f.id !== file.id),
                    )
                  }
                  className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
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
            className="outline-none flex-1 min-w-0 p-2 bg-transparent b-16-med"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              (!inputValue.trim() && selectedFiles.length === 0) || isLoading
            }
            className={`p-2 rounded-full text-white transition-colors ${(!inputValue.trim() && selectedFiles.length === 0) || isLoading ? "bg-gray-300" : "bg-main-1 hover:bg-sky-700"}`}
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
