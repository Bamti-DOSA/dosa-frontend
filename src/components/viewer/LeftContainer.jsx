import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import AiNote from "./ai/AiNote";
import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing";
import AnimationPlayer from "./AnimationPlayer";
import AnimationSlider from "./AnimationSlider";
import { mapModelData } from "../../utils/modelMapper";
import { fetchAiBriefing } from "../../api/aiAPI";
import { getChatsByModel } from "../../api/aiDB";

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
      // 1. modelId가 없으면 중단
      if (!modelId) return; //

      try {
        // 2. 현재 모델에 해당하는 모든 채팅 가져오기
        const modelChats = await getChatsByModel(String(modelId)); //
        if (!modelChats || modelChats.length === 0) return; //

        // 3. 한국 시간 기준 오늘 날짜 구하기 (YYYY-MM-DD)
        const offset = new Date().getTimezoneOffset() * 60000; //
        const today = new Date(Date.now() - offset).toISOString().split("T")[0]; //

        // 4. 오늘 나눈 대화만 필터링
        const todaysChats = modelChats.filter((chat) => {
          if (!chat.lastUpdated) return false; //
          const chatDate = new Date(chat.lastUpdated - offset)
            .toISOString()
            .split("T")[0]; //
          return chatDate === today; //
        });

        // 5. 메시지 합치기 (최근 3개 세션)
        const combinedMessages = todaysChats.slice(-3).reduce((acc, chat) => {
          return [...acc, ...(chat.messages || [])]; //
        }, []);

        console.log(
          `📊 모델(${modelId}) 오늘 메시지 수:`,
          combinedMessages.length,
        ); //

        // 6. 8번 이상 대화 시 브리핑 생성
        if (combinedMessages.length >= 8 && !briefingData) {
          //
          const result = await fetchAiBriefing(combinedMessages); //
          if (result && result.data) {
            setBriefingData(result.data); // 👈 .data 를 붙여서 실제 본문만 전달
          } else {
            setBriefingData(result); // 혹시 이미 본문만 오고 있다면 그대로 유지
          }
          setShowBriefing(true); //
          console.log("✅ 모델 맞춤형 브리핑 생성 성공!"); //
        }
      } catch (error) {
        console.error("❌ 브리핑 로드 실패:", error); //
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
    <div className="bg-white rounded-lg w-full h-full flex flex-col p-6 relative">
      {showAiNote && (
        <AiNote
          onClose={() => setShowAiNote(false)}
          onMaximize={onMaximize}
          messages={floatingMessages}
          setMessages={setFloatingMessages}
          modelId={modelId}
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
          {/* 💡 AiBriefing의 z-index를 더 높이고 위치를 확실히 잡습니다. */}
          {showBriefing && briefingData && (
            <AiBriefing
              className="absolute left-10 top-10 z-[9999] pointer-events-auto"
              data={briefingData}
              onClose={() => setShowBriefing(false)}
            />
          )}

          {assemblyPart?.model && showAssembly ? (
            <>
              <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={0.6}
                    contactShadow={false}
                  >
                    <AnimationPlayer
                      url={assemblyPart.model}
                      currentFrame={currentFrame}
                      totalFrames={totalFrames}
                      selectedPartMesh={
                        currentPart?.isAssembly ? null : currentPart?.meshName
                      }
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
