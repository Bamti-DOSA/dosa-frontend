// src/api/aiAPI.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchAiResponse = async (
  systemType,
  userPrompt,
  modelName,
  content,
) => {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 💡 명세서에 맞게 system과 prompt를 보냅니다.
      body: JSON.stringify({
        system: systemType, // 예: "DRONE", "MACHINE_VICE"
        prompt: userPrompt, // 예: "드론의 기본 구조를 설명해줘"
        modelName: modelName,
        message: content,
      }),
    });

    if (!response.ok) {
      // 400 에러 발생 시 서버가 보내는 상세 이유를 확인하기 위해
      const errorDetail = await response.json();
      console.error("서버 에러 상세:", errorDetail);
      throw new Error("AI 응답 실패");
    }

    const result = await response.json();

    if (result.success && result.content) {
      const parsedContent = JSON.parse(result.content);
      return parsedContent.description;
    }

    return "응답을 처리할 수 없습니다.";
  } catch (error) {
    console.error("AI API 에러:", error);
    return "서버와 연결할 수 없습니다.";
  }
};

export const fetchAiBriefing = async (messages, maxMessages = 10) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/ai/briefing`, {
      // 명세서에 따른 Request Body
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      maxMessages: maxMessages,
    });
    return response.data;
  } catch (error) {
    console.error("브리핑 생성 중 오류 발생:", error);
    throw error;
  }
};

// api/aiDB.js

// 모든 채팅 세션을 가져오는 함수
export const getAllChats = () => {
  return new Promise((resolve, reject) => {
    // 사용 중인 DB 이름과 스토어 이름을 확인하세요 (예: "AiDatabase", "chats")
    const request = indexedDB.open("AiDatabase", 1);

    request.onerror = () => reject("DB 열기 실패");

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["chats"], "readonly");
      const store = transaction.objectStore("chats");
      const getAllRequest = store.getAll(); // 모든 데이터 가져오기

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };

      getAllRequest.onerror = () => {
        reject("데이터 조회 실패");
      };
    };
  });
};
