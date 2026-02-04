import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";

import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";

// 3D 모델 렌더링 헬퍼 컴포넌트
function SinglePartModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene.clone()} />;
}

const LeftContainer = ({ partsData }) => {
  const [selectedId, setSelectedId] = useState(partsData[0].id);
  const currentPart = partsData.find((p) => p.id === selectedId);

  return (
    <div className="w-full h-full flex flex-col relative">
      
      <div className="flex flex-1 gap-6 min-h-0">
        {/* 1. 부품 리스트 */}
        <PartList
          parts={partsData}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {/* 2. 3D 캔버스 영역 */}
        <div className="flex-1 bg-white rounded-2xl relative shadow-inner overflow-hidden">
          <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
            <Suspense fallback={null}>
              <Stage environment="city" intensity={0.6} contactShadow={false}>
                <SinglePartModel modelPath={currentPart ? currentPart.model : ""} />
              </Stage>
            </Suspense>
            <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>
      </div>

      {/* 3. 하단 설명 카드 */}
      <PartDetail selectedPart={currentPart} />
    </div>
  );
};

export default LeftContainer;