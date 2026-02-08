import React, { useState, useEffect, useMemo } from "react";
import Edit from "../../../assets/icons/icon-edit.svg";
import { getChatsByModel } from "../../../api/aiDB"; // DB 함수 추가

const AiMenu = ({ modelId, onClose, onSelectChat, onNewChat }) => {
  const [chatSessions, setChatSessions] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  // 💡 데이터 로드 및 포맷팅
  useEffect(() => {
    const loadHistory = async () => {
      if (!modelId) {
        console.warn("AiMenu: modelId가 없습니다.");
        return;
      }

      console.log(
        `🔍 ID: ${modelId} (타입: ${typeof modelId}) 모델의 대화 조회 중...`,
      );
      const chats = await getChatsByModel(modelId);
      console.log("📥 DB에서 가져온 원본 데이터:", chats); // 💡 여기서 []가 나오면 타입 문제임

      const formattedChats = chats.map((chat) => {
        // 날짜 객체 생성 (lastUpdated가 없으면 에러 나므로 현재 시간으로 방어)
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

        // 첫 번째 유저 질문 추출
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

      // 최신순 정렬
      setChatSessions(
        formattedChats.sort(
          (a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0),
        ),
      );
    };

    loadHistory();
  }, [modelId]);

  const groupedChats = useMemo(() => {
    const groups = {};
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

    chatSessions.forEach((chat) => {
      const groupName = chat.date === todayStr ? "최근" : chat.date;
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
      <div
        onClick={onClose}
        className="absolute inset-0 bg-transparent z-[9990]"
      />
      <div className="absolute top-0 left-0 bottom-0 w-[260px] bg-[#F6F8F9] shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[9999] overflow-y-auto border-r border-gray-100 animate-slide-in-left custom-scrollbar">
        <div className="p-5">
          <button
            onClick={onNewChat}
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
            {groupKeys.map((groupName) => (
              <div key={groupName} className="select-none">
                <div className="py-2 px-1 mb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {groupName}
                </div>
                <div className="space-y-1">
                  {groupedChats[groupName].map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className="w-full text-left p-3 b-16-med-120 text-gray-9 hover:bg-bg-1 rounded-[8px] transition-all truncate "
                    >
                      {chat.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default AiMenu;
