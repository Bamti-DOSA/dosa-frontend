import instance from "./axiosInstance";

// 모든 모델 가져오기
export const getModels = async () => {
  try {
    // instance에 이미 baseURL이 설정되어 있으므로 뒷 경로만 적습니다.
    const response = await instance.get("/api/objects");

    // axios는 응답 데이터가 response.data에 담깁니다.
    return response.data.data || [];
  } catch (error) {
    console.error("❌ getModels 에러:", error.response?.data || error.message);
    return [];
  }
};

// ID로 특정 모델 가져오기
export const getModelById = async (id) => {
  try {
    const response = await instance.get("/api/objects");

    const models = Array.isArray(response.data.data) ? response.data.data : [];
    const targetModel = models.find((m) => m && m.objectId === Number(id));

    if (!targetModel) {
      console.warn(`ID ${id}에 해당하는 모델을 찾을 수 없습니다.`);
      return null;
    }

    return targetModel;
  } catch (error) {
    console.error(
      "❌ getModelById 에러:",
      error.response?.data || error.message,
    );
    return null;
  }
};

// 조립 모델의 Pre-signed URL 가져오기
export const getAssemblyModelSignedUrl = async (assemblyModelUrl) => {
  try {
    const response = await instance.get("/api/models", {
      params: {
        filename: assemblyModelUrl,
      },
    });

    return response.data.data || null;
  } catch (error) {
    console.error(
      "❌ getAssemblyModelSignedUrl 에러:",
      error.response?.data || error.message,
    );

    // 폴백: URL이 이미 완전한 형태면 그대로 사용
    if (
      assemblyModelUrl &&
      (assemblyModelUrl.startsWith("http://") ||
        assemblyModelUrl.startsWith("https://"))
    ) {
      return assemblyModelUrl;
    }
    return null;
  }
};

// 하위 호환성을 위한 alias
export const getModelDetail = getModelById;
