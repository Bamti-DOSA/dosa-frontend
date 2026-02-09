import React, { useState, useEffect, useMemo } from "react";
import Edit from "../../../assets/icons/icon-edit.svg";
import { getChatsByModel, deleteChat } from "../../../api/aiDB"; // deleteChat 임포트 통합
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
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    chatId: null,
  });

  // 우클릭 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () =>
      setContextMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      chatId: chatId,
    });
  };

  const handleDeleteChat = async () => {
    const targetId = contextMenu.chatId;
    if (!targetId) return;

    if (!window.confirm("대화를 정말 삭제하시겠습니까?")) return;

    try {
      console.log("삭제 타겟 ID:", targetId, typeof targetId);
      console.log("현재 활성 ID:", currentChatId, typeof currentChatId);
      const isDeleted = await deleteChat(targetId);

      if (isDeleted) {
        // 1. UI 목록 업데이트
        setChatSessions((prev) =>
          prev.filter((chat) => String(chat.id) !== String(targetId)),
        );

        const isViewingDeletedChat = String(targetId) === String(currentChatId);

        console.log("현재 보고 있는 채팅인가?:", isViewingDeletedChat);
        // 2. 현재 보고 있는 방을 삭제했는지 체크 (타입 일치를 위해 String 변환)
        if (isViewingDeletedChat) {
          console.log("✅ 조건 일치! onNewChat()을 실행합니다.");
          onNewChat();
        }
      }
    } catch (error) {
      console.error("삭제 실패:", error);
    } finally {
      setContextMenu({ ...contextMenu, show: false });
    }
  };

  // 날짜 그룹핑 함수 (기존 로직 유지)
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

  // 데이터 로딩
  useEffect(() => {
    const loadHistory = async () => {
      if (!modelId) return;
      try {
        const chats = await getChatsByModel(modelId);
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

        const formattedChats = chats.map((chat) => {
          const d = new Date(chat.lastUpdated || Date.now());
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

        const sortedChats = formattedChats.sort(
          (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0),
        );
        setChatSessions(sortedChats);

        const initialOpenState = {};
        sortedChats.forEach((chat) => {
          initialOpenState[getGroupName(chat.date)] = true;
        });
        setOpenGroups(initialOpenState);
      } catch (err) {
        console.error("채팅 목록 로드 실패:", err);
      }
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

  return (
    <>
      {/* 배경 레이어 (메뉴 닫기용) */}
      <div
        onClick={() => onClose()}
        className="fixed inset-0 bg-transparent z-[9990]"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 bottom-0 w-[260px] bg-[#F6F8F9] shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[9999] overflow-y-auto border-r border-gray-100 animate-slide-in-left custom-scrollbar"
      >
        <div className="p-5">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="b-16-med-120 text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-6 w-full"
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
                    className="flex flex-row justify-between items-center cursor-pointer hover:bg-gray-200 rounded-md px-1 transition-colors"
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [groupName]: !prev[groupName],
                      }))
                    }
                  >
                    <div className="py-2 mb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {groupName}
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="space-y-1 mt-1">
                      {groupedChats[groupName].map((chat) => (
                        <button
                          key={chat.id}
                          onContextMenu={(e) => handleContextMenu(e, chat.id)}
                          onClick={() => {
                            onSelectChat(chat.id);
                            onClose();
                          }}
                          className={`w-full text-left p-3 b-16-med-120 truncate transition-all rounded-[8px] ${
                            String(chat.id) === String(currentChatId)
                              ? "bg-bg-1 text-main-1 font-bold"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
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

      {/* 커스텀 우클릭 메뉴 */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-[10001] min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // 메뉴 안 클릭 시 닫히지 않게
        >
          <button
            onClick={handleDeleteChat}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            대화 삭제하기
          </button>
        </div>
      )}
    </>
  );
};

export default AiMenu;
