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
      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-white/50 ${
        isSelected ? "border-blue-500 scale-105" : "border-transparent"
      }`}
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
