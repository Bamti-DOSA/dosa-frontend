import React, { useState } from 'react';
import rotate from '../../../assets/icons/rotate.svg';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const NoteMenu = ({ groupedNotes = {}, onClose, onNoteClick }) => {
  const [openCategories, setOpenCategories] = useState({});
  const toggleCategory = (cat) => setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  const hasData = Object.keys(groupedNotes).length > 0;

  return (
    <>
      {/* 1. 투명한 배경 (클릭 시 닫힘) - 흐림/색상 제거 */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'transparent', // 완전 투명
          zIndex: 9990,
          cursor: 'default'
        }}
      />

      {/* 2. 사이드바 메뉴 본체 */}
      <div 
        className="custom-scrollbar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0, // 세로로 꽉 차게
          width: '260px', // 가로폭 좁게 고정
          backgroundColor: '#ffffff',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)', // 오른쪽으로 그림자 살짝
          zIndex: 9999,
          overflowY: 'auto',
          borderRight: '1px solid #f3f4f6',
          // 슬라이드 애니메이션 (왼쪽 -> 오른쪽)
          animation: 'slideInLeft 0.3s ease-out forwards' 
        }}
      >
        {/* 애니메이션 키프레임 정의 (스타일 태그 삽입) */}
        <style>
          {`
            @keyframes slideInLeft {
              from { transform: translateX(-100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}
        </style>

        <div className="p-5">
          {/* 기존 메모장 이동 링크 (이미지 참고) */}
          <div className="mb-6">
            <button 
                onClick={onClose} // 클릭 시 메뉴 닫기
                className="text-sm text-gray-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-2" // 아이콘 정렬
            >
                <img 
                  src={rotate} 
                  alt="back" 
                  width={16} 
                  height={16} 
                  // 필요하다면 Tailwind 클래스로 크기 조절 가능
                  // className="w-4 h-4" 
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