import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Minimize2, ArrowUp, Maximize2, Camera, FolderPlus, Link as LinkIcon, Plus } from 'lucide-react';

const AiNote = ({ onClose, onMaximize, messages, setMessages }) => {
  // 화면 위치 상태
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 180, y: window.innerHeight / 2 - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    e.preventDefault();
    setIsDragging(true);

    if (isExpanded) {
        setIsExpanded(false);
        // 마우스 위치에 맞춰 모달이 따라오도록 오프셋 재계산 (중앙 잡기 등)
        // 여기서는 간단히 현재 마우스 위치 기준으로 계산
        const currentX = e.clientX;
        const currentY = e.clientY;
        // 드래그 시작 시 모달의 상단 중앙을 잡은 것처럼 위치 보정
        dragOffset.current = { x: 180, y: 24 }; // 360px의 절반, 헤더 높이의 절반
        setPosition({ x: currentX - 180, y: currentY - 24 });
    } else {
        const rect = noteRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      setIsDragging(false);

      const dockThreshold = window.innerWidth * 0.7;
      if (e.clientX > dockThreshold) {
        onMaximize(); // 부모 컴포넌트의 AI 탭 전환 함수 실행
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMaximize]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
      style={
        isExpanded 
        ? { 
            // ✅ 확장 상태 (도킹 모드) - 부모(RightContainer) 기준 꽉 채우기
            position: 'absolute', // fixed -> absolute 변경
            top: 0, 
            left: 'auto',
            right: 0,
            height: '100%', // 높이 100%
            borderRadius: '0px', // 모서리 제거하여 딱 붙임
            border: 'none',      // 테두리 제거 (선택사항)
            zIndex: 50,          // 적절한 레이어 순서
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' 
          }
        : { 
            // ✅ 플로팅 상태 (기본 모드)
            left: `${position.x}px`, 
            top: `${position.y}px`, 
            height: '500px', 
            width: '360px',
            borderRadius: '16px',
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }
      }
      className="fixed w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden animate-scale-in"
    >
      {/* 1. 헤더 (드래그 영역) */}
      <div 
        onMouseDown={handleMouseDown}
        className="h-12 bg-white flex justify-between items-center px-4 cursor-move shrink-0 select-none"
      >
        <div className="flex items-center gap-2 text-[#232323]">
          <span className="font-bold text-sm">AI 어시스턴트</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleExpand}
             className="text-gray-400 hover:text-[#232323] p-1 rounded transition-colors"
             title={isExpanded ? "축소하기" : "위아래로 확장하기"}
           >
             {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
           </button>
           <button 
             onClick={onClose}
             className="text-gray-400 hover:text-[#232323] p-1  rounded"
           >
             <X size={16} />
           </button>
        </div>
      </div>

      {/* 2. 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 bg-white no-scrollbar flex flex-col gap-3">
        <div className="flex gap-3">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-gray-900 border border-bg-1 leading-relaxed max-w-[80%]">
                안녕하세요! 궁금한 점이 있으신가요?
            </div>
        </div>

        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] flex flex-col gap-2 ${
                    msg.role === 'user' 
                    ? 'bg-bg-2 text-gray-900 rounded-tr-none' 
                    : 'bg-white text-gray-900 border border-bg-1 rounded-tl-none'
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

      {/* 3. 입력창 영역 (위쪽 UI 스타일: 하단 마진, 회색 알약 모양 입력바) */}
            <div className="bg-white relative m-[25px] shrink-0">
              
              {/* 선택된 파일 미리보기 (입력창 위) */}
              {selectedItem && (
                <div className="absolute bottom-full left-5 mb-2 flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs animate-in fade-in slide-in-from-bottom-1">
                  <span>
                    {selectedItem.type === "link" ? <img src={IconPaperClip} alt="link icon" className="w-3 h-3" /> : '📁'} {selectedItem.name}
                  </span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="ml-1 hover:text-red-400"
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
                  className="flex-1 bg-transparent outline-none text-sm py-2 text-gray-700"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full text-white transition-colors bg-main-1`}
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>  
    </div>
  );
};

export default AiNote;