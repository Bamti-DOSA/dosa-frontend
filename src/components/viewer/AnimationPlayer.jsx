import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function AnimationPlayer({
  url,
  currentFrame,
  totalFrames,
  selectedPartMesh,
  overrideMaterial,
}) {
  const gltf = useGLTF(url);
  const mixerRef = useRef(null);
  const actionsRef = useRef([]);
  const highlightedMeshRef = useRef(null);
  const originalMaterialsRef = useRef(new Map());
  const [availableMeshes, setAvailableMeshes] = useState([]);

  // 1. 초기 로드: 모든 메쉬의 재질을 독립적으로 클론
  useEffect(() => {
    if (!gltf.scene) return;

    const meshNames = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push(child.name);
        // 다른 메쉬에 영향 주지 않도록 재질 독립화
        child.material = child.material.clone();
      }
    });
    setAvailableMeshes(meshNames);

    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixerRef.current = mixer;
      actionsRef.current = gltf.animations.map((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();
        action.paused = true;
        return action;
      });
    }

    return () => {
      if (mixerRef.current) mixerRef.current.stopAllAction();
    };
  }, [gltf]);

  // ✨ 2. 재질 변경 로직: 강조 상태를 고려하여 덮어쓰기
  useEffect(() => {
    if (!overrideMaterial) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // 강조 해제 시 돌아갈 '원본' 데이터를 먼저 업데이트
        if (originalMaterialsRef.current.has(child)) {
          const storedMat = originalMaterialsRef.current.get(child);
          applyPropsToMaterial(storedMat, overrideMaterial);
        }

        // 현재 강조 중인 부품이 아닐 때만 화면에 즉시 반영
        if (highlightedMeshRef.current !== child) {
          applyPropsToMaterial(child.material, overrideMaterial);
        }
      }
    });
  }, [overrideMaterial, gltf.scene]);

  // 재질 속성 적용 헬퍼 함수
  const applyPropsToMaterial = (mat, props) => {
    if (props.color) mat.color.set(props.color);
    if (props.metalness !== undefined) mat.metalness = props.metalness;
    if (props.roughness !== undefined) mat.roughness = props.roughness;
    mat.needsUpdate = true;
  };

  // 3. 애니메이션 제어 (기존 유지)
  useEffect(() => {
    if (!mixerRef.current || actionsRef.current.length === 0) return;
    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));
    actionsRef.current.forEach((action) => {
      action.time = normalizedTime * action.getClip().duration;
    });
    mixerRef.current.update(0);
  }, [currentFrame, totalFrames]);

  // ✨ 4. 부품 강조 로직: 재질 변경 시에도 재실행되도록 의존성 추가
  useEffect(() => {
    // 이전 강조 해제 및 복구
    if (
      highlightedMeshRef.current &&
      originalMaterialsRef.current.has(highlightedMeshRef.current)
    ) {
      highlightedMeshRef.current.material = originalMaterialsRef.current.get(
        highlightedMeshRef.current,
      );
      highlightedMeshRef.current = null;
    }

    if (!selectedPartMesh) return;

    let targetMesh = null;
    gltf.scene.traverse((child) => {
      if (child.isMesh && isNameMatch(child.name, selectedPartMesh)) {
        targetMesh = child;
      }
    });

    if (targetMesh) {
      // 강조 전 현재(바뀐 재질 포함) 상태를 원본으로 저장
      originalMaterialsRef.current.set(targetMesh, targetMesh.material.clone());

      // 강조 재질 적용 (최우선순위)
      const highlightMaterial = targetMesh.material.clone();
      highlightMaterial.emissive = new THREE.Color(0x4ba3ff);
      highlightMaterial.emissiveIntensity = 0.8;
      highlightMaterial.color = new THREE.Color(0xaaddff);

      targetMesh.material = highlightMaterial;
      highlightedMeshRef.current = targetMesh;
    }
  }, [selectedPartMesh, gltf.scene, overrideMaterial]); // overrideMaterial이 바뀌어도 강조 재적용

  // 이름 매칭 로직 (더 정교하게 개선)
  const isNameMatch = (meshName, searchName) => {
    const clean = (s) =>
      s
        .toLowerCase()
        .replace(/[-_\s.]/g, "")
        .replace(/\d+$/, "");
    const target = clean(meshName);
    const search = clean(searchName);
    return (
      target === search || target.includes(search) || search.includes(target)
    );
  };

  return <primitive object={gltf.scene} />;
}

export default AnimationPlayer;
