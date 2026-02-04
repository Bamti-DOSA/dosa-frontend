import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, ArrowUp, Maximize2, Camera, FolderPlus, Link as LinkIcon, Plus } from 'lucide-react';

const AiNote = ({ onClose, onMaximize, messages, setMessages }) => {
  // 화면 위치 상태
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 180, y: window.innerHeight / 2 - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef(null);
  
  // 입력 및 첨부파일 상태
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 파일 input Refs
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 드래그 핸들러 ---
  const handleMouseDown = (e) => {
    // input이나 button 등 내부 요소를 클릭했을 때는 드래그 시작 안 함
    if (e.target.closest('input') || e.target.closest('button')) return;

    setIsDragging(true);
    const rect = noteRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // --- 파일 첨부 핸들러 ---
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

  // --- 메시지 전송 핸들러 ---
  const handleSendMessage = () => {
    if (!inputValue.trim() && !selectedItem) return;
    
    // 사용자 메시지 추가 (첨부파일 포함)
    const newMsg = { 
        id: Date.now(), 
        role: 'user', 
        text: inputValue,
        attachment: selectedItem 
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setSelectedItem(null); // 전송 후 초기화

    // (임시) AI 응답 시뮬레이션
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now()+1, role: 'ai', text: "네, 확인했습니다. 해당 내용과 자료를 바탕으로 도와드릴까요?" }]);
    }, 1000);
  };

  return (
    <div 
      ref={noteRef}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden animate-scale-in"
    >
      {/* 1. 헤더 (드래그 영역) */}
      <div 
        onMouseDown={handleMouseDown}
        className="h-12 bg-gray-50 border-b border-gray-100 flex justify-between items-center px-4 cursor-move shrink-0 select-none"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <MessageSquare size={16} className="text-blue-600" />
          <span className="font-bold text-sm">AI 어시스턴트</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={onMaximize}
             className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
             title="전체 화면으로 대화 계속하기"
           >
             <Maximize2 size={14} />
           </button>
           <button 
             onClick={onClose}
             className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
           >
             <X size={16} />
           </button>
        </div>
      </div>

      {/* 2. 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 bg-white custom-scrollbar flex flex-col gap-3">
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 leading-relaxed shadow-sm max-w-[80%]">
                안녕하세요! 궁금한 점이 있으신가요?
            </div>
        </div>

        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}`}>
                    <span className="text-white text-xs font-bold">{msg.role === 'user' ? 'Me' : 'AI'}</span>
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[80%] flex flex-col gap-2 ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-700 rounded-tl-none'
                }`}>
                    {/* 텍스트 내용 */}
                    {msg.text && <span>{msg.text}</span>}
                    
                    {/* 첨부파일 표시 */}
                    {msg.attachment && (
                        <div className={`text-[10px] flex items-center gap-1 p-1 rounded ${msg.role === 'user' ? 'bg-white/20' : 'bg-gray-200'}`}>
                            {msg.attachment.type === 'link' ? '🔗' : '📁'} {msg.attachment.name}
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* 3. 입력창 영역 */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 relative">
        
        {/* 첨부파일 미리보기 (입력창 위) */}
        {selectedItem && (
          <div className="absolute bottom-[70px] left-4 flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs animate-fade-in z-20">
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

        {/* 히든 인풋 */}
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
          <div className="absolute bottom-[70px] left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[140px] z-30 animate-fade-in-up">
            <button
              onClick={() => imageInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-xl text-xs text-gray-600 transition-colors"
            >
              <Camera size={16} />
              <span>사진 첨부</span>
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-xl text-xs text-gray-600 transition-colors"
            >
              <FolderPlus size={16} />
              <span>파일 첨부</span>
            </button>
            <button
              onClick={handleLinkAdd}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-xl text-xs text-gray-600 transition-colors"
            >
              <LinkIcon size={16} />
              <span>링크 첨부</span>
            </button>
          </div>
        )}

        <div className="relative flex items-center gap-2">
            {/* 플러스 버튼 */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-full transition-colors bg-gray-100 hover:bg-gray-200 text-gray-500 ${isMenuOpen ? "rotate-45" : ""}`}
            >
                <Plus size={20} />
            </button>

            <input 
                type="text" 
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && !selectedItem}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
                    (inputValue.trim() || selectedItem) 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <ArrowUp size={16} strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AiNote;