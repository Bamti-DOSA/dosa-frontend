import React, { useState } from 'react';
import { Plus, ArrowUp } from 'lucide-react';

const NoteInput = ({ onSave, onCancel }) => {
  // 입력 폼 내부 상태 관리
  const [title, setTitle] = useState('');     // 🆕 제목 상태 추가
  const [content, setContent] = useState(''); // 본문 상태
  
  const [selectedCategory, setSelectedCategory] = useState('카테고리');
  const [selectedType, setSelectedType] = useState('종류'); 
  const [activeMenu, setActiveMenu] = useState(null); 

  // 카테고리 목록
  const [categoryList, setCategoryList] = useState([
    '부품 2 어쩌구', '부품 3 어쩌구', '부품 4 어쩌구', '부품 5 어쩌구'
  ]);

  // 저장 버튼 클릭 핸들러
  const handleSave = () => {
    // 내용이 없으면 저장 안 함 (제목만 있어도 저장 안 되게 할지, 둘 중 하나만 있어도 되게 할지는 정책에 따라 결정)
    if (!content.trim()) return; 

    // 데이터 정제
    const finalCategory = selectedCategory === '카테고리' ? '기타' : selectedCategory;
    const finalType = (selectedType === '종류' || selectedType === '일반') ? 'general' : 'important';

    // 부모에게 데이터 전달
    onSave({
      title: title,       // 🆕 제목 전달
      content: content,   // 본문 전달
      category: finalCategory,
      type: finalType
    });

    // 입력창 초기화
    setTitle('');
    setContent('');
  };

  // 카테고리 직접 추가
  const handleAddCustomCategory = () => {
    const newCat = prompt("추가할 카테고리 이름을 입력하세요:");
    if (newCat) {
      setCategoryList([...categoryList, newCat]);
      setSelectedCategory(newCat);
      setActiveMenu(null);
    }
  };

  return (
    <div className="mt-6 ml-4 animate-fade-in-up">
      {/* 입력창 컨테이너 */}
      <div className="bg-[#F0F2F5] rounded-[20px] p-4 relative">
        
        {/* 상단 라벨 */}
        <div className="mb-3">
          <span className="bg-[#6B7280] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            AI어시스턴트
          </span>
        </div>

        {/* 🆕 제목 입력 영역 */}
        <input 
          type="text"
          placeholder="제목"
          className="w-full bg-transparent text-sm font-bold text-gray-900 placeholder-gray-400 outline-none pb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus // 제목부터 입력하도록 포커스 이동
        />

        {/* 🆕 구분선 (얇은 보더) */}
        <div className="h-[1px] w-full bg-gray-300 mb-3 opacity-50"></div>

        {/* 본문 입력 영역 */}
        <textarea 
          placeholder="메모를 작성하세요" 
          className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none min-h-[60px] placeholder-gray-400"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 하단 툴바 */}
        <div className="flex justify-between items-end mt-2 relative">
          
          {/* 왼쪽 버튼 그룹 (+, 카테고리, 종류) */}
          <div className="flex gap-2 items-center">
            
            {/* Plus Button */}
            <button className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm">
              <Plus size={18} />
            </button>

            {/* 카테고리 버튼 */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'category' ? null : 'category')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-colors ${
                  activeMenu === 'category' || selectedCategory !== '카테고리'
                  ? 'bg-[#B8B8B8] border-[#C6C6C6] text-[#6F6F6F]' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {selectedCategory}
              </button>

              {/* 카테고리 팝업 메뉴 */}
              {activeMenu === 'category' && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                  <div className="p-2 space-y-1">
                      <div className="px-3 py-2 text-[10px] text-gray-400 tracking-widest text-center border-b border-dashed border-gray-200 mb-1">
                          SELECT CATEGORY
                      </div>
                      {categoryList.map((cat, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-[#EFEFEF] rounded-lg transition-colors"
                          >
                          {cat}
                          </button>
                      ))}
                      <button 
                          onClick={handleAddCustomCategory}
                          className="w-full text-center mt-1 px-3 py-2.5 text-xs font-bold bg-[#E5E7EB] text-gray-600 hover:bg-[#EFEFEF] rounded-lg transition-colors"
                      >
                          카테고리 추가
                      </button>
                  </div>
                </div>
              )}
            </div>

            {/* 종류 버튼 */}
            <div className="relative">
              <button 
                  onClick={() => setActiveMenu(activeMenu === 'type' ? null : 'type')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm transition-colors ${
                  activeMenu === 'type' || selectedType !== '종류'
                  ? 'bg-[#B8B8B8] border-[#C6C6C6] text-[#6F6F6F]' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {selectedType === 'important' ? '중요' : selectedType === 'general' ? '일반' : '종류'}
              </button>

              {/* 종류 팝업 메뉴 */}
              {activeMenu === 'type' && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                    <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-bold text-gray-900 mb-1">중요도</div>
                        <div className="space-y-1">
                          <button 
                              onClick={() => { setSelectedType('important'); setActiveMenu(null); }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-[#EFEFEF] hover:font-bold rounded-lg transition-colors"
                          >
                              중요
                          </button>
                          <button 
                              onClick={() => { setSelectedType('general'); setActiveMenu(null); }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-[#EFEFEF] hover:font-bold rounded-lg transition-colors"
                          >
                              일반
                          </button>
                        </div>
                    </div>
                  </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <button 
            onClick={handleSave}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
              content.trim() 
              ? 'bg-[#374151] text-white hover:bg-black' 
              : 'bg-gray-300 text-white cursor-not-allowed'
            }`}
          >
            <ArrowUp size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      {/* 취소 버튼 */}
      <div className="text-right mt-2 mr-2">
         <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 underline">
            취소
         </button>
      </div>
    </div>
  );
};

export default NoteInput;