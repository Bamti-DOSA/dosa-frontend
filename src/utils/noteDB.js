import { db } from '../db/notesDB';

const formatDate = () => {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${now.getDate()}. ${months[now.getMonth()]} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const getAllNotes = async () => {
  try {
    return await db.notes.toArray();
  } catch (error) {
    return [];
  }
};

export const getNotesByModelId = async (modelId) => {
  try {
    return await db.notes
      .where('modelId')
      .equals(String(modelId))
      .toArray();
  } catch (error) {
    return [];
  }
};

export const createNote = async (modelId, noteData) => {
  try {
    const newNote = {
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
    
    const id = await db.notes.add(newNote);
    
    return { ...newNote, id };
  } catch (error) {
    return null;
  }
};

export const updateNote = async (noteId, updatedData) => {
  try {
    const existingNote = await db.notes.get(noteId);
    
    if (!existingNote) {
      return null;
    }
    
    const updated = {
      title: updatedData.title || existingNote.title,
      content: updatedData.content !== undefined ? updatedData.content : existingNote.content,
      category: updatedData.category || existingNote.category,
      type: updatedData.type || existingNote.type,
      attachments: updatedData.attachments || existingNote.attachments,
      date: formatDate(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.notes.update(noteId, updated);
    
    return { ...existingNote, ...updated, id: noteId };
  } catch (error) {
    return null;
  }
};

export const deleteNote = async (noteId) => {
  try {
    await db.notes.delete(noteId);
    return true;
  } catch (error) {
    return false;
  }
};

export const getNoteById = async (noteId) => {
  try {
    return await db.notes.get(noteId);
  } catch (error) {
    return null;
  }
};

export const getTotalNotesCount = async () => {
  try {
    return await db.notes.count();
  } catch (error) {
    return 0;
  }
};

export const getNotesCountByModel = async (modelId) => {
  try {
    return await db.notes
      .where('modelId')
      .equals(String(modelId))
      .count();
  } catch (error) {
    return 0;
  }
};