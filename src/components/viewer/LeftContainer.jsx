import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import AiNote from './ai/AiNote';
import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing";
import AnimationPlayer from "./AnimationPlayer";
import AnimationSlider from "./AnimationSlider";
import { mapModelData } from "../../utils/modelMapper";

function SinglePartModel({ modelPath }) {
  if (!modelPath) return null;
  
  try {
    const { scene } = useGLTF(modelPath);
    return <primitive object={scene.clone()} />;
  } catch (error) {
    return null;
  }
}

const LeftContainer = ({ 
  apiData,
  showAiNote, 
  setShowAiNote, 
  onMaximize, 
  floatingMessages, 
  setFloatingMessages 
}) => {
  const [transformedParts, setTransformedParts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showAssembly, setShowAssembly] = useState(true);
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(100);

  useEffect(() => {
    const loadParts = async () => {
      const mapped = await mapModelData(apiData);
      setTransformedParts(mapped);
      
      if (mapped.length > 0 && !selectedId) {
        setSelectedId(mapped[0].id);
      }
    };
    
    if (apiData) {
      loadParts();
    }
  }, [apiData]);

  const currentPart = transformedParts.find((p) => p.id === selectedId);
  const assemblyPart = transformedParts.find((p) => p.isAssembly);

  const handleReset = () => {
    setCurrentFrame(0);
  };

  const handleFrameChange = (frame) => {
    setCurrentFrame(frame);
  };

  const handlePartSelect = (partId) => {
    setSelectedId(partId);
    const part = transformedParts.find(p => p.id === partId);
    
    if (part?.isAssembly) {
      setShowAssembly(true);
    } else {
      setShowAssembly(true);
    }
  };

  return (
    <div className="bg-white rounded-lg w-full h-full flex flex-col p-6 relative">
      {showAiNote && (
        <AiNote 
          onClose={() => setShowAiNote(false)} 
          onMaximize={onMaximize}
          messages={floatingMessages}       
          setMessages={setFloatingMessages} 
        />
      )}
      
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar shrink-0 p-1">
          <PartList
            parts={transformedParts}
            selectedId={selectedId}
            onSelect={handlePartSelect}
          />
        </div>

        <div className="flex-1 bg-white rounded-2xl relative overflow-hidden">
          {showBriefing && (
            <AiBriefing 
              className="absolute left-28 z-50" 
              onClose={() => setShowBriefing(false)} 
            />
          )}

          {assemblyPart?.model && showAssembly ? (
            <>
              <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.6} contactShadow={false}>
                    <AnimationPlayer 
                      url={assemblyPart.model} 
                      currentFrame={currentFrame}
                      totalFrames={totalFrames}
                      selectedPartMesh={currentPart?.isAssembly ? null : currentPart?.meshName}
                    />
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault />
              </Canvas>

              <AnimationSlider
                currentFrame={currentFrame}
                totalFrames={totalFrames}
                onFrameChange={handleFrameChange}
                onReset={handleReset}
                modelUrl={assemblyPart.model}
              />
            </>
          ) : currentPart?.model ? (
            <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6} contactShadow={false}>
                  <SinglePartModel modelPath={currentPart.model} />
                </Stage>
              </Suspense>
              <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              3D 모델을 불러올 수 없습니다.
            </div>
          )}
        </div>
      </div>

      <PartDetail selectedPart={currentPart} />
    </div>
  );
};

export default LeftContainer;