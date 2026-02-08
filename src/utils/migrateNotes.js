import { db } from '../db/notesDB';

// localStorage에서 IndexedDB로 마이그레이션
export const migrateFromLocalStorage = async () => {
  const STORAGE_KEY = 'dosa_notes';
  
  try {
    const oldData = localStorage.getItem(STORAGE_KEY);
    if (!oldData) return;
    
    const notes = JSON.parse(oldData);
    
    // 기존 데이터가 있으면 IndexedDB로 복사
    for (const note of notes) {
      await db.notes.add(note);
    }
    
    // 마이그레이션 완료 후 localStorage 삭제 (선택)
    // localStorage.removeItem(STORAGE_KEY);
    
    return true;
  } catch (error) {
    return false;
  }
};