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
        className={`p-4 rounded-xl shadow-sm border transition-all duration-300 group relative ${
          isEditing 
            ? 'bg-[#FFFDFD] border-red-400 ring-1 ring-red-400 shadow-md' 
            : 'bg-[#F0F0F2] border-gray-100 hover:border-gray-300' 
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className="text-[11px] text-gray-400 font-medium tracking-tight">{note.date}</span>
          
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
              <div className="absolute right-0 top-full mt-1 w-20 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-fade-in">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onEdit && onEdit(note.id); }} 
                  className="block w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-[#EFEFEF] transition-colors"
                >
                  수정
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete && onDelete(note.id); }} 
                  className="block w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-[#EFEFEF] transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
        
        {note.title && (
            <>
                <h3 className="text-sm font-bold text-gray-900 pb-2">{note.title}</h3>
                <div className="h-[1px] w-full bg-gray-300 mb-3 opacity-50"></div>
            </>
        )}
        
        <p className="text-xs text-gray-600 leading-relaxed mb-3 break-words line-clamp-2 whitespace-pre-wrap">
          {note.content}
        </p>
        
        <div className="flex gap-1.5 mt-2">
          {note.category && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#BFBFBF] text-white">
              {note.category}
            </span>
          )}

          {note.type && (
            <span 
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                note.type === 'important' 
                  ? 'bg-[#FF9292] text-white' 
                  : 'bg-[#96C28B] text-white' 
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