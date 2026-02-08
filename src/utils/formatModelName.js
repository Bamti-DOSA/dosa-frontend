export const formatSystemName = (name) => {
  if (!name) return "DRONE"; // 기본값
  // 1. 모든 문자를 대문자로 변경
  // 2. 공백(' ')을 언더바('_')로 변경
  return name.toUpperCase().replace(/\s+/g, "_");
};
