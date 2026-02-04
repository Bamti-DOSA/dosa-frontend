import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, MessageSquare } from 'lucide-react';

import fileblack from '../../assets/icons/icon-file-black.svg';
import file from '../../assets/icons/icon-file.svg';
import NoteMenu from './note/NoteMenu';
import NoteItemList from './note/NoteItemList'; 
import NoteFull from './note/NoteFull';         
import AssistantAi from './ai/AssistantAi';
import AiMenu from './ai/AiMenu';

const parseDate = (dateStr) => {
  const [dayPart, monthStr, timePart] = dateStr.split(' ');
  const day = parseInt(dayPart.replace('.', ''), 10);
  const [hours, minutes] = timePart.split(':').map(Number);
  const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const now = new Date();
  return new Date(now.getFullYear(), monthMap[monthStr], day, hours, minutes);
};

const getFormattedDate = () => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const RightContainer = ({ activeTab, setActiveTab, onOpenAiNote, isAiNoteOpen, aiChats, setAiChats }) => {
  const [notes, setNotes] = useState([]); 
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null); 
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  
  const scrollRef = useRef(null);

  const groupedNotesForMenu = useMemo(() => {
    if (!notes) return {};
    return notes.reduce((acc, note) => {
      const cat = note.category || '기타';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(note);
      return acc;
    }, {});
  }, [notes]);

  const handleSaveNote = (noteData) => {
    const dateStr = getFormattedDate();
    if (editingNote) {
        setNotes(prevNotes => prevNotes.map(note => 
            note.id === editingNote.id ? { ...note, ...noteData, date: dateStr } : note
        ));
        setEditingNote(null);
    } else {
        const newNote = {
            id: Date.now().toString(),
            date: dateStr,
            title: noteData.title || '제목 없음',
            content: noteData.content,
            category: noteData.category,
            type: noteData.type
        };
        setNotes([...notes, newNote]);
    }
    setIsAdding(false);
  };

  const handleEditStart = (noteId) => {
    const targetNote = notes.find(n => n.id === noteId);
    if (targetNote) {
        setEditingNote(targetNote); 
        setIsAdding(true);     
        setExpandedNoteId(null); 
    }
  };

  const handleCancelInput = () => {
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleDeleteRequest = (noteId) => { setDeletingNoteId(noteId); };
  const handleDeleteConfirm = () => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== deletingNoteId));
    setDeletingNoteId(null);
    setExpandedNoteId(null); 
  };

  const handleNoteClick = (noteId) => {
    setActiveTab('note'); 
    setIsMenuOpen(false);
    setExpandedNoteId(null); 
    setTimeout(() => {
        const element = document.getElementById(noteId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
  };

  const handleAiChatSelect = () => setIsMenuOpen(false);
  const handleNewAiChat = () => setIsMenuOpen(false);

  useEffect(() => {
    if (activeTab === 'note' && isAdding && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isAdding, notes, activeTab]);

  const activeFullNote = useMemo(() => 
    notes.find(n => n.id === expandedNoteId), 
  [notes, expandedNoteId]);

  return (
    <div className="w-full h-full flex flex-col relative bg-[#FBFDFF] rounded-2xl overflow-hidden">
      
      {/* 삭제 모달 */}
      {deletingNoteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white rounded-[16px] p-6 shadow-2xl w-[320px] flex flex-col items-center animate-scale-in">
            <h3 className="text-[15px] font-bold text-gray-900 mb-2 mt-1">메모를 삭제하시겠습니까?</h3>
            <p className="text-xs text-gray-600 text-center mb-4">삭제된 메모는 복구할 수 없습니다.<br/>확인 후 삭제를 진행해주세요</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => setDeletingNoteId(null)} className="flex-1 py-3 rounded-xl bg-main-3 text-white text-xs font-bold hover:bg-gray-500">뒤로가기</button>
              <button onClick={handleDeleteConfirm} className="flex-1 py-3 rounded-xl bg-main-1 text-white text-xs font-bold hover:bg-sky-800">삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-white p-4 flex justify-between items-center shadow-sm z-40 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`p-1 rounded-md transition-colors ${isMenuOpen ? 'bg-bg-1 text-main-1' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
          <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">
            {activeTab === 'note' ? '메모장' : 'AI 어시스턴트'}
          </h1>
        </div>
        <div className="flex bg-[#EEEFF0] p-1 rounded-lg">
            <button onClick={() => { setActiveTab('note'); setIsMenuOpen(false); }} className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'note' ? 'bg-white text-gray-800' : 'bg-transparent text-gray-400'}`}><img src={activeTab === 'note' ? fileblack : file} alt="file icon" className="w-3 h-3"/> 메모장</button>
            <button onClick={() => { setActiveTab('ai'); setIsMenuOpen(false); }} className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-gray-800' : 'bg-transparent text-gray-400'}`}><MessageSquare size={14} /> AI</button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        
        {isMenuOpen && (
          activeTab === 'note' ? (
            <NoteMenu groupedNotes={groupedNotesForMenu} onClose={() => setIsMenuOpen(false)} onNoteClick={handleNoteClick} />
          ) : (
            <AiMenu chatSessions={aiChats} onClose={() => setIsMenuOpen(false)} onSelectChat={handleAiChatSelect} onNewChat={handleNewAiChat} />
          )
        )}

        {/* [TAB 1] 노트 화면 */}
        {activeTab === 'note' && (
            expandedNoteId && activeFullNote ? (
                <NoteFull 
                    note={activeFullNote}
                    onClose={() => setExpandedNoteId(null)}
                    onDelete={handleDeleteRequest}
                    onEdit={handleEditStart}
                />
            ) : (
                <NoteItemList 
                    notes={notes}
                    scrollRef={scrollRef}
                    isAdding={isAdding}
                    setIsAdding={setIsAdding}
                    onSave={handleSaveNote}
                    onCancelInput={handleCancelInput}
                    editingNote={editingNote}
                    onDeleteRequest={handleDeleteRequest}
                    onEditStart={handleEditStart}
                    onNoteExpand={(id) => setExpandedNoteId(id)} 
                    onOpenAiNote={onOpenAiNote}
                    isAiNoteOpen={isAiNoteOpen}
                />
            )
        )}

        {/* [TAB 2] AI 화면 */}
        {/* AssistantAi에 sessions 데이터를 넘겨주어야 실제 대화가 보입니다. 
           (여기서는 AssistantAi 구현부를 모르므로, 필요 시 props를 추가하세요: sessions={aiChats}) */}
        {activeTab === 'ai' && <AssistantAi />}
      </div>
    </div>
  );
};

export default RightContainer;