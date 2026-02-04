import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import more from '../../../assets/icons/more.svg';

const NoteFull = ({ note, onClose, onDelete, onEdit }) => {
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

  if (!note) return null;

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in p-6 overflow-y-auto custom-scrollbar">
      
      {/* 상단 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          {note.category && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#BFBFBF] text-white">
              {note.category}
            </span>
          )}
          {note.type && (
            <span 
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                note.type === 'important' 
                  ? 'bg-[#FF9292] text-white' 
                  : 'bg-[#96C28B] text-white' 
              }`}
            >
              {note.type === 'important' ? '중요' : '일반'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                    <img src={more} alt="more" width={20} height={20} />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-fade-in">
                        <button 
                            onClick={() => { setIsMenuOpen(false); onEdit(note.id); }} 
                            className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-[#EFEFEF] transition-colors"
                        >
                            수정
                        </button>
                        <button 
                            onClick={() => { setIsMenuOpen(false); onDelete(note.id); }} 
                            className="block w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-[#EFEFEF] transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            <button 
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800"
            >
                <X size={24} strokeWidth={2} />
            </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 font-medium mb-2">
        {note.date}
      </div>

      {note.title && (
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 leading-tight">
            {note.title}
        </h1>
      )}

      <div className="text-sm text-gray-700 leading-7 whitespace-pre-wrap break-words">
        {note.content}
      </div>

    </div>
  );
};

export default NoteFull;