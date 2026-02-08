import React, { useState, useRef, useEffect, useMemo } from "react";
import { Menu, MessageSquare, File } from "lucide-react";
import NoteMenu from "./note/NoteMenu";
import NoteItemList from "./note/NoteItemList";
import NoteFull from "./note/NoteFull";
import AssistantAi from "./ai/AssistantAi";
import AiMenu from "./ai/AiMenu";
import { saveMemo } from "../../api/aiDB";
import {
  getNotesByModelId,
  createNote,
  updateNote,
  deleteNote,
} from "../../utils/noteDB";

const parseDate = (dateStr) => {
  const [dayPart, monthStr, timePart] = dateStr.split(" ");
  const day = parseInt(dayPart.replace(".", ""), 10);
  const [hours, minutes] = timePart.split(":").map(Number);
  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const now = new Date();
  return new Date(now.getFullYear(), monthMap[monthStr], day, hours, minutes);
};

const getFormattedDate = () => {
  const now = new Date();
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
  return `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const RightContainer = ({
  activeTab,
  setActiveTab,
  onOpenAiNote,
  isAiNoteOpen,
  aiChats,
  setAiChats,
  modelId,
}) => {
  const [notes, setNotes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (modelId) {
      loadNotes();
    }
  }, [modelId]);

  const loadNotes = async () => {
    const loadedNotes = await getNotesByModelId(modelId);
    setNotes(loadedNotes);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const isCollapsed = width < 480;

  const groupedNotesForMenu = useMemo(() => {
    if (!notes) return {};
    return notes.reduce((acc, note) => {
      const cat = note.category || "기타";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(note);
      return acc;
    }, {});
  }, [notes]);

  const handleSaveNote = async (noteData) => {
    const dateStr = getFormattedDate();

    if (editingNote) {
      const success = await updateNote(editingNote.id, {
        title: noteData.title || "제목 없음",
        content: noteData.content,
        category: noteData.category,
        type: noteData.type,
        attachments: noteData.attachments || [],
      });

      if (success) {
        await loadNotes();
      }
      setEditingNote(null);
    } else {
      const newNote = await createNote(modelId, {
        title: noteData.title || "제목 없음",
        content: noteData.content,
        category: noteData.category,
        type: noteData.type,
        attachments: noteData.attachments || [],
      });

      await saveMemo(modelId, noteData.content);

      if (newNote) {
        await loadNotes();
      }
    }

    setIsAdding(false);
  };

  const handleEditStart = (noteId) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (targetNote) {
      setEditingNote(targetNote);
      setIsAdding(true);
      setExpandedNoteId(null);
    }
  };

  const handleCancelInput = () => {
    setIsAdding(false);
    setEditingNote(null);
  };

  const handleDeleteRequest = (noteId) => {
    setDeletingNoteId(noteId);
  };

  const handleDeleteConfirm = async () => {
    const success = await deleteNote(deletingNoteId);

    if (success) {
      await loadNotes();
    }

    setDeletingNoteId(null);
    setExpandedNoteId(null);
  };

  const handleNoteClick = (noteId) => {
    setActiveTab("note");
    setIsMenuOpen(false);
    setExpandedNoteId(null);
    setTimeout(() => {
      const element = document.getElementById(noteId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const handleAiChatSelect = () => setIsMenuOpen(false);
  const handleNewAiChat = () => setIsMenuOpen(false);

  useEffect(() => {
    if (activeTab === "note" && isAdding && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isAdding, notes, activeTab]);

  const activeFullNote = useMemo(
    () => notes.find((n) => n.id === expandedNoteId),
    [notes, expandedNoteId],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col relative bg-bg-2 rounded-[8px] overflow-hidden"
    >
      {deletingNoteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white rounded-[16px] p-6 shadow-2xl w-[320px] flex flex-col items-center animate-scale-in">
            <h3 className="b-16-semi text-gray-900 mb-2">
              메모를 삭제하시겠습니까?
            </h3>
            <p className="b-14-reg-160 text-gray-600 text-center mb-4">
              삭제된 메모는 복구할 수 없습니다.
              <br />
              확인 후 삭제를 진행해주세요
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setDeletingNoteId(null)}
                className="flex-1 py-3 rounded-[8px] bg-main-3 text-white b-14-semi hover:bg-gray-500"
              >
                뒤로가기
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-[8px] bg-main-1 text-white b-14-semi hover:bg-sky-800"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#FFF] p-4 flex justify-between items-center z-40 shrink-0 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`cursor-pointer p-1 rounded-[8px] transition-colors ${isMenuOpen ? "bg-bg-1 text-main-1" : "text-gray-89 hover:bg-gray-2"}`}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
          <h1 className="t-18-bold text-gray-9">
            {activeTab === "note" ? "메모장" : "AI 어시스턴트"}
          </h1>
        </div>
        <div className="flex bg-[#EEEFF0] p-[6px] rounded-[8px]">
          <button
            onClick={() => {
              setActiveTab("note");
              setIsMenuOpen(false);
            }}
            className={`cursor-pointer flex items-center gap-1 px-[8px] py-[6px] b-14-semi rounded transition-all ${activeTab === "note" ? "bg-white text-gray-9" : "bg-transparent text-gray-5"}`}
          >
            <File
              size={12}
              color={activeTab === "note" ? "#3A3C40" : "#888E96"}
            />
            메모장
          </button>
          <button
            onClick={() => {
              setActiveTab("ai");
              setIsMenuOpen(false);
            }}
            className={`cursor-pointer flex items-center justifu-center gap-1 px-[8px] py-[6px] rounded b-14-semi transition-all ${activeTab === "ai" ? "bg-white text-gray-9" : "bg-transparent text-gray-5"}`}
          >
            <MessageSquare size={12} /> AI
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full overflow-hidden">
        {isMenuOpen &&
          (activeTab === "note" ? (
            <NoteMenu
              groupedNotes={groupedNotesForMenu}
              onClose={() => setIsMenuOpen(false)}
              onNoteClick={handleNoteClick}
            />
          ) : (
            <AiMenu
              chatSessions={aiChats}
              onClose={() => setIsMenuOpen(false)}
              onSelectChat={handleAiChatSelect}
              onNewChat={handleNewAiChat}
            />
          ))}

        {activeTab === "note" &&
          (expandedNoteId && activeFullNote ? (
            <NoteFull
              note={activeFullNote}
              onClose={() => setExpandedNoteId(null)}
              onDelete={handleDeleteRequest}
              onEdit={handleEditStart}
            />
          ) : (
            <NoteItemList
              notes={notes}
              scrollRef={scrollRef}
              isAdding={isAdding}
              setIsAdding={setIsAdding}
              onSave={handleSaveNote}
              onCancelInput={handleCancelInput}
              editingNote={editingNote}
              onDeleteRequest={handleDeleteRequest}
              onEditStart={handleEditStart}
              onNoteExpand={(id) => setExpandedNoteId(id)}
              onOpenAiNote={onOpenAiNote}
              isAiNoteOpen={isAiNoteOpen}
            />
          ))}

        {activeTab === "ai" && <AssistantAi />}
      </div>
    </div>
  );
};

export default RightContainer;
