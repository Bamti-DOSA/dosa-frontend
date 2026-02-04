import React, { useState, useEffect, useRef } from "react";
import { Camera, FolderPlus, Link as LinkIcon, Plus, ArrowUp, Menu } from 'lucide-react';

const AssistantAi = () => {
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
    // 👇 부모 컨테이너에 꽉 차게 h-full 및 flex 구조 적용
    <div className="flex flex-col h-full bg-[#FBFDFF] w-full relative">

      {/* 채팅 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 mx-2 my-2 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-gray-800 text-white rounded-[20px] rounded-tr-none"
                  : "bg-white border border-[#EEEEEE] text-[#232323] rounded-[20px] rounded-tl-none"
              }`}
            >
              {msg.content}
              {msg.attachment && (
                <div className="mt-2 pt-2 border-t border-white/20 text-[11px] flex items-center gap-1 opacity-80">
                  {msg.attachment.type === 'link' ? '🔗' : '📁'} {msg.attachment.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 입력창 영역 */}
      <div className="bg-white p-4 m-4 rounded-[24px] shadow-lg border border-gray-100 relative shrink-0">
        {selectedItem && (
          <div className="absolute bottom-full left-0 mb-2 flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs animate-fade-in">
            <span>
              {selectedItem.type === "link" ? "🔗" : "📁"} {selectedItem.name}
            </span>
            <button
              onClick={() => setSelectedItem(null)}
              className="ml-1 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        )}

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

        {/* 플러스 메뉴 팝업 */}
        {isMenuOpen && (
          <div className="absolute bottom-[80px] left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-50 animate-fade-in-up">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-600 transition-colors"
            >
              <Camera size={18} />
              <span>사진 첨부</span>
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-600 transition-colors"
            >
              <FolderPlus size={18} />
              <span>파일 첨부</span>
            </button>
            <button
              onClick={handleLinkAdd}
              className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-gray-600 transition-colors"
            >
              <LinkIcon size={18} />
              <span>링크 첨부</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-all ${isMenuOpen ? "rotate-45 bg-gray-100" : ""}`}
          >
            <Plus size={24} className="text-gray-400" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-colors ${
                inputValue.trim() ? 'bg-gray-800 hover:bg-black text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantAi;