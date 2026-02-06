import React, { useState, useMemo } from 'react';
import Edit from '../../../assets/icons/icon-edit.svg';

const AiMenu = ({ chatSessions = [], onClose, onSelectChat, onNewChat }) => {
  const [openGroups, setOpenGroups] = useState({}); 

  const toggleGroup = (groupName) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const groupedChats = useMemo(() => {
    const groups = {};
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const todayStr = `${today.getDate()}. ${months[today.getMonth()]}`;

    chatSessions.forEach(chat => {
      const dateKey = chat.date.split(' ').slice(0, 2).join(' '); 
      const groupName = dateKey === todayStr ? '최근' : dateKey;

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(chat);
    });

    return groups;
  }, [chatSessions]);

  const hasData = chatSessions.length > 0;

  const groupKeys = Object.keys(groupedChats).sort((a, b) => {
    if (a === '최근') return -1;
    if (b === '최근') return 1;
    return 0; 
  });

  return (
    <>
      {/* 배경 오버레이 (클릭 시 닫기) */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-transparent z-[9990] cursor-default"
      />

      {/* 사이드 메뉴 패널 */}
      {/* custom-scrollbar는 index.css에 정의되어 있다고 가정 */}
      <div className="absolute top-0 left-0 bottom-0 w-[260px] bg-[#F6F8F9] shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[9999] overflow-y-auto border-r border-gray-100 animate-slide-in-left custom-scrollbar">
        
        <div className="p-5">
          {/* 새로운 대화 시작 버튼 */}
          <div className="mb-6">
            <button 
                onClick={() => {
                    onNewChat(); 
                    onClose();   
                }}
                className="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors flex items-center gap-2"
            >
                <img src={Edit} alt="edit icon" className="w-4 h-4" /> 
                새로운 대화 시작
            </button>
          </div>

          {!hasData && (
            <div className="text-gray-400 text-xs text-center py-10 leading-relaxed">
              저장된 대화 내역이<br/>없습니다
            </div>
          )}

          {/* 대화 리스트 */}
          <div className="space-y-4">
            {groupKeys.map((groupName) => {
              const items = groupedChats[groupName];
              const isOpen = openGroups[groupName] !== false; 

              return (
                <div key={groupName} className="select-none">
                  <button 
                    onClick={() => toggleGroup(groupName)}
                    className="w-full flex justify-between items-center py-2 px-1 mb-1 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                  >
                    <span>{groupName}</span>
                  </button>

                  {isOpen && (
                    <div className="space-y-1">
                      {items.map((chat) => (
                        <button 
                          key={chat.id} 
                          onClick={() => {
                              onSelectChat(chat.id); 
                              onClose();
                          }} 
                          className="w-full text-left px-3 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all truncate font-medium flex items-center gap-3"
                        >
                          <span className="truncate">{chat.title || "새로운 대화"}</span>
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

export default AiMenu;