import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AnimationPlayer({ url, currentFrame, totalFrames, selectedPartMesh }) {
  const gltf = useGLTF(url);
  const mixerRef = useRef(null);
  const actionsRef = useRef([]);
  const highlightedMeshRef = useRef(null);
  const originalMaterialsRef = useRef(new Map());
  const [availableMeshes, setAvailableMeshes] = useState([]);

  useEffect(() => {
    if (!gltf.animations || gltf.animations.length === 0) {
      return;
    }

    const meshNames = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        meshNames.push(child.name);
      }
    });
    setAvailableMeshes(meshNames);

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    const actions = [];
    
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();
      action.paused = true;
      action.time = 0;
      actions.push(action);
    });

    actionsRef.current = actions;

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
    };
  }, [gltf]);

  useEffect(() => {
    if (!mixerRef.current || actionsRef.current.length === 0) return;

    const normalizedTime = Math.max(0, Math.min(1, currentFrame / totalFrames));

    actionsRef.current.forEach((action) => {
      const clip = action.getClip();
      const targetTime = normalizedTime * clip.duration;
      const clampedTime = Math.min(targetTime, clip.duration - 0.001);

      action.time = clampedTime;
      action.paused = true;
    });

    mixerRef.current.update(0);

  }, [currentFrame, totalFrames]);

  useEffect(() => {
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