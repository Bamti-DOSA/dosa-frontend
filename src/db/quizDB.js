import Dexie from 'dexie';

export const quizDB = new Dexie('DosaQuizDB');

quizDB.version(1).stores({
  records: '++id, modelId, score, totalQuestions, createdAt, difficulty',
});

export class QuizRecord {
  constructor(data) {
    this.id = data.id;
    this.modelId = data.modelId;
    this.modelName = data.modelName;
    this.score = data.score; // 맞은 개수
    this.totalQuestions = data.totalQuestions; // 전체 문제 수
    this.difficulty = data.difficulty; // 난이도
    this.correctAnswers = data.correctAnswers || []; // 맞은 문제들
    this.wrongAnswers = data.wrongAnswers || []; // 틀린 문제들
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

// 퀴즈 기록 저장
export const saveQuizRecord = async (modelId, modelName, score, totalQuestions, difficulty, correctAnswers, wrongAnswers) => {
  try {
    console.log('💾 saveQuizRecord 호출됨 - modelId:', modelId);
    
    const record = {
      modelId: String(modelId),
      modelName: modelName,
      score: score,
      totalQuestions: totalQuestions,
      difficulty: difficulty,
      correctAnswers: correctAnswers,
      wrongAnswers: wrongAnswers,
      createdAt: new Date().toISOString(),
    };
    
    console.log('💾 저장할 퀴즈 기록:', record);
    
    const id = await quizDB.records.add(record);
    console.log('✅ 퀴즈 기록 저장 완료. DB ID:', id);
    return id;
  } catch (error) {
    console.error('❌ 퀴즈 기록 저장 실패:', error);
    throw error;
  }
};

// 특정 모델의 퀴즈 기록 가져오기
export const getQuizRecordsByModel = async (modelId) => {
  try {
    return await quizDB.records.where('modelId').equals(String(modelId)).toArray();
  } catch (error) {
    console.error('❌ 퀴즈 기록 조회 실패:', error);
    return [];
  }
};

// 모든 퀴즈 기록 가져오기
export const getAllQuizRecords = async () => {
  try {
    const allRecords = await quizDB.records.toArray();
    console.log('📋 전체 퀴즈 기록:', allRecords);
    return allRecords;
  } catch (error) {
    console.error('❌ 전체 퀴즈 기록 조회 실패:', error);
    return [];
  }
};

// 퀴즈 기록 삭제
export const deleteQuizRecord = async (id) => {
  try {
    await quizDB.records.delete(id);
    console.log('✅ 퀴즈 기록 삭제 완료:', id);
  } catch (error) {
    console.error('❌ 퀴즈 기록 삭제 실패:', error);
    throw error;
  }
};