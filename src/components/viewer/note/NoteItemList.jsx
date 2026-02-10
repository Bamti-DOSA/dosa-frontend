import React from "react";
import { Plus } from "lucide-react";
import NoteItem from "./NoteItem";
import NoteInput from "./NoteInput";

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

const NoteItemList = ({
  notes,
  scrollRef,
  isAdding,
  setIsAdding,
  onSave,
  onCancelInput,
  editingNote,
  onDeleteRequest,
  onEditStart,
  onNoteExpand,
  onOpenAiNote,
  isAiNoteOpen,
}) => {
  const sortedNotes = [...notes].sort(
    (a, b) => parseDate(a.date) - parseDate(b.date),
  );

  return (
    <div className="h-full flex flex-col">
      {/* 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-[#FFF]">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pb-20 text-gray-400 b-14-med text-center leading-relaxed animate-fade-in">
            <p>노트를 추가하여</p>
            <p>공부한 내용을 정리해 보세요</p>
          </div>
        ) : (
          <div className="relative pb-20">
            <div className="absolute left-[12px] top-2 bottom-20 w-[2px] bg-main-1"></div>
            <div className="flex flex-col">
              {sortedNotes.map((note, index) => {
                let showDot = false;
                let spacingClass = "mt-4";

                if (index === 0) {
                  showDot = true;
                  spacingClass = "";
                } else {
                  const prevNote = sortedNotes[index - 1];
                  const currentTime = parseDate(note.date).getTime();
                  const prevTime = parseDate(prevNote.date).getTime();
                  const diffHours = (currentTime - prevTime) / (1000 * 60 * 60);

                  if (diffHours >= 2) {
                    showDot = true;
                    spacingClass = "mt-12";
                  }
                }

                const isEditing = editingNote?.id === note.id;

                return (
                  <div key={note.id} className={spacingClass}>
                    <NoteItem
                      note={note}
                      isFirst={showDot}
                      onDelete={onDeleteRequest}
                      onEdit={onEditStart}
                      isEditing={isEditing}
                      onDoubleClick={() => onNoteExpand(note.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 하단 입력/버튼 영역 */}
      <div className="shrink-0 z-30 bg-[#FFF]">
        {isAdding ? (
          <div className="pb-4 pr-4">
            <NoteInput
              onSave={onSave}
              onCancel={onCancelInput}
              initialData={editingNote}
              onOpenAiNote={onOpenAiNote}
              isAiNoteOpen={isAiNoteOpen}
            />
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={() => {
                onCancelInput();
                setIsAdding(true);
              }}
              className="w-full flex justify-center items-center gap-2 bg-bg-1  hover:bg-gray-300 text-gray-9 b-16-semi py-[16px] rounded-[8px] transition-colors "
            >
              메모 추가 <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteItemList;
