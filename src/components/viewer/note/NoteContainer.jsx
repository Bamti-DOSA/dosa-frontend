import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, MessageSquare, Plus } from 'lucide-react';
import NoteItem from './NoteItem';
import NoteInput from './NoteInput';
import NoteMenu from './NoteMenu';

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

const NoteContainer = () => {
  const [notes, setNotes] = useState([]); // 빈 배열 초기화
  const [isAdding, setIsAdding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);

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

  // 👇 [여기가 핵심 수정] 제목 저장 로직
  const handleSaveNote = (noteData) => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNote = {
      id: Date.now().toString(),
      date: formattedDate,
      // 👇 이전엔 '새로운 메모'로 고정되어 있었음 -> noteData.title로 변경
      title: noteData.title || '제목 없음', 
      content: noteData.content,
      category: noteData.category,
      type: noteData.type
    };
    setNotes([...notes, newNote]);
    setIsAdding(false);
  };

  const handleNoteClick = (noteId) => {
    setIsMenuOpen(false);
    setTimeout(() => {
        const element = document.getElementById(noteId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
  };

  useEffect(() => {
    if (isAdding && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isAdding, notes]);

  return (
    <div 
      className="flex flex-col w-full border-r border-gray-200 font-sans relative overflow-hidden"
      style={{ height: '100vh', backgroundColor: '#FBFDFF' }} 
    >
      {/* 헤더 */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm z-40 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`p-1 rounded transition-colors ${isMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
          <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">메모장</h1>
        </div>
        <div className="flex bg-[#EEEFF0] p-1 rounded-lg">
          <button className="flex items-center gap-1 px-3 py-1 bg-white rounded shadow-sm text-xs font-bold text-gray-800">
            <span>📄</span> 메모장
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500">
             <MessageSquare size={14} /> AI
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {isMenuOpen && (
          <NoteMenu 
            groupedNotes={groupedNotesForMenu}
            onClose={() => setIsMenuOpen(false)} 
            onNoteClick={handleNoteClick}
          />
        )}

        <div className="h-full overflow-y-auto p-5 custom-scrollbar" ref={scrollRef}>
            {sortedNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pb-20 text-gray-400 text-xs text-center leading-relaxed animate-fade-in">
                    <p>노트를 추가하여</p>
                    <p>공부한 내용을 정리해 보세요</p>
                </div>
            ) : (
                <div className="relative pb-20"> 
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

            {isAdding && (
             <NoteInput onSave={handleSaveNote} onCancel={() => setIsAdding(false)} />
            )}
        </div>
      </div>

      {/* 하단 버튼 */}
      {!isAdding && !isMenuOpen && (
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

export default NoteContainer;