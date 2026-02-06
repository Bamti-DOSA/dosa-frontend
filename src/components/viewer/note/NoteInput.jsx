import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowUp, MessageSquare, Camera, FolderPlus, Link as LinkIcon, X } from 'lucide-react';
import aiPopup from '../../../assets/icons/icon-ai-popup.svg';
import aiPopupWhite from '../../../assets/icons/icon-ai-popup-white.svg';

const NoteInput = ({ onSave, onCancel, initialData = null, onOpenAiNote, isAiNoteOpen }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('카테고리');
  const [selectedType, setSelectedType] = useState('종류'); 
  const [activeMenu, setActiveMenu] = useState(null); 

  const [categoryList, setCategoryList] = useState(['부품 2 어쩌구', '부품 3 어쩌구']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
    
  const [attachments, setAttachments] = useState([]); 
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setSelectedCategory(initialData.category || '카테고리');
      setSelectedType(initialData.type || '종류');
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  // --- 첨부 핸들러 ---
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = type === 'image' ? URL.createObjectURL(file) : null;
      
      const newAttach = { 
        id: Date.now(), 
        type, 
        name: file.name, 
        file,
        previewUrl
      };
      setAttachments(prev => [...prev, newAttach]);
      setIsAttachMenuOpen(false);
    }
  };

  const handleLinkAdd = () => {
    const url = window.prompt("URL 주소를 입력해주세요:");
    if (url) {
        const newAttach = { id: Date.now(), type: 'link', name: url };
        setAttachments(prev => [...prev, newAttach]);
        setIsAttachMenuOpen(false);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = () => {
    if (!content.trim() && attachments.length === 0) return;
    const finalCategory = selectedCategory === '카테고리' ? '기타' : selectedCategory;
    const finalType = (selectedType === '종류' || selectedType === '일반') ? 'general' : 'important';
    
    onSave({ 
        title, 
        content, 
        category: finalCategory, 
        type: finalType,
        attachments: attachments 
    });
    
    setTitle(''); setContent(''); setAttachments([]);
  };

  const handleAddCustomCategory = () => {
    if (newCategoryInput.trim()) {
      setCategoryList([...categoryList, newCategoryInput.trim()]);
      setSelectedCategory(newCategoryInput.trim());
      setNewCategoryInput('');
      setActiveMenu(null);
    }
  };

  // 첨부파일 필터링
  const imageAttachments = attachments.filter(item => item.type === 'image');
  const otherAttachments = attachments.filter(item => item.type !== 'image');

  return (
    <div className="bg-[#FFF] mt-6 ml-4 animate-fade-in-up">
      <div className="bg-[#F0F2F5] rounded-[20px] p-4 relative">
        
        {/* 히든 인풋 */}
        <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => handleFileChange(e, "image")} />
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, "file")} />

        {initialData ? (
             <span className="bg-[#6B7280] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                메모 수정
             </span>
          ) : (
            <button 
                onClick={onOpenAiNote}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                    isAiNoteOpen 
                    ? 'bg-ai-gradient text-white'
                    : 'bg-white border border-ai-gradient text-main-1 hover:bg-blue-50'
                }`}
            >
                {isAiNoteOpen ? (
                <img src={aiPopupWhite} alt="AI 어시스턴트" className="w-3 h-3 mt-px"/>) : (<img src={aiPopup} alt="AI 어시스턴트" className="w-3 h-3 mt-px"/>
                )}
                AI 어시스턴트
            </button>
          )}

        <input 
          type="text"
          placeholder="제목"
          className="w-full pt-5 bg-transparent text-sm font-bold text-gray-900 placeholder-gray-400 outline-none pb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="h-[1px] w-full bg-main-3 mb-3 opacity-50"></div>

        {/* 사진 미리보기 영역 (본문 위) */}
        {imageAttachments.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pt-2 custom-scrollbar">
                {imageAttachments.map(item => (
                    <div key={item.id} className="relative w-16 h-16 shrink-0 group">
                        {/* 실제 이미지 렌더링 */}
                        <img 
                            src={item.previewUrl || item.url} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded-lg border border-gray-200 bg-white" 
                        />
                        {/* 삭제 버튼 */}
                        <button 
                            onClick={() => removeAttachment(item.id)} 
                            className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 border border-gray-100 text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        )}
        <textarea 
          placeholder="메모를 작성하세요" 
          className="w-full bg-transparent text-sm text-gray-700 resize-none outline-none min-h-[60px] placeholder-gray-400"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {/* 기타 첨부파일(파일, 링크) 목록 표시 (본문 아래) */}
        {otherAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 mt-1">
                {otherAttachments.map(item => (
                    <div key={item.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-md text-[10px] text-gray-600">
                        <span>{item.type === 'link' ? '🔗' : '📁'}</span>
                        <span className="max-w-[100px] truncate">{item.name}</span>
                        <button onClick={() => removeAttachment(item.id)} className="hover:text-red-500 ml-1"><X size={12} /></button>
                    </div>
                ))}
            </div>
        )}

         <div className="flex justify-between items-end mt-2 relative">
            <div className="flex gap-2 items-center">
                 {/* 플러스 버튼 (첨부 메뉴) */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                        className={`w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center text-gray-800 transition-transform ${isAttachMenuOpen ? 'rotate-45' : ''}`}
                    >
                        <Plus size={18} />
                    </button>
                    
                    {isAttachMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-[140px] bg-white rounded-xl border border-gray-100 p-1 z-30 animate-fade-in-up">
                            <button onClick={() => imageInputRef.current.click()} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-600 transition-colors">
                                <Camera size={14} /> 사진 첨부
                            </button>
                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-600 transition-colors">
                                <FolderPlus size={14} /> 파일 첨부
                            </button>
                            <button onClick={handleLinkAdd} className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-xs text-gray-600 transition-colors">
                                <LinkIcon size={14} /> 링크 첨부
                            </button>
                        </div>
                    )}
                 </div>

                 {/* 카테고리 버튼 */}
                 <div className="relative">
                    <button onClick={() => setActiveMenu(activeMenu === 'category' ? null : 'category')} className={`px-3 py-1.5 rounded-full text-xs transition-colors ${selectedCategory !== '카테고리' ? 'bg-main-2 text-white' : 'bg-bg-2 text-gray-700 border border-gray-500 hover:bg-gray-50'}`}>{selectedCategory}</button>
                    
                    {activeMenu === 'category' && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                            <div className="p-2 space-y-1">
                                {categoryList.map((cat, idx) => (
                                    <button key={idx} onClick={() => { setSelectedCategory(cat); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-xs font-bold text-gray-900 hover:bg-[#EDF2F6] rounded-lg transition-colors">{cat}</button>
                                ))}
                                
                                <div className="pt-2 mt-1 border-t border-gray-50 px-1">
                                    {isAddingCategory ? (
                                        <>
                                            <input 
                                                type="text" 
                                                placeholder="새 카테고리 입력" 
                                                className="w-full text-xs px-2 py-1.5 outline-none text-gray-600 placeholder-gray-300 bg-transparent"
                                                value={newCategoryInput}
                                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddCustomCategory();
                                                }}
                                                autoFocus
                                            />
                                            <button 
                                                onClick={handleAddCustomCategory} 
                                                disabled={!newCategoryInput.trim()}
                                                className={`w-full text-center mt-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                                                    newCategoryInput.trim() 
                                                    ? 'bg-[#EDF2F6] text-gray-600 hover:bg-[#E0E0E0]' 
                                                    : 'bg-[#F5F7FA] text-gray-400'
                                                }`}
                                            >
                                                추가
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => setIsAddingCategory(true)}
                                            className="w-full text-center mt-1 py-2 text-xs font-bold bg-[#EDF2F6] text-gray-600 hover:bg-[#D0D0D0] rounded-lg transition-colors flex items-center justify-center gap-1"
                                        >
                                            카테고리 추가 <Plus size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    </div>

                 {/* 종류 버튼 */}
                <div className="relative">
                <button 
                    onClick={() => setActiveMenu(activeMenu === 'type' ? null : 'type')} 
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    selectedType === 'important' 
                        ? 'bg-[#FF9191] border-[#FF9191] text-white'   // 중요 선택 시 (Red)
                        : selectedType === 'general'
                        ? 'bg-[#68A2FF] border-[#68A2FF] text-white' // 일반 선택 시 (Blue)
                        : 'bg-bg-2 border-gray-500 text-gray-500 hover:bg-gray-50' // 선택 안됨 (Default)
                    }`}
                >
                    {selectedType === 'important' ? '중요' : selectedType === 'general' ? '일반' : '종류'}
                </button>
                
                {activeMenu === 'type' && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl border border-blue-100 overflow-hidden z-30 animate-fade-in">
                    <div className="p-2 space-y-1">
                        <button onClick={() => { setSelectedType('important'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-[#EFEFEF] hover:font-bold rounded-lg transition-colors">중요</button>
                        <button onClick={() => { setSelectedType('general'); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-[#EFEFEF] hover:font-bold rounded-lg transition-colors">일반</button>
                    </div>
                    </div>
                )}
                </div>
            </div>
            
            <button onClick={handleSave} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-main-1 text-white`}><ArrowUp size={18} strokeWidth={3} /></button>
         </div>
      </div>
      
      <div className="bg-white text-right mt-2 mr-2">
         <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 underline">취소</button>
      </div>
    </div>
  );
};

export default NoteInput;