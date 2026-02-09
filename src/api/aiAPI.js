import instance from "./axiosInstance"; // 이미 만들어두신 인스턴스를 가져옵니다.

export const fetchAiResponse = async (
  systemType,
  userPrompt,
  modelName,
  content,
) => {
  try {
    // 💡 fetch 대신 이미 설정된 instance(axios)를 사용하세요.
    // baseURL과 ngrok 헤더가 이미 적용되어 있을 것이므로 경로만 적으면 됩니다.
    const response = await instance.post("/api/chat", {
      system: systemType,
      prompt: userPrompt,
      modelName: modelName,
      message: content,
    });

    const result = response.data; // axios는 바로 .data로 접근합니다.

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
    // 여기도 BASE_URL 대신 instance를 사용하면 관리가 편합니다.
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
