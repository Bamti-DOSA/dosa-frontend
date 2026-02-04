import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, MessageSquare, Plus } from 'lucide-react';

import NoteItem from './note/NoteItem';
import NoteInput from './note/NoteInput';
import NoteMenu from './note/NoteMenu';
import AssistantAi from './ai/AssistantAi';
import AiMenu from './ai/AiMenu';

// 날짜 파싱 헬퍼 함수
const parseDate = (dateStr) => {
  const [dayPart, monthStr, timePart] = dateStr.split(' ');
  const day = parseInt(dayPart.replace('.', ''), 10);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  
  const now = new Date();
  return new Date(now.getFullYear(), monthMap[monthStr], day, hours, minutes);
};

const RightContainer = () => {
  const [activeTab, setActiveTab] = useState('ai');

  // --- 노트 관련 상태 ---
  const [notes, setNotes] = useState([]); // 빈 배열 초기화
  const [isAdding, setIsAdding] = useState(false);
  
  // --- AI 관련 상태 (더미 데이터) ---
  const [aiChats, setAiChats] = useState([
    { id: 'a1', date: '4. Feb 10:00', title: 'BLDC 모터 작동법 질문', messages: [] },
    { id: 'a2', date: '4. Feb 14:20', title: '배터리 규격 문의', messages: [] },
    { id: 'a3', date: '3. Feb 09:00', title: '어제 했던 대화 내용', messages: [] },
    { id: 'a4', date: '1. Feb 18:00', title: '오래된 대화 기록', messages: [] },
  ]);

  // 공통 UI 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  // --- 노트 정렬 및 그룹핑 ---
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [notes]);

  const groupedNotesForMenu = useMemo(() => {
    if (!notes) return {};
    return notes.reduce((acc, note) => {
      const cat = note.category || '기타';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(note);
      return acc;
    }, {});
  }, [notes]);

  // --- 핸들러들 ---
  const handleSaveNote = (noteData) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNote = {
      id: Date.now().toString(),
      date: formattedDate,
      title: noteData.title || '제목 없음', // 제목 저장
      content: noteData.content,
      category: noteData.category,
      type: noteData.type
    };
    setNotes([...notes, newNote]);
    setIsAdding(false);
  };

  const handleNoteClick = (noteId) => {
    setActiveTab('note'); 
    setIsMenuOpen(false);
    setTimeout(() => {
        const element = document.getElementById(noteId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
  };

  const handleAiChatSelect = (chatId) => {
    console.log("Selected Chat ID:", chatId);
    // TODO: 해당 채팅 세션 불러오기 로직 연결
    setIsMenuOpen(false);
  };

  const handleNewAiChat = () => {
    console.log("Start New Chat");
    // TODO: 채팅 초기화 로직 연결
    setIsMenuOpen(false);
  };

  // 스크롤 자동 이동 (노트 추가 시)
  useEffect(() => {
    if (activeTab === 'note' && isAdding && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isAdding, notes, activeTab]);

  return (
    <div 
      className="flex flex-col w-full border-r border-gray-200 font-sans relative overflow-hidden"
      style={{ height: '100vh', backgroundColor: '#FBFDFF' }} 
    >
      {/* 1. 헤더 */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm z-40 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`p-1 rounded transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
          
          {/* 탭에 따라 제목 변경 */}
          <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">
            {activeTab === 'note' ? '메모장' : 'AI 어시스턴트'}
          </h1>
        </div>
        
        {/* 탭 전환 버튼 그룹 */}
        <div className="flex bg-[#EEEFF0] p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab('note'); setIsMenuOpen(false); }}
            className={`flex items-center gap-1 px-3 py-1 rounded shadow-sm text-xs font-bold transition-all ${
                activeTab === 'note' 
                ? 'bg-white text-gray-800' 
                : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>📄</span> 메모장
          </button>
          <button 
            onClick={() => { setActiveTab('ai'); setIsMenuOpen(false); }}
            className={`flex items-center gap-1 px-3 py-1 rounded shadow-sm text-xs font-bold transition-all ${
                activeTab === 'ai' 
                ? 'bg-white text-gray-800' 
                : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
             <MessageSquare size={14} /> AI
          </button>
        </div>
      </div>

      {/* 2. 컨텐츠 영역 */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        
        {/* 메뉴 오버레이 (탭에 따라 NoteMenu 또는 AiMenu 렌더링) */}
        {isMenuOpen && (
          activeTab === 'note' ? (
            <NoteMenu 
              groupedNotes={groupedNotesForMenu}
              onClose={() => setIsMenuOpen(false)} 
              onNoteClick={handleNoteClick}
            />
          ) : (
            <AiMenu 
              chatSessions={aiChats} 
              onClose={() => setIsMenuOpen(false)}
              onSelectChat={handleAiChatSelect}
              onNewChat={handleNewAiChat}
            />
          )
        )}

        {/* --- [TAB 1] 노트 리스트 화면 --- */}
        {activeTab === 'note' && (
             <div className="h-full overflow-y-auto p-5 custom-scrollbar" ref={scrollRef}>
                {sortedNotes.length === 0 ? (
                    // 데이터 없음 안내 문구
                    <div className="flex flex-col items-center justify-center h-full pb-20 text-gray-400 text-xs text-center leading-relaxed animate-fade-in">
                        <p>노트를 추가하여</p>
                        <p>공부한 내용을 정리해 보세요</p>
                    </div>
                ) : (
                    <div className="relative pb-20"> 
                      {/* 타임라인 세로선 */}
                      <div className="absolute left-[7px] top-2 bottom-20 w-[2px] bg-[#E5E7EB]"></div>
                      
                      <div className="flex flex-col">
                        {sortedNotes.map((note, index) => {
                          let showDot = false;
                          let spacingClass = 'mt-4'; 

                          if (index === 0) {
                            showDot = true;
                            spacingClass = ''; 
                          } else {
                            const prevNote = sortedNotes[index - 1];
                            const currentTime = parseDate(note.date).getTime();
                            const prevTime = parseDate(prevNote.date).getTime();
                            const diffHours = (currentTime - prevTime) / (1000 * 60 * 60);

                            // 2시간 이상 차이 시 간격 벌리고 점 찍기
                            if (diffHours >= 2) {
                              showDot = true;
                              spacingClass = 'mt-12';
                            }
                          }

                          return (
                            <div key={note.id} className={spacingClass}>
                              <NoteItem note={note} isFirst={showDot} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                )}

                {/* 노트 추가 입력창 */}
                {isAdding && (
                 <NoteInput onSave={handleSaveNote} onCancel={() => setIsAdding(false)} />
                )}
            </div>
        )}

        {/* --- [TAB 2] AI 어시스턴트 화면 --- */}
        {activeTab === 'ai' && (
            <AssistantAi />
        )}

      </div>

      {/* 3. 하단 버튼 (노트 탭이고, 입력 중이 아니고, 메뉴 닫혀있을 때만 표시) */}
      {activeTab === 'note' && !isAdding && !isMenuOpen && (
        <div className="p-4 bg-[#F5F6F8] shrink-0 z-30">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex justify-center items-center gap-2 bg-[#E2E4EA] hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors shadow-sm"
          >
            Add note <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RightContainer;