import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AnimationPlayer({
  url,
  currentFrame,
  totalFrames,
  selectedPartMesh,
  overrideMaterial,
  onTransformUpdate,
}) {
  const gltf = useGLTF(url);
  const mixerRef = useRef(null);
  const actionsRef = useRef([]);
  const trueOriginalsRef = useRef(new Map());
  const [availableMeshes, setAvailableMeshes] = useState([]);

  // 1. 초기 로드: 원본 재질을 영구 보관하고 각 메쉬를 독립화합니다.
  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // 1. 원본 재질 보관 (이미 되어 있다면 패스)
        if (!trueOriginalsRef.current.has(child)) {
          trueOriginalsRef.current.set(child, child.material.clone());
        }

        // 2. ✨ 핵심: 각 mesh에게 고유한 material 객체를 새로 할당
        // 이렇게 해야 한 놈을 색칠할 때 다른 놈이 안 변합니다.
        child.material = child.material.clone();

        // 만약 재질이 배열(Multi-material)인 경우를 대비한 안전장치
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => m.clone());
        }
      }
    });

    // 애니메이션 설정
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixerRef.current = mixer;
      actionsRef.current = gltf.animations.map((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
        action.paused = true;
        return action;
      });
    }

    return () => {
      if (mixerRef.current) mixerRef.current.stopAllAction();
    };
  }, [gltf]);

  const applyDefaultGrey = (mat) => {
    mat.color.set("#bbbbbb");
    mat.emissive.set("#000000");
    mat.emissiveIntensity = 0;
    mat.metalness = 0;
    mat.roughness = 0.8;
    mat.map = null;
    mat.normalMap = null;
  };

  const applyBlueHighlight = (mat) => {
    mat.color.set("#aaddff");
    mat.emissive.set("#4ba3ff");
    mat.emissiveIntensity = 0.8;
    mat.metalness = 0.5;
    mat.roughness = 0.2;
  };

  const applyPropsToMaterial = (mat, props) => {
    if (props.color) mat.color.set(props.color);
    if (props.metalness !== undefined) mat.metalness = props.metalness;
    if (props.roughness !== undefined) mat.roughness = props.roughness;
    mat.emissive.set("#000000");
    mat.emissiveIntensity = 0;
  };

  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // 1. 상태 파악
        const isAssemblyMode =
          !selectedPartMesh || selectedPartMesh === "assembly";
        const isTarget = isAssemblyMode
          ? true
          : isNameMatch(child.name, selectedPartMesh);

        // 2. 재질 적용 로직 세분화
        if (isTarget) {
          if (overrideMaterial) {
            // 재질이 선택된 경우 (카본, 알루미늄 등 적용)
            applyPropsToMaterial(child.material, overrideMaterial);
          } else {
            // 기본 재질(null)을 선택했을 때
            if (isAssemblyMode) {
              // 전체 모드라면 하이라이트 없이 기본 회색으로!
              applyDefaultGrey(child.material);
            } else {
              // 특정 부품 선택 모드라면 파란색으로 하이라이트!
              applyBlueHighlight(child.material);
            }
          }
        } else {
          // 선택되지 않은 부품은 회색 처리
          applyDefaultGrey(child.material);
        }
        child.material.needsUpdate = true;
      }
    });
  }, [selectedPartMesh, overrideMaterial, gltf.scene]);

  // 3. 애니메이션 프레임 제어 + 위치 업데이트
 useEffect(() => {
    if (!mixerRef.current || actionsRef.current.length === 0) return;

    // ... (애니메이션 시간 업데이트 로직 기존 유지) ...
    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));
    actionsRef.current.forEach((action) => {
      const clip = action.getClip();
      action.time = normalizedTime * clip.duration;
      action.paused = true;
    });
    mixerRef.current.update(0);

    // Transform 데이터 추출 로직
    if (onTransformUpdate && currentFrame > 0) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.updateMatrixWorld(true);
          
          // 1. Position (World Position) - 기존 유지
          const box = new THREE.Box3().setFromObject(child);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // 2. Rotation (World Rotation)
          const worldQuaternion = new THREE.Quaternion();
          child.getWorldQuaternion(worldQuaternion);
          
          const worldEuler = new THREE.Euler();
          worldEuler.setFromQuaternion(worldQuaternion); // 쿼터니언 -> 오일러 각도 변환

          const rotation = { 
            x: worldEuler.x, 
            y: worldEuler.y, 
            z: worldEuler.z 
          };

          // 3. Scale (World Scale) 
          const worldScale = new THREE.Vector3();
          child.getWorldScale(worldScale);

          const scale = { 
            x: worldScale.x, 
            y: worldScale.y, 
            z: worldScale.z 
          };

          // 콜백으로 데이터 전달
          onTransformUpdate(child.name, {
            position: { x: center.x, y: center.y, z: center.z },
            rotation: rotation,
            scale: scale
          });
        }
      });
    }
  }, [currentFrame, totalFrames, onTransformUpdate, gltf.scene]);

  // 이름 매칭 로직
  const isNameMatch = (meshName, searchName) => {
    if (!meshName || !searchName) return false;

    // 소문자로 바꾸고 공백/기호만 제거 (숫자는 유지!)
    const clean = (s) => s.toLowerCase().replace(/[-_\s.]/g, "");

    const cleanedMesh = clean(meshName); // 예: part_3_1 -> part31
    const cleanedSearch = clean(searchName); // 예: part_3 -> part3

    // 1. 이름이 완전히 같거나
    // 2. meshName이 searchName으로 시작하는 경우 (예: part31은 part3에 포함됨)
    return (
      cleanedMesh === cleanedSearch || cleanedMesh.startsWith(cleanedSearch)
    );
  };
  // 4. 모델 렌더링
  return <primitive object={gltf.scene} />;
}

export default AnimationPlayer;
