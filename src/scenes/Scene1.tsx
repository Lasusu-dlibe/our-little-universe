import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

/* Animated cosmic portal ring */
function PortalRing({ radius, speed, color, width = 0.03 }: {
  radius: number; speed: number; color: string; width?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
    const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, width, 16, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Portal particles swirling around the center */
function PortalParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = isMobile() ? 250 : 600;

  const { positions, angles, radii, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 0.4 + Math.random() * 1.8;
      speeds[i] = 0.6 + Math.random() * 2;
      positions[i * 3] = Math.cos(angles[i]) * radii[i];
      positions[i * 3 + 1] = Math.sin(angles[i]) * radii[i];
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return { positions, angles, radii, speeds };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const a = angles[i] + t * speeds[i];
      const r = active ? radii[i] * 0.2 : radii[i];
      posArr.array[i * 3] = Math.cos(a) * r;
      posArr.array[i * 3 + 1] = Math.sin(a) * r;
    }
    posArr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FF9FCF"
        size={0.035}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Portal center glow */
function PortalGlow({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const baseOpacity = active ? 0.6 : 0.2;
    mat.opacity = baseOpacity + Math.sin(t * 3) * 0.05;
    const s = active ? 3.0 : 1.3 + Math.sin(t * 1.5) * 0.2;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        color="#B99AFF"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* 3D Scene1 Canvas Elements */
export function Scene1Canvas() {
  return (
    <group position={[0, 0, -3]}>
      <PortalRing radius={1.8} speed={0.3} color="#B99AFF" width={0.025} />
      <PortalRing radius={1.5} speed={-0.5} color="#FF9FCF" width={0.02} />
      <PortalRing radius={1.2} speed={0.7} color="#FFE5AD" width={0.015} />
      <PortalParticles active={false} />
      <PortalGlow active={false} />
    </group>
  );
}

/* 2D HTML UI Overlay for Scene 1 */
export function Scene1Overlay() {
  const { goToScene } = useScene();

  const handleStart = () => {
    audioManager.playSound('portal');
    goToScene(2);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 select-none">
      <div className="text-center max-w-lg mx-auto mb-8">
        <p className="font-display text-xl sm:text-2xl md:text-3xl text-glow mb-4 text-[#B99AFF]"
           style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
          {loveStory.introMessages[0]}
        </p>
        <p className="font-display text-lg sm:text-xl md:text-2xl text-glow-pink text-[#FF9FCF]"
           style={{ animation: 'fadeInUp 0.8s ease 0.4s forwards' }}>
          {loveStory.introMessages[1]}
        </p>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="btn-glow px-8 py-3.5 rounded-full text-white font-body text-base sm:text-lg cursor-pointer
                   transition-all duration-300 pointer-events-auto flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(185, 154, 255, 0.4), rgba(255, 159, 207, 0.4))',
          border: '1px solid rgba(255, 229, 173, 0.6)',
          boxShadow: '0 0 25px rgba(255, 229, 173, 0.4)',
          animation: 'fadeInUp 0.8s ease 0.6s forwards',
        }}
      >
        <span>{loveStory.portalButtonText}</span>
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Scene1() {
  return (
    <group>
      <Scene1Canvas />
    </group>
  );
}
