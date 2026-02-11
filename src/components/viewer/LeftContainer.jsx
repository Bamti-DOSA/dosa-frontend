import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  useGLTF,
  GizmoHelper,
  GizmoViewport,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import AiNote from "./ai/AiNote";
import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing";
import AnimationPlayer from "./AnimationPlayer";
import AnimationSlider from "./AnimationSlider";
import CoordinateDisplay from "./CoordinateDisplay"; // 수정된 컴포넌트

import AiBriefingIcon from "../../assets/icons/icon-ai-breifing.svg";
import AiNotBriefingIcon from "../../assets/icons/icon-ai-notbreifing.svg";
import { mapModelData } from "../../utils/modelMapper";
import { fetchAiBriefing } from "../../api/aiAPI";
import { getChatsByModel } from "../../api/aiDB";
import LightOnIcon from "../../assets/icons/icon-light-on.svg";
import LightOffIcon from "../../assets/icons/icon-light-off.svg";

// ✅ 중심 좌표 계산 함수
async function calculateModelCenter(modelPath) {
  if (!modelPath) return { x: 0, y: 0, z: 0 };
  const loader = new GLTFLoader();
  return new Promise((resolve) => {
    loader.load(
      modelPath,
      (gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        resolve({ x: center.x, y: center.y, z: center.z });
      },
      undefined,
      () => resolve({ x: 0, y: 0, z: 0 }),
    );
  });
}

// ✅ 단일 부품 뷰어
function SinglePartModel({ modelPath, overrideMaterial }) {
  if (!modelPath) return null;
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        if (overrideMaterial) {
          if (overrideMaterial.color)
            child.material.color.set(overrideMaterial.color);
          if (overrideMaterial.metalness !== undefined)
            child.material.metalness = overrideMaterial.metalness;
          if (overrideMaterial.roughness !== undefined)
            child.material.roughness = overrideMaterial.roughness;
        } else {
          child.material.color.set("#bbbbbb");
          child.material.metalness = 0;
          child.material.roughness = 0.8;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [overrideMaterial, scene]);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

const LeftContainer = ({
  onPartSelect,
  partsData,
  apiData,
  showAiNote,
  setShowAiNote,
  onMaximize,
  floatingMessages,
  setFloatingMessages,
  modelId,
  isLightOn,
  setIsLightOn,
}) => {
  const [transformedParts, setTransformedParts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showAssembly, setShowAssembly] = useState(true);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames] = useState(100);

  const [activeMaterial, setActiveMaterial] = useState(null);

  // ✨ [수정됨] 위치/회전/크기를 통합 관리하는 State
  const [currentTransform, setCurrentTransform] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // ✨ [수정됨] 초기값 백업용 State
  const [baseTransform, setBaseTransform] = useState({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
  });

  // 애니메이션 중인 데이터 저장소 (키: meshName)
  const [animatedTransforms, setAnimatedTransforms] = useState({});

  const [detailHeight, setDetailHeight] = useState(200);
  const [briefingData, setBriefingData] = useState(null);

  // ... (브리핑 로드 로직 생략 - 기존과 동일) ...
  useEffect(() => {
    const loadBriefing = async () => {
      if (!modelId || briefingData) return;
      try {
        const modelChats = await getChatsByModel(String(modelId));
        if (!modelChats?.length) return;
        // ... (중략) ...
        const result = await fetchAiBriefing(modelChats[0].messages.slice(-10)); // 간단 예시
        if (result) setBriefingData(result.data || result);
        setShowBriefing(true);
      } catch (e) {
        console.error(e);
      }
    };
    loadBriefing();
  }, [modelId]);

  const currentPart = transformedParts.find((p) => p.id === selectedId);
  const assemblyPart = transformedParts.find((p) => p.isAssembly);

  const handleReset = () => setCurrentFrame(0);
  const handleFrameChange = (frame) => {
    const rounded = Math.round(frame);
    if (currentFrame !== rounded) setCurrentFrame(rounded);
  };

  // ✅ [수정됨] 부품 선택 핸들러
  const handlePartSelect = async (partId) => {
    console.log("🎯 부품 선택:", partId);
    setSelectedId(partId);

    const selectedPart = transformedParts.find((p) => p.id === partId);

    if (onPartSelect) onPartSelect(selectedPart || null);

    if (selectedPart && selectedPart.model) {
      // 1. 애니메이션 중인 데이터가 있으면 사용
      if (currentFrame > 0 && animatedTransforms[selectedPart.meshName]) {
        setCurrentTransform(animatedTransforms[selectedPart.meshName]);
      } else {
        // 2. 없으면 초기 위치 계산 (회전/크기는 기본값 0/1 할당)
        const center = await calculateModelCenter(selectedPart.model);

        // 🚨 여기서 setCurrentPosition이 아니라 setCurrentTransform을 써야 합니다!
        setCurrentTransform({
          position: center,
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        });
      }
    }
  };

  const handleMaterialSelect = (materialProps) => {
    setActiveMaterial(materialProps);
  };

  // ✅ [수정됨] 실시간 Transform 업데이트 핸들러
  const handleTransformUpdate = useCallback(
    (meshName, newTransform) => {
      // 1. 현재 선택된 부품이라면 UI 업데이트
      if (currentPart?.meshName === meshName) {
        setCurrentTransform((prev) => {
          const threshold = 0.0001; // 감지 민감도

          // 1) 위치 비교
          const posChanged =
            Math.abs(prev.position.x - newTransform.position.x) > threshold ||
            Math.abs(prev.position.y - newTransform.position.y) > threshold ||
            Math.abs(prev.position.z - newTransform.position.z) > threshold;

          // 2) 회전 비교 (중요!)
          const rotChanged =
            Math.abs(prev.rotation.x - newTransform.rotation.x) > threshold ||
            Math.abs(prev.rotation.y - newTransform.rotation.y) > threshold ||
            Math.abs(prev.rotation.z - newTransform.rotation.z) > threshold;

          // 3) 크기 비교
          const sclChanged =
            Math.abs(prev.scale.x - newTransform.scale.x) > threshold ||
            Math.abs(prev.scale.y - newTransform.scale.y) > threshold ||
            Math.abs(prev.scale.z - newTransform.scale.z) > threshold;

          // 하나라도 변했으면 새 값으로 업데이트
          if (posChanged || rotChanged || sclChanged) {
            return newTransform;
          }

          // 변한 게 없으면 기존 값 유지 (리렌더링 방지)
          return prev;
        });
      }

      // 2. 백그라운드 데이터 저장
      setAnimatedTransforms((prev) => {
        // (선택 사항) 여기도 동일한 비교 로직을 넣으면 메모리 최적화 가능
        return { ...prev, [meshName]: newTransform };
      });
    },
    [currentPart], // 의존성
  );

  // ✅ [수정됨] 프레임 0으로 리셋 시 초기값 복원
  useEffect(() => {
    if (currentFrame === 0 && currentPart) {
      // 🚨 에러 원인 해결: setCurrentPosition -> setCurrentTransform
      setCurrentTransform(baseTransform);
    }
  }, [currentFrame, currentPart, baseTransform]);

  // ✅ [수정됨] 초기 로드 시
  useEffect(() => {
    const loadParts = async () => {
      const mapped = await mapModelData(apiData);
      setTransformedParts(mapped);

      const assembly = mapped.find((p) => p.isAssembly);
      const first = mapped[0];

      // 초기 선택 로직
      if (!selectedId) {
        const target = assembly || first;
        if (target) {
          setSelectedId(target.id);
          if (target.model) {
            const center = await calculateModelCenter(target.model);
            const initialData = {
              position: center,
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
            };
            setCurrentTransform(initialData); // 🚨 수정
            setBaseTransform(initialData); // 🚨 수정
          }
        }
      }
    };
    if (apiData) loadParts();
  }, [apiData]);

  return (
    <div className="bg-white w-full h-full flex flex-row p-4 gap-1 relative overflow-hidden rounded-[8px]">
      {showAiNote && (
        <AiNote
          onClose={() => setShowAiNote(false)}
          onMaximize={onMaximize}
          messages={floatingMessages}
          setMessages={setFloatingMessages}
          modelId={modelId}
        />
      )}

      {/* 왼쪽 부품 리스트 */}
      <div className="w-[110px] h-full flex flex-col shrink-0 z-20 pt-2">
        <PartList
          parts={transformedParts}
          selectedId={selectedId}
          onSelect={handlePartSelect}
        />
      </div>

      {/* 메인 3D 영역 */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden">
        <div
          style={{ height: `calc(100% - ${detailHeight}px)` }}
          className="relative w-full transition-all duration-300 ease-out bg-white rounded-t-2xl overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            {assemblyPart?.model && showAssembly ? (
              <Canvas
                shadows={isLightOn}
                camera={{ position: [4, 0, 4], fov: 50 }}
              >
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={isLightOn ? 0.6 : 0}
                    shadows={isLightOn ? "contact" : false}
                    adjustCamera={true}
                  >
                    <Center>
                      <AnimationPlayer
                        url={assemblyPart.model}
                        currentFrame={currentFrame}
                        totalFrames={totalFrames}
                        selectedPartMesh={
                          currentPart?.isAssembly ? null : currentPart?.meshName
                        }
                        overrideMaterial={activeMaterial}
                        // 🚨 중요: onTransformUpdate 콜백 연결
                        onTransformUpdate={handleTransformUpdate}
                      />
                    </Center>
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault enablePan={true} />
                <GizmoHelper alignment="top-right" margin={[80, 80]}>
                  <GizmoViewport
                    axisColors={["#68A2FF", "#84EBAD", "#FF9191"]}
                    labelColor="white"
                  />
                </GizmoHelper>
              </Canvas>
            ) : currentPart?.model ? (
              <Canvas
                shadows={isLightOn}
                camera={{ position: [4, 0, 4], fov: 50 }}
              >
                <Suspense fallback={null}>
                  <Stage
                    environment="city"
                    intensity={isLightOn ? 0.6 : 0}
                    shadows={isLightOn ? "contact" : false}
                  >
                    <SinglePartModel
                      modelPath={currentPart.model}
                      overrideMaterial={activeMaterial}
                    />
                  </Stage>
                </Suspense>
                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
                <GizmoHelper alignment="top-right" margin={[80, 80]}>
                  <GizmoViewport
                    axisColors={["#68A2FF", "#84EBAD", "#FF9191"]}
                    labelColor="white"
                  />
                </GizmoHelper>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                모델 로딩 중...
              </div>
            )}
          </div>

          {/* 조명 버튼 */}
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={() => setIsLightOn(!isLightOn)}
              className="w-14 h-14 flex items-center justify-center hover:scale-105 transition-all"
            >
              <img
                src={isLightOn ? LightOnIcon : LightOffIcon}
                className="w-12 h-12"
                alt="light"
              />
            </button>
          </div>

          {/* 브리핑 창 */}
          <div className="absolute left-4 bottom-20 z-99999">
            {showBriefing && (
              <AiBriefing
                onClose={() => setShowBriefing(false)}
                data={briefingData}
              />
            )}
          </div>

          {/* 🚨 중요: 좌표 표시창 (transform prop 전달) */}
          <div className="absolute right-4 bottom-10 z-50 transition-all duration-300">
            <CoordinateDisplay transform={currentTransform} />
          </div>

          {/* 브리핑 아이콘 */}
          <button
            onClick={() => setShowBriefing(!showBriefing)}
            className="absolute left-4 bottom-10.5 z-50 hover:scale-110 transition-all"
          >
            <img
              src={showBriefing ? AiBriefingIcon : AiNotBriefingIcon}
              className="w-8 h-8"
              alt="ai"
            />
          </button>

          {/* 슬라이더 */}
          {assemblyPart?.model && showAssembly && (
            <div className="absolute left-0 right-0 bottom-2 px-6 pb-2 z-40">
              <div className="bg-white/60 backdrop-blur-md">
                <AnimationSlider
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  onFrameChange={handleFrameChange}
                  onReset={handleReset}
                  modelUrl={assemblyPart.model}
                />
              </div>
            </div>
          )}
        </div>

        {/* 하단 설명창 */}
        <div
          style={{ height: `${detailHeight}px` }}
          className="w-full shrink-0 z-50"
        >
          <PartDetail
            selectedPart={currentPart}
            onMaterialSelect={handleMaterialSelect}
            onHeightChange={setDetailHeight}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftContainer;
