import React, { useEffect, useState } from "react";
import { db } from "../../db/notesDB";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Folder, FileText, X } from "lucide-react";

// 모델 ID와 이름 매핑
const MODEL_NAMES = {
  1: "Drone",
  2: "Leaf Spring",
  3: "Machine Vice",
  4: "Robot Arm",
  5: "Robot Gripper",
  6: "Suspension",
  7: "V4 Engine",
};

const NotesModal = ({ isOpen, onClose, allModels }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotes();
    }
  }, [isOpen]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await db.notes.toArray();
      setNotes(allNotes);

      // 기본값: 모든 폴더 접힌 상태
      setExpandedFolders(new Set());
    } catch (error) {
      console.error("❌ 노트 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = (modelId) => {
    const model = allModels.find((m) => m.objectId === modelId);
    return {
      name: MODEL_NAMES[modelId] || model?.name || "알 수 없음",
      type: model?.type || "기타",
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleNoteClick = (note) => {
    navigate(`/viewer/${note.modelId}?noteId=${note.id}`);
    onClose();
  };

  const toggleFolder = (modelId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  // 모델별로 노트 그룹화
  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.modelId]) {
      acc[note.modelId] = [];
    }
    acc[note.modelId].push(note);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[900px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="t-20-semi text-gray-900">전체 노트</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-gray-7" />
          </button>
        </div>

        {/* 노트 리스트 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-pulse">로딩 중...</div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 b-16-semi">저장된 노트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedNotes).map(([modelId, modelNotes]) => {
                const modelInfo = getModelInfo(modelId);
                const isExpanded = expandedFolders.has(modelId);

                return (
                  <div key={modelId} className="rounded-lg overflow-hidden">
                    {/* 폴더 헤더 */}
                    <div
                      onClick={() => toggleFolder(modelId)}
                      className="flex items-center gap-3 p-4 bg-gray-1 hover:bg-acc-blue-light/10 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <Folder className="w-5 h-5 text-acc-blue" />
                      <div className="flex-1">
                        <div className="b-16-semi text-gray-900">
                          {modelInfo.name}
                        </div>
                        <div className="d-12-reg text-gray-500">
                          {modelInfo.type} · {modelNotes.length}개의 노트
                        </div>
                      </div>
                    </div>

                    {/* 노트 리스트 */}
                    {isExpanded && (
                      <div className="bg-white divide-y divide-bg-1">
                        {modelNotes
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((note) => (
                            <div
                              key={note.id}
                              onClick={() => handleNoteClick(note)}
                              className="p-4 hover:bg-acc-blue-light/5 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 flex items-start gap-3">
                                  <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="b-14-semi text-gray-900 mb-1">
                                      {note.title}
                                    </div>
                                    <div className="b-14-reg-160 text-gray-600 line-clamp-2">
                                      {note.content}
                                    </div>
                                  </div>
                                </div>
                                {note.type === "important" && (
                                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 d-12-reg rounded flex-shrink-0">
                                    중요
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 d-12-reg text-gray-500 ml-7">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {formatDate(note.createdAt)}
                                </span>

                                {note.category && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded d-12-reg">
                                    {note.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 통계 */}
        {!loading && notes.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
            <div className="flex items-center justify-between d-12-reg text-gray-500">
              <span>
                관련 모델{" "}
                <strong className="text-gray-700">
                  {Object.keys(groupedNotes).length}
                </strong>
                개
              </span>
              <span className="w-[1px] h-3 bg-gray-200 self-center" />
              <span>
                전체 메모{" "}
                <strong className="text-gray-700">{notes.length}</strong>개
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModal;
