import React, { useState, useEffect, useRef } from "react";

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

  // 링크 입력 처리
  const handleLinkAdd = () => {
    const url = window.prompt("URL 주소를 입력해주세요:");
    if (url) {
      setSelectedItem({ type: "link", name: url });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-w-[486px] bg-[##FBFDFF]">
      <div className="flex flex-row">
        <img src="../src/assets/icons/icon-menu.svg" />
        <div alt="제목">AI 어시스턴트</div>
      </div>

      <div alt="본문" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-[8px] mx-[20px] my-[12px] text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gray-200 text-[#232323] rounded-[8px]"
                  : "bg-white border-1 border-[#EEEEEE] text-[#232323] rounded-[8px]"
              }`}
            >
              {msg.content}
              {msg.attachment && (
                <div className="mt-2 pt-2 border-t border-gray-300/30 text-[11px] flex items-center gap-1 opacity-80">
                  {msg.attachment.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div alt="입력창" className="bg-white relative m-[25px]">
        {selectedItem && (
          <div className="absolute bottom-full left-5 mb-2 flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs animate-in fade-in slide-in-from-bottom-1">
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

        {isMenuOpen && (
          <div className="absolute bottom-[70px] left-5 bg-white rounded-2xl shadow-md shadow-[#00000008] p-[12px] min-w-[180px] border border-gray-100 z-50 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <img
                className="w-[20px]"
                src="../src/assets/icons/icon-camera.svg"
                alt=""
              />
              <div className="whitespace-nowrap">사진 첨부</div>
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <img
                className="w-[20px]"
                src="../src/assets/icons/icon-folder-plus.svg"
                alt=""
              />
              <div className="whitespace-nowrap">파일 첨부(pdf,word)</div>
            </button>
            <button
              onClick={handleLinkAdd}
              className="flex items-center gap-[13px] w-full p-2.5 hover:bg-gray-50 rounded-xl text-sm text-[#949393] transition-colors"
            >
              <img
                className="w-[20px]"
                src="../src/assets/icons/icon-paperclip.svg"
                alt=""
              />
              <div className="whitespace-nowrap">링크 첨부</div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 rounded-full pr-2 pl-4 py-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`transition-transform ${isMenuOpen ? "rotate-45" : ""}`}
          >
            <span
              className={`text-2xl text-gray-500 font-light ${isMenuOpen && "rotate-45"}`}
            >
              <img src="../src/assets/icons/icon-plus.svg" />
            </span>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent outline-none text-sm py-2"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#575757] p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
          >
            <img src="../src/assets/icons/icon-arrow-up.svg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantAi;
