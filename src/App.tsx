import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneProvider, useScene } from './hooks/useScene';
import { GoldenGlitter, StarField, NebulaGlow } from './components/CosmicEffects';
import MusicButton from './components/MusicButton';
import { Scene1Canvas, Scene1Overlay } from './scenes/Scene1';
import { Scene2Canvas, Scene2Overlay } from './scenes/Scene2';
import { Scene3Canvas, Scene3Overlay } from './scenes/Scene3';
import { Scene4Canvas, Scene4Overlay } from './scenes/Scene4';

/* 3D Scene Switcher inside Canvas */
function Scene3D() {
  const { currentScene } = useScene();

  return (
    <>
      {/* Global cosmic environment */}
      <GoldenGlitter count={350} />
      <StarField count={800} />
      <NebulaGlow />

      {/* Render 3D elements for current scene */}
      {currentScene === 1 && <Scene1Canvas />}
      {currentScene === 2 && <Scene2Canvas />}
      {currentScene === 3 && <Scene3Canvas />}
      {currentScene === 4 && <Scene4Canvas />}
    </>
  );
}

/* 2D Interactive UI Layer outside Canvas for 100% reliable clicks & mobile touches */
function SceneUI() {
  const { currentScene } = useScene();

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {currentScene === 1 && <Scene1Overlay />}
      {currentScene === 2 && <Scene2Overlay />}
      {currentScene === 3 && <Scene3Overlay />}
      {currentScene === 4 && <Scene4Overlay />}
    </div>
  );
}

/* Smooth cosmic transition fade overlay */
function TransitionOverlay() {
  const { transitioning } = useScene();

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300"
      style={{
        background: '#09071F',
        opacity: transitioning ? 0.95 : 0,
      }}
    />
  );
}

function MainExperience() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#09071F]">
      {/* Soft ambient bloom */}
      <div className="bloom-overlay" />

      {/* 3D Canvas Layer */}
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
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#09071F']} />
          <fog attach="fog" args={['#09071F', 8, 25]} />
          <Scene3D />
        </Suspense>
      </Canvas>

      {/* 2D Interactive UI Layer */}
      <SceneUI />

      {/* Music Control */}
      <MusicButton />

      {/* Transition Fade */}
      <TransitionOverlay />
    </div>
  );
}

export default function App() {
  return (
    <SceneProvider>
      <MainExperience />
    </SceneProvider>
  );
}
