import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";

function MiniModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}

const PartItem = ({ part, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onClick(part.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "97px",
        height: "97px",
        borderRadius: "8px",
        borderWidth: "0.915px",
        background: "#E4EBF1", // 기본 배경색 고정
        borderColor: isHovered ? "#B5C0C6" : isSelected ? "#4ade80" : "#E5E7EB",
      }}
      className="group flex-shrink-0 overflow-hidden transition-all duration-300 flex items-center justify-center relative shadow-sm pointer-events-auto"
    >
      {/* 1. 3D 모델 레이어 (아래쪽) */}
      <div className="w-full h-full relative z-0">
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 2], fov: 50 }}
        >
          <Suspense fallback={null}>
            <Stage
              environment="city"
              intensity={0.5}
              contactShadow={false}
              adjustCamera={1.3}
            >
              <MiniModel url={part.model} />
            </Stage>
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div>

      {/* 2. 모델 위를 덮는 그라데이션 오버레이 (핵심!) */}
      <div
        style={{
          background: isHovered
            ? "linear-gradient(180deg, rgba(110, 128, 142, 0.12) -21.35%, rgba(110, 128, 142, 0.60) 84.06%)"
            : "none",
        }}
        className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none"
      />

      {/* 3. 왼쪽 하단 부품 이름 (가장 위쪽) */}
      <div
        className={`
          absolute bottom-2 left-2 z-20 transition-all duration-300
          flex flex-col items-start 
          /* 💡 클릭(isSelected) 시에는 안 보이고, 마우스를 올렸을(isHovered) 때만 보이게 수정 */
          ${isHovered && !isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
        `}
        style={{ maxWidth: "85px" }}
      >
        <span
          className={`
          text-[14px] font-bold text-white pointer-events-auto tracking-tight leading-[1.2]
          text-left whitespace-pre-wrap
          /* 💡 단어 단위 줄바꿈을 강제하는 속성들 */
          [word-break:keep-all] [overflow-wrap:anywhere]
        `}
        >
          {part.name}
        </span>
      </div>
    </button>
  );
};

export default PartItem;
