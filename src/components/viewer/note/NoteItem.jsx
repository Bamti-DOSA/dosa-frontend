import React, { useState, useEffect, useRef } from 'react';
import more from '../../../assets/icons/more.svg';

const NoteItem = ({ note, isFirst, onDelete, onEdit, isEditing, onDoubleClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      id={note.id} 
      className="relative pl-8 pb-2 scroll-mt-24 cursor-pointer" 
      onDoubleClick={onDoubleClick} 
    > 
      
      {/* 타임라인 점 */}
      {isFirst && (
        <div className="absolute left-0 top-0 mt-1 w-4 h-4 rounded-full bg-[#E5E7EB] border-2 border-white z-10"></div>
      )}
      
      {/* 노트 카드 본문 */}
      <div 
        className={`p-4 rounded-xl transition-all duration-300 group relative ${
          isEditing 
            ? 'bg-bg-2 border-red-400 ring-1 ring-red-400' 
            : 'bg-bg-2 hover:border-gray-300' 
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="text-[12px] text-[#818181] font-medium tracking-tight">{note.date}</span>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-gray-300 hover:text-gray-500 p-1 rounded transition-colors"
            >
              <img src={more} alt="more" width={16} height={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-20 bg-white rounded-lg border border-gray-100 z-20 py-1 px-1 overflow-hidden animate-fade-in">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit && onEdit(note.id); }} 
                  className="block w-full text-left rounded-sm px-2 py-2 text-xs font-medium text-black hover:bg-bg-2 transition-colors"
                >
                  수정
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete && onDelete(note.id); }} 
                  className="block w-full text-left rounded-sm px-2 py-2  text-xs font-medium text-black hover:bg-bg-2 transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
        
        {note.title && (
            <h3 className="text-[18px] font-bold text-gray-900 pb-3">{note.title}</h3>
        )}
        
        <p className="text-[16px] text-[#676767] leading-relaxed mb-4 break-words line-clamp-2 whitespace-pre-wrap">
          {note.content}
        </p>
        
        <div className="flex gap-1.5">
          {note.category && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-main-2 text-[#FFFFFF]">
              {note.category}
            </span>
          )}

          {note.type && (
            <span 
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                note.type === 'important' 
                  ? 'bg-[#FF9191] text-white' 
                  : 'bg-[#68A2FF] text-white' 
              }`}
            >
              {note.type === 'important' ? '중요' : '일반'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteItem;