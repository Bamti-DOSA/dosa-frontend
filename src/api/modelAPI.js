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
    
    // assemblyModelUrl: "machine_vice/completed/machine_vice_final.glb"
    const filename = assemblyModelUrl; // 또는 assemblyModelUrl.split('/').pop()
    
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
    
    // result.data: "https://dosa-3d-models.s3... (S3 임시 URL)"
    return result.data;
    
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Signed URL 가져오기 실패:", error);
    return null;
  }
};
// src/api/modelAPI.js 에 추가
export const getModelById = async (id) => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    // 특정 ID 조회가 안 된다면 전체 조회를 먼저 수행
    const response = await fetch(`${baseUrl}/api/objects`);
    const result = await response.json();

    // 💡 result.data가 배열인지 확인하고, 각 아이템(m)이 존재할 때만 objectId를 체크
    const models = Array.isArray(result.data) ? result.data : [];
    const targetModel = models.find((m) => m && m.objectId == id);

    if (!targetModel) {
      console.warn(`ID ${id}에 해당하는 모델을 찾을 수 없습니다.`);
      return null;
    }

    return targetModel;
  } catch (error) {
    console.error("모델 필터링 중 에러:", error);
=======
>>>>>>> 6393165e1891eb2c5369a71320ad5826ed814170
    return null;
  }
};
