import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, GizmoHelper, GizmoViewport, Center } from "@react-three/drei";
import AiNote from "./ai/AiNote";
import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing";
import AnimationPlayer from "./AnimationPlayer";
import AnimationSlider from "./AnimationSlider";
import AiBriefingIcon from "../../assets/icons/icon-ai-breifing.svg";
import AiNotBriefingIcon from "../../assets/icons/icon-ai-notbreifing.svg";
import { mapModelData } from "../../utils/modelMapper";
import { fetchAiBriefing } from "../../api/aiAPI";
import { getChatsByModel } from "../../api/aiDB";

function SinglePartModel({ modelPath }) {
  if (!modelPath) return null;

  try {
    const { scene } = useGLTF(modelPath);
    // ✨ Center 컴포넌트로 감싸서 자동으로 중앙정렬
    return (
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    );
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
  setFloatingMessages,
  modelId,
}) => {
  const [transformedParts, setTransformedParts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
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

  const [briefingData, setBriefingData] = useState(null);

  useEffect(() => {
    const loadBriefing = async () => {
      if (!modelId) return;

      try {
        const modelChats = await getChatsByModel(String(modelId));
        if (!modelChats || modelChats.length === 0) return;

        const offset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - offset).toISOString().split("T")[0];

        const todaysChats = modelChats.filter((chat) => {
          if (!chat.lastUpdated) return false;
          const chatDate = new Date(chat.lastUpdated - offset)
            .toISOString()
            .split("T")[0];
          return chatDate === today;
        });

        const combinedMessages = todaysChats.slice(-3).reduce((acc, chat) => {
          return [...acc, ...(chat.messages || [])];
        }, []);

        console.log(
          `📊 모델(${modelId}) 오늘 메시지 수:`,
          combinedMessages.length,
        );

        if (combinedMessages.length >= 8 && !briefingData) {
          const result = await fetchAiBriefing(combinedMessages);
          if (result && result.data) {
            setBriefingData(result.data);
          } else {
            setBriefingData(result);
          }
          setShowBriefing(true);
          console.log("✅ 모델 맞춤형 브리핑 생성 성공!");
        }
      } catch (error) {
        console.error("❌ 브리핑 로드 실패:", error);
      }
    };

    loadBriefing();
  }, [modelId]);

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
    const part = transformedParts.find((p) => p.id === partId);

    if (part?.isAssembly) {
      setShowAssembly(true);
    } else {
      setShowAssembly(true);
    }
  };

  return (
    <div className="bg-white w-full h-full flex flex-row p-4 gap-1 relative overflow-hidden">
      {showAiNote && (
        <AiNote
          onClose={() => setShowAiNote(false)}
          onMaximize={onMaximize}
          messages={floatingMessages}
          setMessages={setFloatingMessages}
          modelId={modelId}
        />
      )}

      <div className="w-[110px] h-full flex flex-col shrink-0 z-20 pt-2">
        <PartList
          parts={transformedParts}
          selectedId={selectedId}
          onSelect={handlePartSelect}
        />
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex-[7.5] bg-white rounded-2xl relative overflow-hidden flex flex-col">
          {showBriefing && (
            <AiBriefing
              className="absolute left-4 bottom-20 z-50"
              onClose={() => setShowBriefing(false)}
            />
          )}

          <button
            onClick={() => setShowBriefing(!showBriefing)}
            className="absolute bottom-8 left-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all z-50 hover:scale-105 active:scale-95"
            title="AI 브리핑 토글"
          >
            <img
              src={showBriefing ? AiBriefingIcon : AiNotBriefingIcon}
              alt="AI Briefing Icon"
              className="w-8 h-8"
            />
          </button>

          <div className="flex-1 relative min-h-0">
            {assemblyPart?.model && showAssembly ? (
              <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={0.6}
                    contactShadow={false}
                  >
                    {/* ✨ Center로 감싸서 중앙정렬 */}
                    <Center>
                      <AnimationPlayer
                        url={assemblyPart.model}
                        currentFrame={currentFrame}
                        totalFrames={totalFrames}
                        selectedPartMesh={
                          currentPart?.isAssembly ? null : currentPart?.meshName
                        }
                      />
                    </Center>
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault />
                <GizmoHelper alignment="top-right" margin={[80, 80]}>
                  <GizmoViewport 
                    axisColors={['#68A2FF', '#84EBAD', '#FF9191']}
                    labelColor="white"
                  />
                </GizmoHelper>
              </Canvas>
            ) : currentPart?.model ? (
              <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={0.6}
                    contactShadow={false}
                  >
                    <SinglePartModel modelPath={currentPart.model} />
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
                <GizmoHelper alignment="top-right" margin={[80, 80]}>
                  <GizmoViewport 
                    axisColors={['#68A2FF', '#84EBAD', '#FF9191']}
                    labelColor="white"
                  />
                </GizmoHelper>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                3D 모델을 불러올 수 없습니다.
              </div>
            )}
          </div>

          {assemblyPart?.model && showAssembly && (
            <div className="w-full bg-white py-3 px-6 shrink-0">
              <AnimationSlider
                currentFrame={currentFrame}
                totalFrames={totalFrames}
                onFrameChange={handleFrameChange}
                onReset={handleReset}
                modelUrl={assemblyPart.model}
              />
            </div>
          )}
        </div>

        <div className="flex-[2.5] min-h-[160px] pt-2">
          <PartDetail selectedPart={currentPart} />
        </div>
      </div>
    </div>
  );
};

export default LeftContainer;
