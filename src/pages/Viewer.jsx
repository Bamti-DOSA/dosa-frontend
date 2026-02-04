import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import PartDetail from "../components/part/PartDetail";
import PartList from "../components/part/PartList";

// 1. 개별 부품 모델을 렌더링하는 컴포넌트
function SinglePartModel({ modelPath }) {
  // 경로가 바뀔 때마다 useGLTF가 새 파일을 로드합니다.
  const { scene } = useGLTF(modelPath);

  // 부품이 로드될 때마다 이전 모델의 잔상을 지우기 위해 clone을 사용하거나
  // key값을 주어 컴포넌트를 새로고침하는 것이 좋습니다.
  return <primitive object={scene.clone()} />;
}

const Viewer = () => {
  const partsData = [
    {
      id: "main_frame",
      name: "01 메인 프레임",
      summary: "드론의 모든 부품이 장착되는 기체 골격",
      material: "고강도 탄소 섬유 (Carbon Fiber) 및 알루미늄 합금",
      role: "핵심 부품 고정 및 외부 충격으로부터 기기 보호",
      description:
        "초경량·고강성 소재를 사용하여 기체의 무게를 최소화하면서도, 고속 비행 시 발생하는 진동을 효과적으로 억제하는 중심 뼈대입니다.",
      feature:
        "내식성이 강해 습한 환경에서도 구조적 변형이 없으며 모듈형 설계로 유지보수가 용이함",
      model: "/models/Main frame.glb",
    },
    {
      id: "arm_gear",
      name: "02 암 기어",
      summary: "모터와 날개를 연결하는 동력 전달부",
      material: "강화 플라스틱 (PA66) 및 정밀 가공 기어 스틸",
      role: "모터의 회전력을 날개에 정밀하게 전달",
      description:
        "모터 본체와 메인 프레임을 견고하게 결합하며, 내부의 기어 시스템을 통해 동력 손실을 최소화하여 회전 효율을 극대화합니다.",
      feature: "충격 완화 구조가 적용되어 착륙 시 발생하는 물리적 대미지 분산",
      model: "/models/Arm gear.glb",
    },
    {
      id: "blade",
      name: "03 임펠러 블레이드",
      summary: "고속 회전형 추진 프로펠러",
      material: "유리섬유 강화 나일론 (GFN)",
      role: "공기 역학적 양력 발생 및 추진력 제공",
      description:
        "최적화된 곡률 설계를 통해 낮은 소음으로도 강력한 양력을 발생시키며, 드론의 수직 이착륙과 방향 전환을 담당하는 핵심 부품입니다.",
      feature:
        "표면 특수 코팅 처리를 통해 공기 저항 계수를 낮추고 에너지 효율 15% 향상",
      model: "/models/Impellar Blade.glb",
    },
    {
      id: "leg",
      name: "04 랜딩 레그",
      summary: "안전한 착륙을 위한 충격 흡수 장치",
      material: "합성 고무 및 연성 플라스틱 (TPU)",
      role: "지면 착륙 시 본체 보호 및 수평 유지",
      description:
        "지면과 직접 맞닿는 부품으로, 착륙 시 발생하는 운동 에너지를 흡수하여 정밀 센서와 프레임에 가해지는 충격을 방지합니다.",
      feature:
        "미끄럼 방지 패턴이 적용되어 경사진 지면에서도 안정적인 거치 가능",
      model: "/models/Leg.glb",
    },
    {
      id: "beater_disc",
      name: "05 비터 디스크",
      summary: "회전 밸런스 및 공기 흐름 조절기",
      material: "경량 폴리카보네이트",
      role: "모터 상단의 회전 균형 유지 및 냉각 보조",
      description:
        "모터 하우징 상단에서 고속 회전하며 무게 중심을 잡고, 공기 흐름을 유도하여 모터에서 발생하는 열을 빠르게 식혀줍니다.",
      feature:
        "회전 시 발생하는 와류를 억제하여 비행 안정성을 높이는 공기역학적 구조",
      model: "/models/Beater disc.glb",
    },
    {
      id: "gearing",
      name: "06 기어링 시스템",
      summary: "정밀 속도 조절 및 토크 변환기",
      material: "특수 합금강 (SCM415)",
      role: "모터 RPM 조절 및 구동력 분배",
      description:
        "모터의 고속 회전을 실제 주행에 적합한 토크로 변환해주며, 각 축으로 전달되는 동력을 일정하게 유지시키는 정밀 기어 세트입니다.",
      feature:
        "고주파 열처리 공정을 통해 내마모성을 높여 장시간 비행에도 성능 유지",
      model: "/models/Gearing.glb",
    },
    {
      id: "nut_screw",
      name: "07 고정용 너트/볼트",
      summary: "강력한 결합을 위한 체결 부품",
      material: "스테인리스 스틸 (SUS304)",
      role: "부품 간 결합력 유지 및 진동 이탈 방지",
      description:
        "비행 중 발생하는 강력한 진동에도 부품이 풀리지 않도록 단단히 고정하며, 드론의 전체적인 강성을 완성합니다.",
      feature:
        "풀림 방지(Nyloc) 처리가 되어 있어 별도의 접착제 없이도 강력한 체결력 유지",
      model: "/models/Nut.glb",
    },
    {
      id: "xyz_sensor",
      name: "08 XYZ 자이로 센서",
      summary: "비행 안정성을 담당하는 수평 감지 센서",
      material: "실리콘 기반 MEMS 칩셋",
      role: "기체의 기울기 및 방향 실시간 감지",
      description:
        "드론의 3축(X, Y, Z) 기울기를 초당 수천 번 감지하여 비행 제어 장치(FC)에 신호를 보내고, 실시간으로 수평을 유지하도록 돕습니다.",
      feature:
        "온도 보정 알고리즘이 내장되어 외부 기온 변화에도 정밀한 측정 가능",
      model: "/models/xyz.glb",
    },
  ];

  const [selectedId, setSelectedId] = useState(partsData[0].id);
  const currentPart = partsData.find((p) => p.id === selectedId);

  return (
    // 1. 전체 배경 (연한 회색 배경)
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* 2. 메인 컨테이너 (흰색 라운드 카드) */}
      <div className="w-full h-full max-w-[1400px] bg-white rounded-3xl shadow-xl flex overflow-hidden">
        {/* --- 왼쪽: 3D 부품 조회 영역 (70%) --- */}
        <div className="w-[70%] h-full relative border-r border-gray-100 flex flex-col p-6">
          <div className="flex flex-1 gap-6 min-h-0">
            {/* 왼쪽 리스트와 스크롤바 */}
            <PartList
              parts={partsData}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            {/* 중앙 3D 캔버스 영역 */}
            <div className="flex-1 bg-gray-50 rounded-2xl relative">
              <Canvas>{/* 3D 모델 로직 */}</Canvas>
            </div>
          </div>

          {/* 하단 상세 설명창 */}
          <div className="absolute bottom-6 right-6 z-30 w-[400px]">
            <PartDetail selectedPart={currentPart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewer;
