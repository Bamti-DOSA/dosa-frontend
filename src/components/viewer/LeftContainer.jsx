import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Sparkles } from "lucide-react";
import AiNote from './ai/AiNote';

import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing"; 

function SinglePartModel({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene.clone()} />;
}

const LeftContainer = ({ 
  partsData, 
  showAiNote, 
  setShowAiNote, 
  onMaximize, 
  floatingMessages, 
  setFloatingMessages 
}) => {
  const [selectedId, setSelectedId] = useState(partsData[0].id);
  const [showBriefing, setShowBriefing] = useState(true);

  const currentPart = partsData.find((p) => p.id === selectedId);

  return (
    <div className="bg-[#FFF] rounded-lg w-full h-full flex flex-col p-6 relative">
      {showAiNote && (
        <AiNote 
            onClose={() => setShowAiNote(false)} 
            onMaximize={onMaximize} // 부모(Viewer)의 탭 전환 함수 실행
            messages={floatingMessages}       
            setMessages={setFloatingMessages} 
        />
      )}
      
      <div className="flex flex-1 gap-6 min-h-0">
        {/* 1. 부품 리스트 */}
        <div className="h-full overflow-y-auto custom-scrollbar shrink-0 p-1">
          <PartList
            parts={partsData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* 2. 3D 캔버스 영역 */}
        <div className="flex-1 bg-[#FFF] rounded-2xl relative overflow-hidden">
          
          {showBriefing && (
            <AiBriefing 
              className="absolute left-28 z-50" 
              onClose={() => setShowBriefing(false)} 
            />
          )}

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

      <PartDetail selectedPart={currentPart} />
    </div>
  );
};

export default LeftContainer;