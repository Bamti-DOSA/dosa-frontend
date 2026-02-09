import instance from "./axiosInstance";

export const fetchAiResponse = async (
  systemType,
  userPrompt,
  modelName,
  content,
) => {
  try {
    const response = await instance.post("/api/chat", {
      system: systemType,
      prompt: userPrompt,
      modelName: modelName,
      message: content,
    });

    const result = response.data;

    if (result.success && result.content) {
      const parsedContent = JSON.parse(result.content);
      return parsedContent.description;
    }

    return "응답을 처리할 수 없습니다.";
  } catch (error) {
    console.error("AI API 에러:", error.response?.data || error.message);
    return "서버와 연결할 수 없습니다.";
  }
};

export const fetchAiBriefing = async (messages, maxMessages = 10) => {
  try {
    const response = await instance.post("/api/ai/briefing", {
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

/**
 * 퀴즈 생성 API
 * @param {string} modelName - 모델 이름 (예: "V4Engine", "Drone")
 * @param {string} difficulty - 난이도 ("Normal" 또는 "Hard")
 * @returns {Promise<Object>} 퀴즈 데이터
 */
export const generateQuiz = async (modelName, difficulty) => {
  try {
    const response = await instance.post("/api/ai/quiz", {
      modelName,
      difficulty,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '퀴즈 생성 실패');
    }
  } catch (error) {
    console.error('❌ 퀴즈 생성 API 오류:', error);
    throw error;
  }
};
