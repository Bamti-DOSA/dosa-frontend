const STORAGE_KEY = 'dosa_notes';

// 날짜 포맷팅 함수
const formatDate = () => {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

// 모든 노트 가져오기
export const getAllNotes = () => {
  try {
    const notes = localStorage.getItem(STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    return [];
  }
};

// 특정 모델의 노트만 가져오기
export const getNotesByModelId = (modelId) => {
  const allNotes = getAllNotes();
  return allNotes.filter(note => note.modelId === String(modelId));
};

// 노트 생성
export const createNote = (modelId, noteData) => {
  try {
    const allNotes = getAllNotes();
    const newNote = {
      id: Date.now().toString(),
      modelId: String(modelId),
      title: noteData.title || "제목 없음",
      content: noteData.content || "",
      category: noteData.category || "기타",
      type: noteData.type || "general",
      attachments: noteData.attachments || [],
      date: formatDate(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allNotes.push(newNote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
    
    return newNote;
  } catch (error) {
    return null;
  }
};

// 노트 수정
export const updateNote = (noteId, updatedData) => {
  try {
    const allNotes = getAllNotes();
    const noteIndex = allNotes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      return null;
    }
    
    allNotes[noteIndex] = {
      ...allNotes[noteIndex],
      title: updatedData.title || allNotes[noteIndex].title,
      content: updatedData.content !== undefined ? updatedData.content : allNotes[noteIndex].content,
      category: updatedData.category || allNotes[noteIndex].category,
      type: updatedData.type || allNotes[noteIndex].type,
      attachments: updatedData.attachments || allNotes[noteIndex].attachments,
      date: formatDate(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
    
    return allNotes[noteIndex];
  } catch (error) {
    return null;
  }
};

// 노트 삭제
export const deleteNote = (noteId) => {
  try {
    const allNotes = getAllNotes();
    const filteredNotes = allNotes.filter(note => note.id !== noteId);
    
    if (filteredNotes.length === allNotes.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
    
    return true;
  } catch (error) {
    return false;
  }
};

// 특정 노트 가져오기
export const getNoteById = (noteId) => {
  const allNotes = getAllNotes();
  return allNotes.find(note => note.id === noteId);
};

// 전체 노트 개수
export const getTotalNotesCount = () => {
  return getAllNotes().length;
};

// 특정 모델의 노트 개수
export const getNotesCountByModel = (modelId) => {
  return getNotesByModelId(modelId).length;
};