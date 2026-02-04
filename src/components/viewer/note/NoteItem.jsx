import React from 'react';
import more from '../../../assets/icons/more.svg'
// 만약 more 아이콘이 없어서 엑박이 뜨면 아래 Lucide 아이콘을 쓰세요
// import { MoreHorizontal } from 'lucide-react'; 

const NoteItem = ({ note, isFirst }) => {
  return (
    <div id={note.id} className="relative pl-8 pb-2 scroll-mt-24"> 
      
      {/* 타임라인 점 */}
      {isFirst && (
        <div className="absolute left-0 top-0 mt-1 w-4 h-4 rounded-full bg-[#E5E7EB] border-2 border-white z-10"></div>
      )}
      
      {/* 노트 카드 본문 */}
      <div className="bg-[#F0F0F2] p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[11px] text-gray-400 font-medium tracking-tight">{note.date}</span>
          <button className="text-gray-300 hover:text-gray-500">
            {/* 이미지가 안 나오면 <MoreHorizontal size={16} /> 로 대체 가능 */}
            <img src={more} alt="more" width={16} height={16} />
          </button>
        </div>
        
        {/* 제목 영역 (구분선 추가) */}
        {note.title && (
            <>
                <h3 className="text-sm font-bold text-gray-900 pb-2">{note.title}</h3>
            </>
        )}
        
        {/* 본문 */}
        <p className="text-xs text-gray-600 leading-relaxed mb-3 break-words whitespace-pre-wrap">
          {note.content}
        </p>
        
        {/* 태그 영역 */}
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