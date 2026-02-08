// src/api/aiAPI.js
export const fetchAiResponse = async (
  systemType,
  userPrompt,
  modelName,
  content,
) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/chat`, {
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
