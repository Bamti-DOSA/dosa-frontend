import React, { useState, useEffect } from 'react';
import { Plus, ArrowUp } from 'lucide-react';

// 👇 initialData prop 추가 (수정 시 기존 데이터 받아옴)
const NoteInput = ({ onSave, onCancel, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('카테고리');
  const [selectedType, setSelectedType] = useState('종류'); 
  const [activeMenu, setActiveMenu] = useState(null); 

  const [categoryList, setCategoryList] = useState([
    '부품 2 어쩌구', '부품 3 어쩌구', '부품 4 어쩌구', '부품 5 어쩌구'
  ]);

  // 👇 [핵심] 수정 모드일 때 기존 데이터 채워넣기
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setSelectedCategory(initialData.category || '카테고리');
      // type이 있으면 그 값으로, 없으면 '종류'
      setSelectedType(initialData.type || '종류');
    }
  }, [initialData]);

  const handleSave = () => {
    if (!content.trim()) return;

    const finalCategory = selectedCategory === '카테고리' ? '기타' : selectedCategory;
    const finalType = (selectedType === '종류' || selectedType === '일반') ? 'general' : 'important';

    onSave({
      title: title,
      content: content,
      category: finalCategory,
      type: finalType
    });

    setTitle('');
    setContent('');
  };

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
      <div className="bg-[#F0F2F5] rounded-[20px] p-4 relative">
        <div className="mb-3">
          <span className="bg-[#6B7280] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {initialData ? '메모 수정' : 'AI어시스턴트'} 
          </span>
        </div>

        <input 
          type="text"
          placeholder="제목"
          className="w-full bg-transparent text-sm font-bold text-gray-900 placeholder-gray-400 outline-none pb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="h-[1px] w-full bg-gray-300 mb-3 opacity-50"></div>

        <textarea 
          placeholder="메모를 작성하세요" 
          className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none min-h-[60px] placeholder-gray-400"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-between items-end mt-2 relative">
          <div className="flex gap-2 items-center">
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

              {activeMenu === 'category' && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                  <div className="p-2 space-y-1">
                      {categoryList.map((cat, idx) => (
                          <button 
                            key={idx}
                            onClick={() => { setSelectedCategory(cat); setActiveMenu(null); }}
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

              {activeMenu === 'type' && (
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                    <div className="p-2">
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
      
      <div className="text-right mt-2 mr-2">
         <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 underline">
            취소
         </button>
      </div>
    </div>
  );
};

export default NoteInput;