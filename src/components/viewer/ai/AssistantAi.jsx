import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Camera,
  FolderPlus,
  Plus,
  ArrowUp,
  X,
  Link as LinkIcon,
  File,
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

  // 💡 단일 selectedItem에서 배열 형태의 selectedFiles로 변경
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

  // 초기 로드 로직 (기존 유지)
  useEffect(() => {
    const loadSession = async () => {
      setIsDbLoading(true);
      try {
        const savedChats = await getChatsByModel(modelId);
        if (currentChatId) {
          const target = savedChats.find(
            (c) => Number(c.chatId) === Number(currentChatId),
          );
          if (target) setMessages(target.messages);
          else setMessages(initialMsg);
        } else if (savedChats.length > 0) {
          const lastSession = savedChats.sort(
            (a, b) => b.lastUpdated - a.lastUpdated,
          )[0];
          setCurrentChatId(lastSession.chatId);
          setMessages(lastSession.messages);
        } else {
          setMessages(initialMsg);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsDbLoading(false);
      }
    };
    if (modelId) loadSession();
  }, [modelId, currentChatId, initialMsg, setCurrentChatId]);

  // 스크롤 제어
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, selectedFiles]);

  // 💡 파일 선택 핸들러 (여러 개 추가 가능)
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
            preview: reader.result, // 이미지인 경우 Base64 데이터
          },
        ]);
      };
      if (type === "image") reader.readAsDataURL(file);
      else reader.onloadend(); // 일반 파일은 미리보기 없이 이름만 저장
    });
    setIsMenuOpen(false);
    e.target.value = null; // 같은 파일 재선택 가능하도록 초기화
  };

  // 💡 첨부 파일 개별 삭제
  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendMessage = async () => {
    if (
      (!inputValue.trim() && selectedFiles.length === 0) ||
      isLoading ||
      !modelName
    )
      return;

    const userText = inputValue;
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: userText,
      attachments: selectedFiles, // 💡 단일 attachment에서 배열로 변경
    };

    const updatedWithUser = [...messages, newUserMsg];
    setMessages(updatedWithUser);

    // DB 저장
    await saveChat({
      chatId: currentChatId,
      modelId,
      messages: updatedWithUser,
    });

    setInputValue("");
    setSelectedFiles([]);
    setIsLoading(true);

    const aiReply = await fetchAiResponse(modelName, userText);
    const newAiMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiReply,
    };

    const finalMessages = [...updatedWithUser, newAiMsg];
    setMessages(finalMessages);
    await saveChat({ chatId: currentChatId, modelId, messages: finalMessages });
    setIsLoading(false);
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
              {/* 💡 이미지 첨부물 렌더링 */}
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

              {/* 💡 일반 파일/링크 첨부물 렌더링 */}
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

      {/* 💡 입력창 상단 파일 미리보기 영역 */}
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
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={!modelName || isLoading}
            placeholder={
              !modelName ? "모델 정보를 불러오는 중..." : "메시지를 입력하세요."
            }
            className="outline-none flex-1 p-2 bg-transparent b-16-med"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              (!inputValue.trim() && selectedFiles.length === 0) || isLoading
            }
            className="p-2 rounded-full text-white bg-main-1 hover:bg-bg-1 hover:text-main-1 disabled:bg-gray-300"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute bottom-[60px] left-0 bg-white rounded-[12px] shadow-md border-gray-5 border-[1.5px] p-2 min-w-[180px] z-50 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-1 rounded-[8px] b-14-reg-160 text-gray-6"
            >
              <Camera size={20} /> 사진 첨부
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-1 rounded-[8px]  b-14-reg-160 text-gray-6"
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
