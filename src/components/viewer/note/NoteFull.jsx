import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import more from '../../../assets/icons/more.svg';

const NoteFull = ({ note, onClose, onDelete, onEdit }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const imageAttachments = note.attachments?.filter(item => item.type === 'image') || [];

  return (
    <div className="h-full flex flex-col bg-white animate-fade-in p-6 overflow-hidden custom-scrollbar">

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-[2px]  flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)} 
        >
          <div className="relative max-w-full max-h-full " onClick={(e) => e.stopPropagation()}>
             <img 
               src={selectedImage} 
               alt="Full view" 
               className="max-w-full max-h-[90vh] object-contain rounded-lg animate-scale-in "
             />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-2 text-white rounded-full transition-all z-50 cursor-pointer"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
      
      <div className="shrink-0 mb-4">
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
          <h1 className="text-2xl font-extrabold text-gray-900 pb-3 leading-tight">
              {note.title}
          </h1>
        )}

        {imageAttachments.length > 0 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {imageAttachments.map((img, idx) => (
                  <div key={idx} className="shrink-0">
                      <img 
                          src={img.previewUrl || img.url} 
                          alt={img.name} 
                          className="h-64 w-auto object-cover rounded-xl border border-[#D5D5D5] cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage(img.previewUrl || img.url)}
                      />
                  </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
        <div className="text-4 text-gray-800 leading-7 whitespace-pre-wrap break-words">
          {note.content}
        </div>
      </div>

    </div>
  );
};

export default NoteFull;