import React, { useState, useEffect, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  useGLTF,
  GizmoHelper,
  GizmoViewport,
  Center,
  TransformControls,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import AiNote from "./ai/AiNote";
import PartDetail from "../part/PartDetail";
import PartList from "../part/PartList";
import AiBriefing from "./ai/AiBriefing";
import AnimationPlayer from "./AnimationPlayer";
import AnimationSlider from "./AnimationSlider";
import CoordinateDisplay from "./CoordinateDisplay";

import AiBriefingIcon from "../../assets/icons/icon-ai-breifing.svg";
import AiNotBriefingIcon from "../../assets/icons/icon-ai-notbreifing.svg";

import { mapModelData } from "../../utils/modelMapper";
import { fetchAiBriefing } from "../../api/aiAPI";
import { getChatsByModel } from "../../api/aiDB";
import LightOnIcon from "../../assets/icons/icon-light-on.svg";
import LightOffIcon from "../../assets/icons/icon-light-off.svg";

import { useCallback } from "react";

// ✅ 수정된 중심 좌표 계산 함수
async function calculateModelCenter(modelPath) {
  if (!modelPath) {
    console.warn("⚠️ modelPath가 없습니다");
    return { x: 0, y: 0, z: 0 };
  }

  console.log("🔍 모델 중심 계산 시작:", modelPath);

  try {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          console.log("✅ 모델 로드 성공:", modelPath);

          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = new THREE.Vector3();
          box.getCenter(center);

          const position = {
            x: center.x,
            y: center.y,
            z: center.z,
          };

          console.log("📍 계산된 중심 좌표:", position);
          resolve(position);
        },
        (progress) => {
          // 로딩 진행률 (선택사항)
        },
        (error) => {
          console.error("❌ 모델 로드 실패:", modelPath, error);
          resolve({ x: 0, y: 0, z: 0 });
        },
      );
    });
  } catch (error) {
    console.error("❌ calculateModelCenter 에러:", error);
    return { x: 0, y: 0, z: 0 };
  }
}

function SinglePartModel({ modelPath, overrideMaterial }) {
  if (!modelPath) return null;

  try {
    const { scene } = useGLTF(modelPath);

    useEffect(() => {
      scene.traverse((child) => {
        if (child.isMesh) {
          // 1. 재질 독립화
          child.material = child.material.clone();

          if (overrideMaterial) {
            // 2. 재질이 선택된 경우 (카본, 알루미늄 등)
            if (overrideMaterial.color)
              child.material.color.set(overrideMaterial.color);
            if (overrideMaterial.metalness !== undefined)
              child.material.metalness = overrideMaterial.metalness;
            if (overrideMaterial.roughness !== undefined)
              child.material.roughness = overrideMaterial.roughness;
          } else {
            // 3. ✨ 기본 재질 선택 시 (overrideMaterial === null)
            // 아무것도 없는 회색 재질로 명시적 초기화
            child.material.color.set("#bbbbbb"); // 기본 회색
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
  } catch (error) {
    return null;
  }
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
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0, z: 0 });

  // ✅ 4단계: 기본 중심 좌표를 저장할 state 추가
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0, z: 0 });

  // ✅ 4단계: 슬라이딩 된 좌표를 저장할 state 추가
  const [animatedPositions, setAnimatedPositions] = useState({});

  const [detailHeight, setDetailHeight] = useState(200);

  const [briefingData, setBriefingData] = useState(null);
  useEffect(() => {
    const loadBriefing = async () => {
      if (!modelId || briefingData) return;

      try {
        const modelChats = await getChatsByModel(String(modelId));
        if (!modelChats || modelChats.length === 0) return;

        const sortedChats = [...modelChats].sort(
          (a, b) => b.lastUpdated - a.lastUpdated,
        );

        const allMessages = sortedChats.reduce((acc, chat) => {
          return [...acc, ...(chat.messages || [])];
        }, []);

        const meaningfulMessages = allMessages.filter((msg) => {
          const content = msg.content || msg.text || "";
          const trimmed = content.trim();

          const isLongEnough = trimmed.length >= 5;

          const isNotGreeting =
            !/^(안녕|안녕하세요|반가워|ㅎㅇ|hi|hello|반갑다)/i.test(trimmed);

          return isLongEnough && isNotGreeting;
        });

        console.log(
          `📊 [모델 ${modelId}] 분석된 의미 있는 메시지: ${meaningfulMessages.length}개`,
        );

        if (meaningfulMessages.length >= 8) {
          const result = await fetchAiBriefing(meaningfulMessages.slice(-20));
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
  }, [modelId]);

  const currentPart = transformedParts.find((p) => p.id === selectedId);
  const assemblyPart = transformedParts.find((p) => p.isAssembly);

  const handleReset = () => setCurrentFrame(0);
  const handleFrameChange = (frame) => {
    const roundedFrame = Math.round(frame);
    if (currentFrame !== roundedFrame) {
      setCurrentFrame(roundedFrame);
    }
  };
  // ✅ 3단계: 부품 선택 시 좌표 업데이트
  const handlePartSelect = async (partId) => {
    console.log("🎯 부품 선택:", partId);
    setSelectedId(partId);

    const selectedPart = transformedParts.find((p) => p.id === partId);

    if (onPartSelect) {
      onPartSelect(selectedPart || null); // 선택 해제 시 null 전달
    }
    if (selectedPart && selectedPart.model) {
      console.log("📍 선택된 부품의 중심 좌표 계산 시작:", selectedPart.name);

      // ✅ 4단계: 슬라이딩 된 좌표가 있으면 그것을 사용, 없으면 계산
      if (currentFrame > 0 && animatedPositions[selectedPart.meshName]) {
        // 슬라이딩 된 좌표 사용
        const animatedPos = animatedPositions[selectedPart.meshName];
        console.log("🎬 슬라이딩 된 좌표 사용:", animatedPos);
        setCurrentPosition(animatedPos);
      } else {
        // 기본 중심 좌표 계산
        const center = await calculateModelCenter(selectedPart.model);
        console.log("✅ 선택된 부품 중심 좌표:", center);
        setCurrentPosition(center);
      }
    } else {
      console.warn("⚠️ 선택된 부품에 model 경로가 없습니다");
    }
  };

  const handleMaterialSelect = (materialProps) => {
    setActiveMaterial(materialProps);
  };

  const handlePositionUpdate = useCallback(
    (meshName, position) => {
      // 현재 선택된 부품의 좌표만 실시간으로 업데이트
      if (currentPart?.meshName === meshName) {
        const isDifferent =
          Math.abs(currentPosition.x - position.x) > 0.01 ||
          Math.abs(currentPosition.y - position.y) > 0.01 ||
          Math.abs(currentPosition.z - position.z) > 0.01;

        if (isDifferent) {
          setCurrentPosition(position);
        }
      }

      // 전체 부품 위치 저장은 렌더링 최적화를 위해 비교 후 업데이트
      setAnimatedPositions((prev) => {
        if (
          prev[meshName] &&
          Math.abs(prev[meshName].x - position.x) < 0.01 &&
          Math.abs(prev[meshName].y - position.y) < 0.01
        ) {
          return prev;
        }
        return { ...prev, [meshName]: position };
      });
    },
    [currentPart, currentPosition],
  );

  // ✅ 4단계: currentFrame이 변경될 때 현재 선택된 부품의 슬라이딩 좌표 업데이트
  useEffect(() => {
    if (currentPart && !currentPart.isAssembly && currentFrame > 0) {
      // AnimationPlayer로부터 현재 부품의 위치를 가져와야 함
      // 이 부분은 AnimationPlayer가 위치 정보를 제공하는 방식에 따라 달라짐
      console.log(
        "🎬 프레임 변경됨:",
        currentFrame,
        "부품:",
        currentPart.meshName,
      );
    } else if (currentFrame === 0 && currentPart) {
      // 슬라이더가 0으로 리셋되면 기본 좌표로 복원
      setCurrentPosition(basePosition);
      console.log("🔄 기본 좌표로 복원:", basePosition);
    }
  }, [currentFrame, currentPart]);

  // ✅ 부품 데이터 로드 및 기본 좌표 설정
  useEffect(() => {
    const loadParts = async () => {
      const mapped = await mapModelData(apiData);
      console.log("📦 매핑된 부품들:", mapped);

      setTransformedParts(mapped);

      const assemblyPart = mapped.find((p) => p.isAssembly);

      if (assemblyPart && !selectedId) {
        console.log("🎯 조립품 발견:", assemblyPart);
        setSelectedId(assemblyPart.id);

        if (assemblyPart.model) {
          console.log("📍 조립품 중심 좌표 계산 시작...");
          const center = await calculateModelCenter(assemblyPart.model);
          console.log("✅ 조립품 중심 좌표:", center);
          setCurrentPosition(center);
          setBasePosition(center); // ✅ 4단계: 기본 좌표 저장
        } else {
          console.warn("⚠️ 조립품에 model 경로가 없습니다");
        }
      } else if (mapped.length > 0 && !selectedId) {
        console.log("🎯 첫 번째 부품 선택:", mapped[0]);
        setSelectedId(mapped[0].id);

        if (mapped[0].model) {
          console.log("📍 첫 번째 부품 중심 좌표 계산 시작...");
          const center = await calculateModelCenter(mapped[0].model);
          console.log("✅ 첫 번째 부품 중심 좌표:", center);
          setCurrentPosition(center);
          setBasePosition(center); // ✅ 4단계: 기본 좌표 저장
        } else {
          console.warn("⚠️ 첫 번째 부품에 model 경로가 없습니다");
        }
      } else {
        console.log("ℹ️ 조립품/부품이 없거나 이미 선택됨");
      }
    };

    if (apiData) {
      loadParts();
    } else {
      console.warn("⚠️ apiData가 없습니다");
    }
  }, [apiData]);

  // useEffect(() => {
  //   const loadParts = async () => {
  //     console.log("🚀 loadParts 시작");
  //     const mapped = await mapModelData(apiData);
  //     setTransformedParts(mapped);

  //     // 1. 어떤 부품을 초기 선택값으로 할지 먼저 결정합니다.
  //     const assemblyPart = mapped.find((p) => p.isAssembly);
  //     const firstPart = mapped.length > 0 ? mapped[0] : null;
  //     const targetPart = assemblyPart || firstPart;

  //     // 2. 이미 선택된 게 없을 때만 초기화를 진행합니다.
  //     if (targetPart && !selectedId) {
  //       console.log("🎯 초기 타겟 설정:", targetPart.name);

  //       // ID를 먼저 확실히 박아줍니다.
  //       setSelectedId(targetPart.id);

  //       if (targetPart.model) {
  //         const center = await calculateModelCenter(targetPart.model);
  //         setCurrentPosition(center);
  //         setBasePosition(center);
  //       }
  //     }
  //   };

  //   if (apiData) {
  //     loadParts();
  //   }
  // }, [apiData]); // selectedId를 의존성에 넣지 않아야 무한 루프를 방지합니다.

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

      {/* 왼쪽 부품 리스트 (사이드바) */}
      <div className="w-[110px] h-full flex flex-col shrink-0 z-20 pt-2">
        <PartList
          parts={transformedParts}
          selectedId={selectedId}
          onSelect={handlePartSelect}
        />
      </div>

      {/* 메인 작업 영역 */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden">
        {/* ✅ 3, 4번 해결: 모델 영역의 높이를 (전체 - 설명창높이)로 설정하여 겹침 방지 및 슬라이더 노출 */}
        <div
          style={{ height: `calc(100% - ${detailHeight}px)` }}
          className="relative w-full transition-all duration-300 ease-out bg-white rounded-t-2xl overflow-hidden"
        >
          {/* 3D 캔버스 (이 영역 안에서만 그려짐) */}
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
                        // onPositionUpdate={(meshName, position) => {
                        //   // 1. 현재 선택된 부품의 좌표 실시간 업데이트
                        //   if (currentPart?.meshName === meshName) {
                        //     setCurrentPosition((prevPos) => {
                        //       // 아주 미세한 차이라도 있으면 업데이트 (오차 범위를 0.0001로 줄임)
                        //       const isChanged =
                        //         Math.abs(prevPos.x - position.x) > 0.0001 ||
                        //         Math.abs(prevPos.y - position.y) > 0.0001 ||
                        //         Math.abs(prevPos.z - position.z) > 0.0001;

                        //       return isChanged ? { ...position } : prevPos;
                        //     });
                        //   }

                        //   // 2. 전체 애니메이션 좌표 저장 (함수형 업데이트로 클로저 문제 해결)
                        //   setAnimatedPositions((prev) => {
                        //     const prevPos = prev[meshName];
                        //     if (
                        //       prevPos &&
                        //       Math.abs(prevPos.x - position.x) < 0.0001 &&
                        //       Math.abs(prevPos.y - position.y) < 0.0001 &&
                        //       Math.abs(prevPos.z - position.z) < 0.0001
                        //     ) {
                        //       return prev;
                        //     }
                        //     return { ...prev, [meshName]: { ...position } };
                        //   });
                        // }}
                        onPositionUpdate={handlePositionUpdate}
                      />
                    </Center>
                  </Stage>
                </Suspense>
                <OrbitControls
                  makeDefault
                  enablePan={true}
                  screenSpacePanning={true}
                />
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
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                모델 로딩 중...
              </div>
            )}
          </div>

          {/* 조명 버튼 (우측 상단 고정) */}
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={() => setIsLightOn(!isLightOn)}
              className="w-14 h-14 flex items-center justify-center transition-all hover:scale-105"
            >
              <img
                src={isLightOn ? LightOnIcon : LightOffIcon}
                className="w-12 h-12"
                alt="light"
              />
            </button>
          </div>

          {/* ✅ 2번 해결: 좌표랑 브리핑 버튼을 모델 영역 하단(설명창 바로 위)으로 배치 */}
          {/* 브리핑 상세창 */}
          <div className="absolute left-4 bottom-24 z-50 transition-all duration-300">
            {showBriefing && (
              <AiBriefing
                onClose={() => setShowBriefing(false)}
                data={briefingData}
              />
            )}
          </div>

          {/* 좌표값 표시 */}
          <div className="absolute right-4 bottom-10 z-50 transition-all duration-300">
            <CoordinateDisplay position={currentPosition} />
          </div>

          {/* 브리핑 아이콘 버튼 */}
          <button
            onClick={() => setShowBriefing(!showBriefing)}
            className="absolute left-4 bottom-12 z-50 transition-all duration-300 hover:scale-110"
          >
            <img
              src={showBriefing ? AiBriefingIcon : AiNotBriefingIcon}
              className="w-8 h-8"
              alt="ai"
            />
          </button>

          {/* ✅ 4번 해결: 슬라이더를 모델 영역의 맨 하단에 absolute로 고정 */}
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

        {/* ✅ 1번 해결: 설명창 영역 (좌우 여백을 없애기 위해 absolute가 아닌 flex 구조의 일부로 배치) */}
        <div
          style={{ height: `${detailHeight}px` }}
          className="w-full shrink-0 z-50"
        >
          <PartDetail
            selectedPart={currentPart}
            onMaterialSelect={handleMaterialSelect}
            onHeightChange={(newHeight) => setDetailHeight(newHeight)}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftContainer;
