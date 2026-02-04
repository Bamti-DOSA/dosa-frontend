import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function MiniModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}

const PartItem = ({ part, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(part.id)}
      style={{
        width: "97px",
        height: "97px",
        borderRadius: "8px",
        borderWidth: "0.92px",
        /* 1. 배경에 투명 체크무늬 이미지 적용 */
        backgroundImage: `url('/public/images/transparent_bg.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={`
        flex-shrink-0 
        overflow-hidden 
        transition-all 
        flex items-center justify-center
        ${
          isSelected
            ? "border-green-500 shadow-md" // 선택 시 살짝 강조
            : "border-gray-200"
        }
      `}
    >
      <div className="w-full h-full relative">
        {/* 2. Canvas의 alpha 설정을 true로 하여 배경을 투명하게 만듦 */}
        <Canvas
          shadows={false}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 2], fov: 50 }}
        >
          <Suspense fallback={null}>
            {/* contactShadow={false}로 설정하여 바닥 그림자가 체크무늬를 가리지 않게 함 */}
            <Stage environment="city" intensity={0.5} contactShadow={false}>
              <MiniModel url={part.model} />
            </Stage>
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
          />
        </Canvas>
      </div>
    </button>
  );
};

export default PartItem;
