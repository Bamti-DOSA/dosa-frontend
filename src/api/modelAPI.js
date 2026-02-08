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
    return [];
  }
};

// ID로 특정 모델 가져오기
export const getModelDetail = async (id) => {
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
    const allModels = result.data || [];

    // 전체 목록에서 해당 ID 찾기
    const foundModel = allModels.find(item => item.objectId === Number(id));

    if (!foundModel) {
      return null;
    }

    return foundModel;
    
  } catch (error) {
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
      throw new Error(`Failed to get signed URL: ${response.status}`);
    }

    const result = await response.json();
    
    // 💡 result.data 확인
    console.log('🔍 받은 데이터:', result);
    console.log('🔍 result.data:', result.data);
    
    // result.data가 이미 완전한 URL이면 그대로 반환
    // 만약 상대 경로라면 baseUrl을 붙여야 함
    const url = result.data;
    
    // URL이 http로 시작하면 완전한 URL
    if (url.startsWith('http')) {
      console.log('✅ 완전한 URL:', url);
      return url;
    } else {
      // 상대 경로라면 base URL 추가
      console.log('⚠️ 상대 경로, base URL 추가');
      return `${baseUrl}/${url}`;
    }
    
  } catch (error) {
    console.error('❌ Pre-signed URL 에러:', error);
    return null;
  }
};
