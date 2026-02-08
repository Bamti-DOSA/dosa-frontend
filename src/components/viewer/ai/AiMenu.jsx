import React, { useState, useEffect, useMemo } from "react";
import Edit from "../../../assets/icons/icon-edit.svg";
import { getChatsByModel } from "../../../api/aiDB";
import { ChevronDown, ChevronUp } from "lucide-react";

const AiMenu = ({
  modelId,
  currentChatId,
  onClose,
  onSelectChat,
  onNewChat,
}) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  const getGroupName = (chatDate) => {
    const today = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const todayStr = `${today.getDate()}. ${months[today.getMonth()]}`;
    return chatDate === todayStr ? "최근" : chatDate;
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!modelId) return;
      const chats = await getChatsByModel(modelId);

      const formattedChats = chats.map((chat) => {
        const d = new Date(chat.lastUpdated || Date.now());
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const dateStr = `${d.getDate()}. ${months[d.getMonth()]}`;

        const firstUserMsg = chat.messages?.find(
          (m) => m.role === "user",
        )?.content;

        return {
          ...chat,
          id: chat.chatId,
          date: dateStr,
          title: firstUserMsg || "새로운 대화",
        };
      });

      setChatSessions(
        formattedChats.sort(
          (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0),
        ),
      );

      // 초기 로드 시 모든 그룹 펼침
      const initialOpenState = {};
      formattedChats.forEach((chat) => {
        const groupName = getGroupName(chat.date);
        initialOpenState[groupName] = true;
      });
      setOpenGroups(initialOpenState);
    };

    loadHistory();
  }, [modelId]);

  const groupedChats = useMemo(() => {
    const groups = {};
    chatSessions.forEach((chat) => {
      const groupName = getGroupName(chat.date);
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(chat);
    });
    return groups;
  }, [chatSessions]);

  const groupKeys = Object.keys(groupedChats).sort((a, b) => {
    if (a === "최근") return -1;
    if (b === "최근") return 1;
    return b.localeCompare(a);
  });

  const handleToggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <>
      <div
        onClick={onClose}
        className="absolute inset-0 bg-transparent z-[9990]"
      />
      <div className="absolute top-0 left-0 bottom-0 w-[260px] bg-[#F6F8F9] shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[9999] overflow-y-auto border-r border-gray-100 animate-slide-in-left custom-scrollbar">
        <div className="p-5">
          <button
            onClick={() => {
              onClose(true);
              onNewChat();
            }}
            className="b-16-med-120 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-6"
          >
            <img src={Edit} alt="edit" className="w-4 h-4" /> 새로운 대화 시작
          </button>

          {chatSessions.length === 0 && (
            <div className="text-gray-400 b-14-reg-160 text-center py-10">
              저장된 대화가 없습니다.
            </div>
          )}

          <div className="space-y-4">
            {groupKeys.map((groupName) => {
              const isOpen = openGroups[groupName];

              return (
                <div key={groupName} className="select-none">
                  <div
                    className="flex flex-row justify-between items-center cursor-pointer hover:bg-bg-1 rounded-md px-1 transition-colors"
                    onClick={() => handleToggleGroup(groupName)}
                  >
                    <div className="py-2 mb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {groupName}
                    </div>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {groupedChats[groupName].map((chat) => {
                        // 💡 현재 활성화된 채팅방인지 확인
                        const isSelected = chat.id === currentChatId;

                        return (
                          <button
                            key={chat.id}
                            onClick={() => {
                              onSelectChat(chat.id);
                              onClose();
                            }}
                            // 💡 선택 여부에 따라 배경색 조건부 렌더링
                            className={`w-full text-left p-3 b-16-med-120 truncate transition-all rounded-[8px] ${
                              isSelected
                                ? "bg-bg-1 text-main-1 font-bold" // 현재 대화방 스타일
                                : "bg-gray-50 text-gray-9 hover:bg-bg-1" // 일반 스타일
                            }`}
                          >
                            {chat.title}
                          </button>
                        );
                      })}
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
