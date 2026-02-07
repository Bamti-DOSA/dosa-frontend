import React from 'react';

function AnimationDebugInfo({ currentFrame, totalFrames, isPlaying }) {
  return (
    <div className="absolute top-20 left-6 bg-black/70 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Frame: {currentFrame} / {totalFrames}</div>
      <div>Progress: {((currentFrame / totalFrames) * 100).toFixed(1)}%</div>
      <div>Status: {isPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
    </div>
  );
}

export default AnimationDebugInfo;