// src/api/aiDB.js
import { openDB } from "idb";

const DB_NAME = "AiAssistantDB";
const STORE_NAME = "chats";
const MEMO_STORE = "memos";

export const initDB = async () => {
  // 버전을 3으로 올립니다 (memos 스토어 추가를 위해)
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      // 1. 채팅 저장소 (기존)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const chatStore = db.createObjectStore(STORE_NAME, {
          keyPath: "chatId",
        });
        chatStore.createIndex("modelId", "modelId");
      }

      // 2. ✨ 메모 저장소 추가
      if (!db.objectStoreNames.contains(MEMO_STORE)) {
        // memoId를 키로 사용하고, 어떤 모델의 메모인지 알기 위해 modelId 인덱스 생성
        const memoStore = db.createObjectStore(MEMO_STORE, {
          keyPath: "memoId",
          autoIncrement: true,
        });
        memoStore.createIndex("modelId", "modelId");
      }
    },
  });
};

/** --- 채팅 관련 함수 --- **/
export const saveChat = async (chatData) => {
  const cid = Number(chatData.chatId);
  if (!cid) {
    console.error("❌ chatId가 유효하지 않습니다.");
    return;
  }

  const db = await initDB();
  try {
    await db.put(STORE_NAME, {
      chatId: cid,
      modelId: String(chatData.modelId),
      messages: chatData.messages,
      lastUpdated: chatData.lastUpdated || Date.now(),
    });
    console.log(`[DB] ${cid}번 저장 성공`);
  } catch (e) {
    console.error("❌ DB Write Error:", e);
  }
};

export const getChatsByModel = async (modelId) => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, "modelId", String(modelId));
};

export const getChatById = async (chatId) => {
  const db = await initDB();
  try {
    // get(STORE_NAME, key)를 사용하면 해당 ID의 데이터를 바로 가져옵니다.
    // IndexedDB의 keyPath가 chatId이므로 Number로 타입을 맞춰줍니다.
    const chat = await db.get(STORE_NAME, Number(chatId));
    return chat || null;
  } catch (e) {
    console.error("❌ 특정 채팅 조회 실패:", e);
    return null;
  }
};

/** --- ✨ 메모 관련 함수 추가 --- **/

// 특정 모델의 모든 메모 가져오기
export const getMemosByModel = async (modelId) => {
  const db = await initDB();
  try {
    // modelId 인덱스를 사용하여 해당 모델의 메모만 싹 가져옵니다.
    return await db.getAllFromIndex(MEMO_STORE, "modelId", String(modelId));
  } catch (e) {
    console.error("❌ 메모 조회 실패:", e);
    return [];
  }
};

// 메모 저장하기
export const saveMemo = async (modelId, content) => {
  const db = await initDB();
  try {
    await db.add(MEMO_STORE, {
      modelId: String(modelId),
      content: content,
      createdAt: Date.now(),
    });
  } catch (e) {
    console.error("❌ 메모 저장 에러:", e);
  }
};

/** --- 기타 유지 함수 --- **/
export const getLastChatId = async () => {
  const db = await initDB();
  const allChats = await db.getAll(STORE_NAME);
  return allChats.length === 0 ? 0 : Math.max(...allChats.map((c) => c.chatId));
};

// src/api/aiDB.js

export const deleteChat = async (chatId) => {
  const db = await initDB();
  try {
    // Number로 타입을 변환하여 KeyPath(chatId)에 맞는 데이터를 삭제합니다.
    await db.delete(STORE_NAME, Number(chatId));
    console.log(`✅ DB 삭제 성공: Chat ${chatId}`);
    return true;
  } catch (e) {
    console.error("❌ DB 삭제 실패:", e);
    return false;
  }
};
