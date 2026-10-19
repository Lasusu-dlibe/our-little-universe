import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneProvider, useScene } from './hooks/useScene';
import { GoldenGlitter, StarField, NebulaGlow } from './components/CosmicEffects';
import MusicButton from './components/MusicButton';
import Scene1 from './scenes/Scene1';
import Scene2 from './scenes/Scene2';
import Scene3 from './scenes/Scene3';
import Scene4 from './scenes/Scene4';

function SceneRenderer() {
  const { currentScene, transitioning } = useScene();

  return (
    <>
      {/* Global cosmic effects */}
      <GoldenGlitter count={400} />
      <StarField count={800} />
      <NebulaGlow />

      {/* Render active scene */}
      {currentScene === 1 && <Scene1 />}
      {currentScene === 2 && <Scene2 />}
      {currentScene === 3 && <Scene3 />}
      {currentScene === 4 && <Scene4 />}
    </>
  );
}

function TransitionOverlay() {
  const { transitioning } = useScene();

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-700"
      style={{
        background: '#09071F',
        opacity: transitioning ? 1 : 0,
      }}
    />
  );
}

export default function App() {
  return (
    <SceneProvider>
      <div className="w-full h-full relative" style={{ background: '#09071F' }}>
        {/* Bloom overlay */}
        <div className="bloom-overlay" />

        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={['#09071F']} />
            <fog attach="fog" args={['#09071F', 8, 25]} />
            <SceneRenderer />
          </Suspense>
        </Canvas>

        {/* Transition overlay */}
        <TransitionOverlay />

        {/* Music button */}
        <MusicButton />
      </div>
    </SceneProvider>
  );
}
