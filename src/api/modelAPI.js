// src/api/modelApi.js
export const getModels = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/objects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("네트워크 응답에 문제가 있습니다.");
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('❌ getModels 에러:', error);
    return [];
  }
};

// ID로 특정 모델 가져오기
export const getModelById = async (id) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/objects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("네트워크 응답에 문제가 있습니다.");
    }

    const result = await response.json();
    const models = Array.isArray(result.data) ? result.data : [];
    const targetModel = models.find((m) => m && m.objectId === Number(id));

    if (!targetModel) {
      console.warn(`ID ${id}에 해당하는 모델을 찾을 수 없습니다.`);
      return null;
    }

    return targetModel;
  } catch (error) {
    console.error('❌ getModelById 에러:', error);
    return null;
  }
};

// 조립 모델의 Pre-signed URL 가져오기
export const getAssemblyModelSignedUrl = async (assemblyModelUrl) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const filename = assemblyModelUrl;

    const response = await fetch(
      `${baseUrl}/api/models?filename=${encodeURIComponent(filename)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorText);
      throw new Error(`Failed to get signed URL: ${response.status}`);
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('❌ getAssemblyModelSignedUrl 에러:', error);
    
    // 폴백: assemblyModelUrl이 이미 완전한 URL이면 그대로 사용
    if (assemblyModelUrl && (assemblyModelUrl.startsWith('http://') || assemblyModelUrl.startsWith('https://'))) {
      return assemblyModelUrl;
    }
    return null;
  }
};

// 하위 호환성을 위한 alias
export const getModelDetail = getModelById;