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
        width: "97px", // 피그마 수치 반영
        height: "97px", // 피그마 수치 반영
        borderRadius: "8px", // 피그마 수치 반영
        borderWidth: "0.92px", // 피그마 수치 반영
        opacity: 1, // 피그마 수치 반영
        transform: "rotate(0deg)", // angle: 0 deg 반영
      }}
      className={`
        flex-shrink-0           /* 크기 고정 */
        overflow-hidden 
        transition-all 
        flex items-center justify-center
        ${
          isSelected
            ? "border-blue-500 bg-white shadow-md"
            : "border-gray-200 bg-white/50"
        }
      `}
    >
      <div className="w-full h-full">
        {/* 작은 3D 렌더링 영역 */}
        <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} contactShadow={false}>
              <MiniModel url={part.model} />
            </Stage>
          </Suspense>
          {/* 리스트에서는 사용자가 못 돌리게 하려면 OrbitControls를 빼거나 enableZoom={false} 처리 */}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
    </button>
  );
};

export default PartItem;
