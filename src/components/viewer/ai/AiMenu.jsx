import React, { useState, useEffect, useMemo } from "react";
import Edit from "../../../assets/icons/icon-edit.svg";
import { getChatsByModel } from "../../../api/aiDB";
import { ChevronDown, ChevronUp } from "lucide-react";

const AiMenu = ({ modelId, onClose, onSelectChat, onNewChat }) => {
  const [chatSessions, setChatSessions] = useState([]);
  // 💡 그룹별 개별 상태 관리를 위해 객체({})로 초기화합니다.
  const [openGroups, setOpenGroups] = useState({});

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

      // 💡 데이터 로드 시 모든 그룹을 기본적으로 펼침 상태로 설정
      const initialOpenState = {};
      formattedChats.forEach((chat) => {
        const groupName = getGroupName(chat.date);
        initialOpenState[groupName] = true;
      });
      setOpenGroups(initialOpenState);
    };

    loadHistory();
  }, [modelId]);

  // 💡 오늘 날짜인지 판별하여 그룹명을 반환하는 유틸 함수
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

  // 💡 특정 그룹의 아이디를 받아 해당 그룹만 토글합니다.
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
              const isOpen = openGroups[groupName]; // 💡 현재 그룹의 오픈 상태 확인

              return (
                <div key={groupName} className="select-none">
                  {/* 헤더 부분 클릭 시에도 토글되도록 설정 */}
                  <div
                    className="flex flex-row justify-between items-center cursor-pointer  px-1 transition-colors"
                    onClick={() => handleToggleGroup(groupName)}
                  >
                    <div className="py-2 mb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {groupName}
                    </div>
                    {/* 💡 상태에 따라 아이콘 변경 */}
                    {isOpen ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>

                  {/* 💡 isOpen이 true일 때만 목록을 렌더링 */}
                  {isOpen && (
                    <div className="space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {groupedChats[groupName].map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            onSelectChat(chat.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 b-16-med-120 text-gray-9 hover:bg-bg-1 rounded-[8px] transition-all truncate"
                        >
                          {chat.title}
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
