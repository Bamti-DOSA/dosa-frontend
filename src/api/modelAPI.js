// src/api/modelApi.js
export const getModels = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    // console.log("요청 주소:", `${baseUrl}/api/objects`);
    const response = await fetch(`${baseUrl}/api/objects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // const contentType = response.headers.get("content-type");
    // if (!contentType || !contentType.includes("application/json")) {
    //   const text = await response.text(); // 에러 내용을 텍스트로 읽어봄
    //   console.error("서버에서 HTML을 보냈습니다:", text);
    //   throw new TypeError("응답이 JSON 형식이 아닙니다.");
    // }

    if (!response.ok) {
      throw new Error("네트워크 응답에 문제가 있습니다.");
    }
    const result = await response.json();
    return result.data || [];
    // return data;
  } catch (error) {
    console.error("데이터를 불러오지 못했습니다:", error);
    return [];
  }
};
