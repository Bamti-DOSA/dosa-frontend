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
      name: "메인 프레임",
      description:
        "OnRobot Soft Gripper는 다양한 범위의 불규칙한 형태와 연약한 물체를 잡을 수 있어 식품과 음료 생산은 물론, 제조나 포장 산업에서의 픽앤플레이스 애플리케이션에 적합합니다. Soft Gripper는 어떤 로봇과도 매끄럽게 통합될 수 있씁니다. Soft Gripper는 외부 공기 공급장치 없이 작동하므로 추가 비용이나 복잡성이 발생하지 않고 기존 진공 그리퍼에서 발생하는 분진이나 소음도 없습니다.Soft Gripper는 외부 공기 공급장치 없이 작동하므로 추가 비용이나 복잡성이 발생하지 않고 기존 진공 그리퍼에서 발생하는 분진이나 소음도 없습니다.",
      model: "/models/Main frame.glb",
    },
    {
      id: "arm_gear",
      name: "암 기어",
      description:
        "모터 본체와 프레임을 연결하는 핵심 부품으로, 내부 기어 시스템을 통해 동력 손실 없이 날개에 강력한 회전 에너지를 전달합니다.",
      model: "/models/Arm gear.glb",
    },
    {
      id: "blade",
      name: "임펠러 블레이드",
      description:
        "공기역학적 설계를 통해 낮은 소음으로도 최대의 양력을 발생시킵니다. 수직 이착륙과 정밀한 방향 전환을 가능하게 하는 핵심 추진체입니다.",
      model: "/models/Impellar Blade.glb",
    },
    {
      id: "leg",
      name: "랜딩 레그",
      description:
        "이착륙 시 발생하는 물리적 충격을 흡수하여 정밀 센서와 메인 프레임을 보호합니다. 경사진 지면에서도 기체가 안정적으로 거치되도록 돕습니다.",
      model: "/models/Leg.glb",
    },
    {
      id: "beater_disc",
      name: "비터 디스크",
      description:
        "모터 상단에서 고속 회전 시 무게 중심을 완벽하게 잡아줍니다. 동시에 공기 흐름을 유도하여 모터에서 발생하는 열을 빠르게 식혀주는 역할을 합니다.",
      model: "/models/Beater disc.glb",
    },
    {
      id: "gearing",
      name: "기어링 시스템",
      description:
        "모터의 고속 회전을 주행에 적합한 힘으로 변환합니다. 각 축에 전달되는 동력을 일정하게 유지하여 부드럽고 안정적인 비행 성능을 완성합니다.",
      model: "/models/Gearing.glb",
    },
    {
      id: "nut_screw",
      name: "고정용 너트/볼트",
      description:
        "강한 진동에도 각 부품이 분리되지 않도록 단단히 고정합니다. 드론의 전체적인 강성을 높여 비행 중 발생할 수 있는 결합 이탈 사고를 방지합니다.",
      model: "/models/Nut.glb",
    },
    {
      id: "xyz_sensor",
      name: "XYZ 자이로 센서",
      description:
        "3축 기울기를 실시간으로 정밀하게 감지하여 비행 안정성을 유지합니다. 외부 환경 변화에도 드론이 수평을 잃지 않도록 돕는 브레인 역할을 합니다.",
      model: "/models/xyz.glb",
    },
  ];

  const [selectedId, setSelectedId] = useState(partsData[0].id);
  const currentPart = partsData.find((p) => p.id === selectedId);

  return (
    // 1. 전체 배경 (연한 회색 배경)
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center p-8">
      {/* 2. 메인 컨테이너 (흰색 라운드 카드) */}
      <div className="w-full h-full max-w-[1400px] bg-gray-200 rounded-3xl flex overflow-hidden">
        {/* --- 왼쪽: 3D 부품 조회 영역 (70%) --- */}
        <div className="w-[70%] h-full relative border-r bg-gray-200 border-gray-100 flex flex-col p-6">
          <div className="flex flex-1 gap-6 min-h-0">
            {/* 왼쪽 리스트와 스크롤바 */}
            <PartList
              parts={partsData}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            {/* 중앙 3D 캔버스 영역 */}
            <div className="flex-1 bg-gray-100 rounded-2xl relative">
              <Canvas>{/* 3D 모델 로직 */}</Canvas>
            </div>
          </div>

          <PartDetail selectedPart={currentPart} />
        </div>
      </div>
    </div>
  );
};

export default Viewer;
