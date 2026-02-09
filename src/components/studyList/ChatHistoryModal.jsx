import React, { useEffect, useState } from "react";
import { getChatsByModel } from "../../api/aiDB";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  MessageSquare,
  Clock,
  ArrowLeft,
  X,
  File,
} from "lucide-react";

const MODEL_NAMES = {
  1: "Drone",
  2: "Leaf Spring",
  3: "Machine Vice",
  4: "Robot Arm",
  5: "Robot Gripper",
  6: "Suspension",
  7: "V4 Engine",
};

const ChatHistoryModal = ({ isOpen, onClose, allModels }) => {
  const [groupedChats, setGroupedChats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (isOpen) loadAllChatHistory();
  }, [isOpen]);

  const loadAllChatHistory = async () => {
    try {
      setLoading(true);
      const chatPromises = allModels.map((model) =>
        getChatsByModel(model.objectId),
      );
      const results = await Promise.all(chatPromises);
      const newGroupedData = {};
      allModels.forEach((model, index) => {
        if (results[index]?.length > 0) {
          newGroupedData[model.objectId] = results[index].sort(
            (a, b) => b.lastUpdated - a.lastUpdated,
          );
        }
      });
      setGroupedChats(newGroupedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (modelId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) newSet.delete(modelId);
      else newSet.add(modelId);
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fade-in">
      <div className="bg-white rounded-xl w-[850px] h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {selectedChat ? (
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-main-1" />
              </div>
            )}
            <h2 className="t-18-bold text-gray-900">
              {selectedChat ? "대화 상세 내용" : "AI 대화 내역"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 본문 영역 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {selectedChat ? (
            /* 💬 상세보기 뷰: 이미지 렌더링 추가 */
            <div className="p-6 space-y-6">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl shadow-sm border b-14-med ${
                      msg.role === "user"
                        ? "bg-main-1 text-white"
                        : "bg-white text-gray-800 border-gray-100"
                    }`}
                  >
                    <div
                      className={`text-[11px] mb-1 font-bold uppercase tracking-wider ${msg.role === "user" ? "text-white/70" : "text-gray-400"}`}
                    >
                      {msg.role === "user" ? "You" : "Assistant"}
                    </div>

                    {/* 📸 이미지 첨부물 표시 (AssistantAi와 동일한 로직) */}
                    {msg.attachments?.some((a) => a.type === "image") && (
                      <div className="flex flex-wrap gap-2 mb-3 mt-1">
                        {msg.attachments
                          .filter((a) => a.type === "image")
                          .map((img, i) => (
                            <img
                              key={i}
                              src={img.preview}
                              alt="attached"
                              className="w-32 h-32 object-cover rounded-lg border border-white/20 shadow-sm"
                            />
                          ))}
                      </div>
                    )}

                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* 📁 일반 파일 첨부물 표시 */}
                    {msg.attachments
                      ?.filter((a) => a.type !== "image")
                      .map((file, i) => (
                        <div
                          key={i}
                          className={`mt-2 pt-2 border-t text-[11px] flex items-center gap-1 ${
                            msg.role === "user"
                              ? "border-white/20 text-white/80"
                              : "border-gray-100 text-gray-500"
                          }`}
                        >
                          <File size={12} />
                          {file.name}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 📂 목록 뷰 (기존과 동일) */
            <div className="p-6 space-y-3">
              {Object.entries(groupedChats).map(([modelId, chats]) => (
                <div
                  key={modelId}
                  className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <div
                    onClick={() => toggleFolder(modelId)}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {expandedFolders.has(modelId) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    <Folder className="w-5 h-5 text-main-1" />
                    <span className="t-16-bold flex-1">
                      {MODEL_NAMES[modelId] || "알 수 없음"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {chats.length}개의 세션
                    </span>
                  </div>

                  {expandedFolders.has(modelId) && (
                    <div className="divide-y divide-gray-50 border-t border-gray-50">
                      {chats.map((chat) => (
                        <div
                          key={chat.chatId}
                          onClick={() => setSelectedChat(chat)}
                          className="p-4 hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <div className="t-15-semi text-gray-800 mb-1 truncate">
                            {chat.messages.find((m) => m.role === "user")
                              ?.content || "새로운 대화"}
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{" "}
                              {new Date(chat.lastUpdated).toLocaleString()}
                            </span>
                            <span className="text-main-1 font-bold">
                              메시지 {chat.messages.length}개
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
