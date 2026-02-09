// src/constants/materialData.js

export const MATERIAL_LIST = [
  {
    id: 0, // 0번으로 기본 재질 추가
    name: "기본 재질",
    desc: "기체 설계 시 표준으로 적용되는 경량 합성 소재입니다.",
    materialProps: {
      color: "#E5E7EB", // 표준 그레이 색상
      metalness: 0.4,
      roughness: 0.5,
    },
  },
  {
    id: 1,
    name: "카본 파이버",
    desc: "초경량 고강성 소재로 드론의 비행 시간을 극대화합니다.",
    materialProps: {
      color: "#1A1A1A",
      metalness: 0.7,
      roughness: 0.2,
      emissive: "#000000",
      emissiveIntensity: 0,
    },
  },
  {
    id: 2,
    name: "알루미늄 6061",
    desc: "내식성이 뛰어나고 구조적 강도가 우수한 항공 등급 금속입니다.",
    materialProps: {
      color: "#D1D5DB",
      metalness: 0.9,
      roughness: 0.1,
      emissive: "#000000",
      emissiveIntensity: 0,
    },
  },
  {
    id: 3,
    name: "강화 플라스틱",
    desc: "충격 흡수력이 뛰어나며 유지보수 비용이 저렴한 범용 소재입니다.",
    materialProps: {
      color: "#4B5563",
      metalness: 0.1, // 플라스틱은 금속성이 낮음
      roughness: 0.6, // 약간 거친 표면
      emissive: "#000000",
      emissiveIntensity: 0,
    },
  },
  {
    id: 4,
    name: "티타늄 합금",
    desc: "극한의 환경에서도 변형이 없는 최고급 고강도 합금입니다.",
    materialProps: {
      color: "#A2A2A2",
      metalness: 1.0, // 최고 수준의 금속성
      roughness: 0.15, // 매우 매끄러운 표면
      emissive: "#111111", // 미세한 광택을 위한 반사
      emissiveIntensity: 0.1,
    },
  },
  {
    id: 5,
    name: "매트 블랙 코팅",
    desc: "빛 반사를 최소화하여 스텔스 비행 및 고급스러운 외관을 제공합니다.",
    materialProps: {
      color: "#0A0A0A", // 깊은 블랙
      metalness: 0.0, // 비금속 코팅
      roughness: 0.9, // 빛을 거의 반사하지 않는 거친 정도
      emissive: "#000000",
      emissiveIntensity: 0,
    },
  },
];
