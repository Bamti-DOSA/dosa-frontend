import React, { useRef, useEffect } from "react";
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
  const trueOriginalsRef = useRef(new Map()); // 모델의 순수 백지 상태 보관

  // 1. 초기 로드: 원본 재질 보관 및 클론
  useEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (!trueOriginalsRef.current.has(child)) {
          trueOriginalsRef.current.set(child, child.material.clone());
        }
        child.material = child.material.clone();
      }
    });
    // 애니메이션 믹서 설정 생략 (기존과 동일)
  }, [gltf]);

  // 하이라이트(파란색) 적용 함수
  const applyBlueHighlight = (mat) => {
    mat.color.set(0xaaddff);
    mat.emissive.set(0x4ba3ff);
    mat.emissiveIntensity = 0.8;
    mat.metalness = 0.5;
    mat.roughness = 0.2;
  };

  // 재질 속성 적용 함수 (하이라이트 해제 필수)
  const applyPropsToMaterial = (mat, props, isHighlight) => {
    if (props.color) mat.color.set(props.color);
    if (props.metalness !== undefined) mat.metalness = props.metalness;
    if (props.roughness !== undefined) mat.roughness = props.roughness;
    // 재질 적용 시 파란색 광택(emissive)을 제거합니다.
    mat.emissive.set(0x000000);
    mat.emissiveIntensity = 0;
  };

  // ✨ 2. 통합 렌더링 로직: 백지 -> 파란색 -> 재질
  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const isTarget = selectedPartMesh
          ? isNameMatch(child.name, selectedPartMesh)
          : false;
        const originalMat = trueOriginalsRef.current.get(child);

        // A. 부품이 선택된 상태 (selectedPartMesh가 있을 때)
        if (selectedPartMesh) {
          if (isTarget) {
            if (overrideMaterial) {
              // 단계 3: 재질 적용 (파란색 하이라이트 -> 재질)
              applyPropsToMaterial(child.material, overrideMaterial, false);
            } else {
              // 단계 2: 파란색 하이라이트 (백지 -> 파란색)
              applyBlueHighlight(child.material);
            }
          } else {
            // 단계 1: 백지 (나머지는 기본 재질로 초기화)
            if (originalMat) child.material.copy(originalMat);
          }
        }
        // B. 전체 모델 모드 (Assembly)
        else {
          if (overrideMaterial) {
            // 전체 재질 적용 모드
            applyPropsToMaterial(child.material, overrideMaterial, false);
          } else {
            // 전체 초기화 (백지 상태)
            if (originalMat) child.material.copy(originalMat);
          }
        }
        child.material.needsUpdate = true;
      }
    });
  }, [selectedPartMesh, overrideMaterial, gltf.scene]);

  const isNameMatch = (meshName, searchName) => {
    const clean = (s) =>
      s
        .toLowerCase()
        .replace(/[-_\s.]/g, "")
        .replace(/\d+$/, "");
    return clean(meshName) === clean(searchName);
  };

  // 애니메이션 프레임 제어 (기존 로직 유지)
  useEffect(() => {
    if (!mixerRef.current || actionsRef.current.length === 0) return;
    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));
    actionsRef.current.forEach((action) => {
      action.time = normalizedTime * action.getClip().duration;
    });
    mixerRef.current.update(0);
  }, [currentFrame, totalFrames]);

  return <primitive object={gltf.scene} />;
}

export default AnimationPlayer;
