import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

function AnimationDebugger({ url }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    console.log('═══════════════════════════════════');
    console.log('📦 GLB File:', url);
    console.log('═══════════════════════════════════');
    
    if (gltf.animations && gltf.animations.length > 0) {
      console.log(`🎬 Found ${gltf.animations.length} animation(s):\n`);
      
      gltf.animations.forEach((clip, index) => {
        const fps30 = Math.ceil(clip.duration * 30);
        const fps60 = Math.ceil(clip.duration * 60);
        
        console.log(`Animation ${index}: "${clip.name}"`);
        console.log(`  ⏱️  Duration: ${clip.duration.toFixed(2)}s`);
        console.log(`  📊 Frames: ${fps30} (30fps) | ${fps60} (60fps)`);
        console.log(`  🎯 Tracks: ${clip.tracks.length}`);
        
        // 각 트랙의 keyframe 정보
        clip.tracks.forEach((track, i) => {
          const keyframes = track.times.length;
          const firstTime = track.times[0];
          const lastTime = track.times[keyframes - 1];
          
          console.log(`    Track ${i}: ${track.name}`);
          console.log(`      - Keyframes: ${keyframes}`);
          console.log(`      - Range: ${firstTime.toFixed(2)}s ~ ${lastTime.toFixed(2)}s`);
          console.log(`      - Values:`, track.values.length);
        });
        
        console.log('');
      });
      
      // 다운로드 스크립트 생성
      console.log('💾 Download GLB file:');
      console.log(`
fetch('${url}')
  .then(res => res.blob())
  .then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'assembly.glb';
    a.click();
  });
      `);
      
    } else {
      console.warn('⚠️ No animations found in this GLB file');
      console.log('📦 Scene structure:', gltf.scene);
    }
    
    console.log('═══════════════════════════════════\n');
  }, [gltf, url]);

  return <primitive object={gltf.scene} />;
}

export default AnimationDebugger;
