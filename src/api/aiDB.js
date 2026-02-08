// src/api/aiDB.js
import { openDB } from "idb";

const DB_NAME = "AiAssistantDB";
const STORE_NAME = "chats";

export const initDB = async () => {
  return openDB(DB_NAME, 2, {
    // 버전을 2로 올립니다.
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // chatId를 자동으로 생성하거나 직접 지정할 수 있게 keyPath 설정
        const store = db.createObjectStore(STORE_NAME, { keyPath: "chatId" });
        // 특정 모델의 채팅들만 모아보기 위해 인덱스 생성
        store.createIndex("modelId", "modelId");
      }
    },
  });
};

// 채팅 저장 (기존 내용 덮어쓰기 포함)
export const saveChat = async (chatData) => {
  if (!chatData.chatId) {
    console.error("❌ 저장 실패: chatId가 없습니다!", chatData);
    return;
  }
  const db = await initDB();
  try {
    // 💡 객체 안에 chatId가 반드시 포함되도록 명시적 구성
    await db.put(STORE_NAME, {
      chatId: Number(chatData.chatId), // 숫자로 통일
      modelId: String(chatData.modelId),
      messages: chatData.messages,
      lastUpdated: chatData.lastUpdated || Date.now(),
    });
    console.log(`✅ DB 저장 성공: Chat ${chatData.chatId}`);
  } catch (e) {
    console.error("❌ DB 저장 에러:", e);
  }
};

// 특정 모델의 모든 채팅 목록 가져오기
export const getChatsByModel = async (modelId) => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, "modelId", String(modelId));
};

// 가장 마지막에 생성된 chatId 찾기 (ID 쁠쁠을 위해)
export const getLastChatId = async () => {
  const db = await initDB();
  const allChats = await db.getAll(STORE_NAME);
  if (allChats.length === 0) return 0;
  return Math.max(...allChats.map((c) => c.chatId));
};

// 특정 채팅방의 메시지 내역만 업데이트하는 함수
export const updateChatMessages = async (chatId, newMessages) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // 1. 기존 데이터 가져오기
  const chat = await store.get(Number(chatId));
  if (!chat) {
    console.error(`❌ 업데이트 실패: ID ${chatId} 채팅방을 찾을 수 없습니다.`);
    return;
  }

  // 2. 메시지 교체 및 시간 업데이트
  chat.messages = newMessages;
  chat.lastUpdated = Date.now();

  // 3. 다시 저장
  await store.put(chat);
  await tx.done;
  console.log(
    `✅ DB 업데이트 성공: Chat ${chatId} (메시지 ${newMessages.length}개)`,
  );
};
