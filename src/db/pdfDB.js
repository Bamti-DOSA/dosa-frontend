import Dexie from 'dexie';

export const pdfDB = new Dexie('DosaPdfDB');

pdfDB.version(1).stores({
  pdfs: '++id, modelId, title, createdAt, pdfData, metadata',
});

export class PdfRecord {
  constructor(data) {
    this.id = data.id;
    this.modelId = data.modelId;
    this.title = data.title || '제목 없음';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.pdfData = data.pdfData;
    this.metadata = data.metadata || {};
  }
}

// PDF 저장
export const savePdfRecord = async (modelId, title, pdfData, metadata) => {
  try {
    
    const record = {
      modelId: String(modelId), // ✅ 명시적으로 문자열 변환
      title: title,
      pdfData: pdfData,
      metadata: metadata,
      createdAt: new Date().toISOString(),
    };
    
    
    const id = await pdfDB.pdfs.add(record);
    return id;
  } catch (error) {
    console.error('❌ PDF 기록 저장 실패:', error);
    throw error;
  }
};

// 특정 모델의 PDF 기록 가져오기
export const getPdfsByModel = async (modelId) => {
  try {
    return await pdfDB.pdfs.where('modelId').equals(String(modelId)).toArray();
  } catch (error) {
    console.error('❌ PDF 기록 조회 실패:', error);
    return [];
  }
};

// 모든 PDF 기록 가져오기
export const getAllPdfs = async () => {
  try {
    const allPdfs = await pdfDB.pdfs.toArray();
    return allPdfs;
  } catch (error) {
    console.error('❌ 전체 PDF 기록 조회 실패:', error);
    return [];
  }
};

// PDF 삭제
export const deletePdfRecord = async (id) => {
  try {
    await pdfDB.pdfs.delete(id);
  } catch (error) {
    console.error('❌ PDF 기록 삭제 실패:', error);
    throw error;
  }
};