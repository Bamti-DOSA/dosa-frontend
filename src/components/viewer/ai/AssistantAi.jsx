import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  FolderPlus,
  Link as LinkIcon,
  Plus,
  ArrowUp,
  Menu,
  X,
} from "lucide-react";
import IconPaperClip from "../../../assets/icons/icon-paperclip.svg";

const AssistantAi = () => {
  // --- 기능 및 상태 관리 (아래쪽 코드 기반) ---
  const [messages, setMessages] = useState([
    { id: 1, role: "user", content: "물어본 내용..." },
    { id: 2, role: "assistant", content: "대답 어쩌고..." },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const scrollRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // 스크롤 자동 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      attachment: selectedItem,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setSelectedItem(null);
    setIsMenuOpen(false);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedItem({ type, name: file.name, file });
      setIsMenuOpen(false);
    }
  };

  const handleLinkAdd = () => {
    const url = window.prompt("URL 주소를 입력해주세요:");
    if (url) {
      setSelectedItem({ type: "link", name: url });
      setIsMenuOpen(false);
    }
  };

  return (
    // 전체 레이아웃 구조 (h-full로 꽉 차게 설정하여 스크롤 문제 해결)
    <div className="flex flex-col h-full bg-[#FBFDFF] relative">
      {/* 2. 채팅 본문 영역 (위쪽 UI 말풍선 스타일 + 아래쪽 기능인 scrollRef) */}
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
                  ? "bg-bg-2 text-gray-9 rounded-[8px]" // 위쪽 UI: 둥근 사각형 (반지름 8px)
                  : "bg-white border border-bg-1 border-[1.5px] text-gray-9 rounded-[8px]"
              }`}
            >
              {msg.content}
              {msg.attachment && (
                <div className="mt-2 pt-2 border-t border-gray-400/20 text-[11px] flex items-center gap-1 opacity-80">
                  {msg.attachment.type === "link" ? (
                    <img
                      src={IconPaperClip}
                      alt="link icon"
                      className="w-3 h-3"
                    />
                  ) : (
                    "📁"
                  )}{" "}
                  {msg.attachment.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. 입력창 영역 (위쪽 UI 스타일: 하단 마진, 회색 알약 모양 입력바) */}
      <div className="bg-white relative m-[25px] shrink-0">
        {/* 선택된 파일 미리보기 (입력창 위) */}
        {selectedItem && (
          <div className="absolute bottom-full left-5 mb-2 flex items-center gap-2 bg-main-2 text-white px-3 py-1.5 rounded-full text-xs animate-in fade-in slide-in-from-bottom-1">
            <span>
              {selectedItem.type === "link" ? (
                <img src={IconPaperClip} alt="link icon" className="w-3 h-3" />
              ) : (
                "📁"
              )}{" "}
              {selectedItem.name}
            </span>
            <button
              onClick={() => setSelectedItem(null)}
              className="ml-1 hover:text-black"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 숨겨진 파일 인풋 */}
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

        {/* 플러스 메뉴 팝업 (위쪽 UI 위치 및 스타일) */}
        {isMenuOpen && (
          <div className="absolute bottom-[60px] left-0 bg-white rounded-2xl shadow-md border border-gray-100 p-[12px] min-w-[180px] z-50 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-bg-2 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <Camera size={20} />
              <div className="whitespace-nowrap">사진 첨부</div>
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-bg-2 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <FolderPlus size={20} />
              <div className="whitespace-nowrap">파일 첨부</div>
            </button>
            <button
              onClick={handleLinkAdd}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-bg-2 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <img src={IconPaperClip} alt="link icon" className="w-5 h-5" />
              <div className="whitespace-nowrap">링크 첨부</div>
            </button>
          </div>
        )}

        {/* 입력 바 (위쪽 UI: 회색 알약 모양) */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pr-2 pl-4 py-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`transition-transform duration-200 ${isMenuOpen ? "rotate-45" : ""}`}
          >
            <Plus size={24} className="text-gray-500" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent outline-none b-14-med py-2 text-gray-700"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full text-white transition-colors bg-main-1 hover:bg-white hover:text-main-1`}
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantAi;
