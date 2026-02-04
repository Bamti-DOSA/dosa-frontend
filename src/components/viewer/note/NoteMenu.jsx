import React, { useState } from 'react';
import rotate from '../../../assets/icons/rotate.svg';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NoteMenu = ({ groupedNotes = {}, onClose, onNoteClick }) => {
  const [openCategories, setOpenCategories] = useState({});
  const toggleCategory = (cat) => setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  const hasData = Object.keys(groupedNotes).length > 0;

  return (
    <>
      {/* 1. 투명한 배경 (클릭 시 닫힘) */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-transparent z-[9990] cursor-default"
      />

      {/* 2. 사이드바 메뉴 본체 */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-[260px] bg-white z-[9999] overflow-y-auto border-r border-gray-100 custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.08)] animate-slideInLeft"
      >
        <div className="p-5">
          {/* 기존 메모장 이동 링크 */}
          <div className="mb-6">
            <button 
                onClick={onClose} 
                className="w-full text-sm rounded-md text-gray-900 font-medium hover:text-gray-900 hover:bg-gray-100 p-2 transition-colors flex items-center gap-2"
            >
                <img 
                  src={rotate} 
                  alt="back" 
                  width={16} 
                  height={16} 
                />
                기존 메모장으로 이동
            </button>
          </div>

          {!hasData && (
            <div className="text-gray-400 text-xs text-center py-10 leading-relaxed">
              노트를 추가하여<br/>공부한 내용을 정리해 보세요
            </div>
          )}

          {/* 카테고리 리스트 (아코디언) */}
          <div className="space-y-1">
            {Object.entries(groupedNotes).map(([categoryName, items]) => {
              const isOpen = openCategories[categoryName];
              return (
                <div key={categoryName} className="select-none">
                  {/* 카테고리 명 (폴더) */}
                  <button 
                    onClick={() => toggleCategory(categoryName)}
                    className="w-full flex justify-between items-center py-3 px-1 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                       {categoryName}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                  </button>

                  {/* 하위 노트 리스트 */}
                  {isOpen && (
                    <div className="ml-2 pl-2 border-l-2 border-gray-100 mt-1 mb-3 space-y-1">
                      {items.map((note) => (
                        <button 
                          key={note.id} 
                          onClick={() => onNoteClick(note.id)} 
                          className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all truncate font-medium"
                        >
                          {note.title || "제목 없음"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteMenu;