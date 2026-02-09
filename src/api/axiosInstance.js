import axios from "axios";

const instance = axios.create({
  // 백엔드에서 받은 새로운 https 주소를 여기에 넣으세요
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // ngrok 보안 경고를 통과하기 위한 핵심 헤더!
    "ngrok-skip-browser-warning": "69420",
  },
});

export default instance;
