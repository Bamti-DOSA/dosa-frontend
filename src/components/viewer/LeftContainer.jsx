import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  useGLTF,
  GizmoHelper,
  GizmoViewport,
  Center,
} from "@react-three/drei";
import * as THREE from "three"; // 재질 처리를 위해 추가

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

// 개별 부품 모델 뷰어 (재질 변경 로직 추가)
function SinglePartModel({ modelPath, overrideMaterial }) {
  if (!modelPath) return null;

  try {
    const { scene } = useGLTF(modelPath);

    // 재질 덮어쓰기 로직
    useEffect(() => {
      if (!overrideMaterial) return;
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          if (overrideMaterial.color)
            child.material.color.set(overrideMaterial.color);
          if (overrideMaterial.metalness !== undefined)
            child.material.metalness = overrideMaterial.metalness;
          if (overrideMaterial.roughness !== undefined)
            child.material.roughness = overrideMaterial.roughness;
          child.material.needsUpdate = true;
        }
      });
    }, [overrideMaterial, scene]);

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

  // ✨ 1. 재질 상태 추가
  const [activeMaterial, setActiveMaterial] = useState(null);

  // 부품 로드 로직
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

  // AI 브리핑 로직 (기존 유지)
  const [briefingData, setBriefingData] = useState(null);
  useEffect(() => {
    const loadBriefing = async () => {
      if (!modelId || briefingData) return; // 이미 데이터가 있으면 중단

      try {
        // 1. 해당 모델의 모든 채팅 내역 가져오기
        const modelChats = await getChatsByModel(String(modelId));
        if (!modelChats || modelChats.length === 0) return;

        // 2. 최근 순으로 채팅 정렬
        const sortedChats = [...modelChats].sort(
          (a, b) => b.lastUpdated - a.lastUpdated,
        );

        // 3. 모든 메시지를 하나로 합치기
        const allMessages = sortedChats.reduce((acc, chat) => {
          return [...acc, ...(chat.messages || [])];
        }, []);

        // 4. ✨ 의미 있는 메시지 필터링 (단순 인사 제외)
        const meaningfulMessages = allMessages.filter((msg) => {
          const content = msg.content || msg.text || "";
          const trimmed = content.trim();

          // 조건 A: 글자 수가 5자 이상 (너무 짧은 "네", "아니오", "안녕" 제외)
          const isLongEnough = trimmed.length >= 5;

          // 조건 B: 단순 인사말 패턴 제외
          const isNotGreeting =
            !/^(안녕|안녕하세요|반가워|ㅎㅇ|hi|hello|반갑다)/i.test(trimmed);

          return isLongEnough && isNotGreeting;
        });

        console.log(
          `📊 [모델 ${modelId}] 분석된 의미 있는 메시지: ${meaningfulMessages.length}개`,
        );

        // 5. 의미 있는 메시지가 8개 이상일 때만 브리핑 요청
        if (meaningfulMessages.length >= 8) {
          const result = await fetchAiBriefing(meaningfulMessages.slice(-20)); // 너무 많으면 최근 20개만 요약
          if (result && result.data) {
            setBriefingData(result.data);
          } else {
            setBriefingData(result);
          }
          setShowBriefing(true);
          console.log("✅ 조건 충족: AI 브리핑 생성 성공");
        }
      } catch (error) {
        console.error("❌ 브리핑 로드 실패:", error);
      }
    };

    loadBriefing();
  }, [modelId]); // modelId가 바뀔 때만 실행

  const currentPart = transformedParts.find((p) => p.id === selectedId);
  const assemblyPart = transformedParts.find((p) => p.isAssembly);

  const handleReset = () => setCurrentFrame(0);
  const handleFrameChange = (frame) => setCurrentFrame(frame);

  const handlePartSelect = (partId) => {
    setSelectedId(partId);
  };

  // ✨ 2. 재질 선택 핸들러
  const handleMaterialSelect = (materialProps) => {
    setActiveMaterial(materialProps);
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
              data={briefingData}
            />
          )}

          <button
            onClick={() => setShowBriefing(!showBriefing)}
            className="absolute bottom-8 left-4 w-10 h-10 rounded-xl cursor-pointer  flex items-center justify-center transition-all z-50"
          >
            <img
              src={showBriefing ? AiBriefingIcon : AiNotBriefingIcon}
              alt="AI Briefing"
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
                    <Center>
                      {/* ✨ 3. 조립 모델에 재질 전달 */}
                      <AnimationPlayer
                        url={assemblyPart.model}
                        currentFrame={currentFrame}
                        totalFrames={totalFrames}
                        selectedPartMesh={
                          currentPart?.isAssembly ? null : currentPart?.meshName
                        }
                        overrideMaterial={activeMaterial}
                      />
                    </Center>
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault />
              </Canvas>
            ) : currentPart?.model ? (
              <Canvas shadows camera={{ position: [4, 0, 4], fov: 50 }}>
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={0.6}
                    contactShadow={false}
                  >
                    {/* ✨ 4. 단일 모델에 재질 전달 */}
                    <SinglePartModel
                      modelPath={currentPart.model}
                      overrideMaterial={activeMaterial}
                    />
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                모델을 불러오는 중...
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
          {/* ✨ 5. 재질 선택 함수 전달 */}
          <PartDetail
            selectedPart={currentPart}
            onMaterialSelect={handleMaterialSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftContainer;
