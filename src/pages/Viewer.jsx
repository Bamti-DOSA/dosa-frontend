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
  // 2. 부품 데이터 (각 부품에 해당하는 실제 .glb 파일 경로를 적어주세요)
  const partsData = [
    {
      id: "main_frame",
      name: "01 메인 프레임",
      usage: "기체 골격",
      description:
        "드론의 모든 부품이 장착되는 중심 뼈대입니다. 고강도 탄소 섬유 재질로 제작되었습니다.",
      model: "/models/Main frame.glb",
    },
    {
      id: "arm_gear",
      name: "02 암 기어",
      usage: "동력 전달",
      description:
        "모터와 프레임을 연결하며, 내부 기어를 통해 정밀한 회전력을 날개에 전달합니다.",
      model: "/models/Arm gear.glb",
    },
    {
      id: "blade",
      name: "03 임펠러 블레이드",
      usage: "추진력 발생",
      description:
        "고속 회전을 통해 양력을 발생시켜 드론이 공중에 뜰 수 있게 하는 날개 부품입니다.",
      model: "/models/Impellar Blade.glb",
    },
    {
      id: "leg",
      name: "04 랜딩 레그",
      usage: "착륙 보호",
      description:
        "이착륙 시 본체에 가해지는 충격을 흡수하고 프레임을 지면으로부터 보호합니다.",
      model: "/models/Leg.glb",
    },
    {
      id: "beater_disc",
      name: "05 비터 디스크",
      usage: "회전 밸런스",
      description:
        "모터 상단에서 회전 균형을 잡아주며 공기 흐름을 조절하는 보조 부품입니다.",
      model: "/models/Beater disc.glb",
    },
    {
      id: "gearing",
      name: "06 기어링 시스템",
      usage: "속도 조절",
      description:
        "모터의 회전 속도를 드론 주행에 적합한 토크로 변환해주는 정밀 기어 세트입니다.",
      model: "/models/Gearing.glb",
    },
    {
      id: "nut_screw",
      name: "07 고정용 너트/볼트",
      usage: "부품 체결",
      description:
        "드론의 각 부품을 단단하게 고정시켜 비행 중 진동으로 인한 분해를 방지합니다.",
      model: "/models/Nut.glb", // Screw.glb와 번갈아 테스트해보세요!
    },
    {
      id: "xyz_sensor",
      name: "08 XYZ 자이로 센서",
      usage: "수평 유지",
      description:
        "드론의 기울기와 방향을 감지하여 비행 안정성을 유지하는 핵심 센서 모듈입니다.",
      model: "/models/xyz.glb",
    },
  ];

  const [selectedId, setSelectedId] = useState(partsData[0].id);
  const currentPart = partsData.find((p) => p.id === selectedId);

  return (
    <div className="relative w-screen h-screen bg-[#FDE2E4] overflow-hidden">
      {/* 2. 여기서 컴포넌트들을 '사용'해줘야 에러가 사라집니다! */}
      <PartList
        parts={partsData}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <PartDetail selectedPart={currentPart} />
    </div>
  );
};

export default Viewer;
