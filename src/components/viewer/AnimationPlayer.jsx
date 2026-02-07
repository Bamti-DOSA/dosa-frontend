import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AnimationPlayer({ url, currentFrame, totalFrames, selectedPartMesh }) {
  const gltf = useGLTF(url);
  const mixerRef = useRef(null);
  const actionRef = useRef(null);
  const highlightedMeshRef = useRef(null);
  const originalMaterialsRef = useRef(new Map());
  const [availableMeshes, setAvailableMeshes] = useState([]);

  // 초기 설정
  useEffect(() => {
    if (!gltf.animations || gltf.animations.length === 0) {
      console.warn('⚠️ No animations found');
      return;
    }

    const clip = gltf.animations[0];

    // 모든 메쉬 이름 수집
    const meshNames = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push(child.name);
      }
    });
    setAvailableMeshes(meshNames);

    // Mixer 생성
    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    const action = mixer.clipAction(clip);
    actionRef.current = action;

    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
    action.paused = true;

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
    };
  }, [gltf]);

  // 👇 프레임 변경만 처리 (재생 관련 제거)
  useEffect(() => {
    if (!mixerRef.current || !actionRef.current || !gltf.animations[0]) return;

    const clip = gltf.animations[0];
    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));
    const targetTime = normalizedTime * clip.duration;
    const clampedTime = Math.min(targetTime, clip.duration - 0.001);

    actionRef.current.time = clampedTime;
    actionRef.current.paused = true;

    // 강제 업데이트
    mixerRef.current.update(0);

  }, [currentFrame, totalFrames, gltf.animations]);

  // 하이라이트 효과
  useEffect(() => {
    // 이전 하이라이트 제거
    if (highlightedMeshRef.current && originalMaterialsRef.current.has(highlightedMeshRef.current)) {
      const originalMaterial = originalMaterialsRef.current.get(highlightedMeshRef.current);
      highlightedMeshRef.current.material = originalMaterial;
      highlightedMeshRef.current = null;
    }

    if (!selectedPartMesh) return;

    let targetMesh = null;
    const meshList = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) meshList.push(child);
    });

    // 매칭 전략들
    targetMesh = meshList.find(child => child.name === selectedPartMesh);

    if (!targetMesh) {
      targetMesh = meshList.find(child => 
        child.name.toLowerCase() === selectedPartMesh.toLowerCase()
      );
    }

    if (!targetMesh) {
      targetMesh = meshList.find(child => {
        const childBase = child.name.replace(/\.\d+$/, '');
        return childBase === selectedPartMesh;
      });
    }

    if (!targetMesh) {
      const searchClean = selectedPartMesh.toLowerCase().replace(/[-_\s]/g, '');
      targetMesh = meshList.find(child => {
        const childClean = child.name.toLowerCase().replace(/[-_\s]/g, '').replace(/\.\d+$/, '');
        return childClean === searchClean;
      });
    }

    if (!targetMesh) {
      const searchClean = selectedPartMesh.toLowerCase().replace(/[-_\s]/g, '');
      targetMesh = meshList.find(child => {
        const childClean = child.name.toLowerCase().replace(/[-_\s]/g, '').replace(/\.\d+$/, '');
        return childClean.startsWith(searchClean) && childClean !== searchClean;
      });
    }

    if (targetMesh) {
      console.log('✨ Highlighting:', targetMesh.name);

      if (!originalMaterialsRef.current.has(targetMesh)) {
        originalMaterialsRef.current.set(targetMesh, targetMesh.material.clone());
      }

      const highlightMaterial = targetMesh.material.clone();
      highlightMaterial.emissive = new THREE.Color(0x4BA3FF);
      highlightMaterial.emissiveIntensity = 0.6;
      highlightMaterial.color = new THREE.Color(0xAADDFF);
      
      targetMesh.material = highlightMaterial;
      highlightedMeshRef.current = targetMesh;
    }

  }, [selectedPartMesh, gltf.scene, availableMeshes]);

  return <primitive object={gltf.scene} />;
}

export default AnimationPlayer;