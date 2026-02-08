import Dexie from 'dexie';

// 데이터베이스 생성
export const db = new Dexie('DosaNotesDB');

// 스키마 정의 (버전 1)
db.version(1).stores({
  notes: '++id, modelId, title, content, category, type, date, createdAt, updatedAt',
});

// 노트 타입 정의 (선택사항, TypeScript용)
export class Note {
  constructor(data) {
    this.id = data.id;
    this.modelId = data.modelId;
    this.title = data.title || '제목 없음';
    this.content = data.content || '';
    this.category = data.category || '기타';
    this.type = data.type || 'general';
    this.attachments = data.attachments || [];
    this.date = data.date;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}