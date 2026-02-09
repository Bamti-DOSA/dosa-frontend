import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function AnimationPlayer({
  url,
  currentFrame,
  totalFrames,
  selectedPartMesh,
  overrideMaterial,
  onPositionUpdate,
}) {
  const gltf = useGLTF(url);
  const mixerRef = useRef(null);
  const actionsRef = useRef([]);
  const trueOriginalsRef = useRef(new Map());
  const [availableMeshes, setAvailableMeshes] = useState([]);

  // 1. 초기 로드: 원본 재질을 영구 보관하고 각 메쉬를 독립화합니다.
  useEffect(() => {
    if (!gltf.scene) return;

    const meshNames = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push(child.name);

        if (!trueOriginalsRef.current.has(child)) {
          trueOriginalsRef.current.set(child, child.material.clone());
        }

        child.material = child.material.clone();
      }
    });
    setAvailableMeshes(meshNames);

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

  // --- 메인 로직 ---
  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const isTarget = selectedPartMesh
          ? isNameMatch(child.name, selectedPartMesh)
          : false;

        if (selectedPartMesh) {
          if (isTarget) {
            if (overrideMaterial) {
              applyPropsToMaterial(child.material, overrideMaterial);
            } else {
              applyBlueHighlight(child.material);
            }
          } else {
            applyDefaultGrey(child.material);
          }
        } else {
          if (overrideMaterial) {
            applyPropsToMaterial(child.material, overrideMaterial);
          } else {
            applyDefaultGrey(child.material);
          }
        }
        child.material.needsUpdate = true;
      }
    });
  }, [selectedPartMesh, overrideMaterial, gltf.scene]);

  // 3. 애니메이션 프레임 제어 + ✅ 4단계: 위치 업데이트
  useEffect(() => {
    if (!mixerRef.current || actionsRef.current.length === 0) return;

    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));
    actionsRef.current.forEach((action) => {
      const clip = action.getClip();
      action.time = normalizedTime * clip.duration;
      action.paused = true;
    });
    mixerRef.current.update(0);

    // ✅ 4단계: 애니메이션 후 모든 메쉬의 중심 좌표 계산 및 콜백 호출
    if (onPositionUpdate && currentFrame > 0) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // 각 메쉬의 월드 위치에서 Bounding Box 중심 계산
          child.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(child);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // 콜백으로 메쉬 이름과 중심 좌표 전달
          onPositionUpdate(child.name, {
            x: center.x,
            y: center.y,
            z: center.z,
          });
        }
      });
    }
  }, [currentFrame, totalFrames, onPositionUpdate, gltf.scene]);

  // 이름 매칭 로직
  const isNameMatch = (meshName, searchName) => {
    if (!meshName || !searchName) return false;
    const clean = (s) =>
      s
        .toLowerCase()
        .replace(/[-_\s.]/g, "")
        .replace(/\d+$/, "");
    return clean(meshName) === clean(searchName);
  };

  // 4. 모델 렌더링
  return <primitive object={gltf.scene} />;
}

export default AnimationPlayer;
