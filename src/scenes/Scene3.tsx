import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

// Shared state between 3D Canvas and 2D Overlay
let scene3Listeners: Array<() => void> = [];
let scene3State = {
  activated: false,
  showKey: false,
};

function useScene3Shared() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick(t => t + 1);
    scene3Listeners.push(cb);
    return () => {
      scene3Listeners = scene3Listeners.filter(l => l !== cb);
    };
  }, []);

  const triggerHeart = () => {
    if (scene3State.activated) return;
    audioManager.playSound('galaxy');
    scene3State.activated = true;
    scene3Listeners.forEach(l => l());

    setTimeout(() => {
      scene3State.showKey = true;
      scene3Listeners.forEach(l => l());
    }, 1200);
  };

  return {
    activated: scene3State.activated,
    showKey: scene3State.showKey,
    triggerHeart,
  };
}

/* Spiral galaxy particles */
function SpiralGalaxy() {
  const ref = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const count = mobile ? 1800 : 4500;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const gold = new THREE.Color('#FFE5AD');
    const pink = new THREE.Color('#FF9FCF');
    const lavender = new THREE.Color('#B99AFF');
    const palette = [gold, pink, lavender];

    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3);
      const armAngle = (arm / 3) * Math.PI * 2;
      const dist = Math.random() * 5.5;
      const angle = armAngle + dist * 0.65 + (Math.random() - 0.5) * 0.5;
      const spread = 0.35 + dist * 0.15;

      positions[i * 3] = Math.cos(angle) * dist + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * dist + (Math.random() - 0.5) * spread;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={mobile ? 0.045 : 0.035}
        transparent
        opacity={0.75}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Orbital ring around the heart */
function OrbitalRing({ radius, speed, tilt, color }: {
  radius: number; speed: number; tilt: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.01, 8, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Glowing 3D Heart with large hit area */
function GlowingHeart({ onInteract, activated }: { onInteract: () => void; activated: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.25);
    shape.bezierCurveTo(x, y + 0.25, x - 0.05, y + 0.35, x - 0.25, y + 0.35);
    shape.bezierCurveTo(x - 0.55, y + 0.35, x - 0.55, y + 0.075, x - 0.55, y + 0.075);
    shape.bezierCurveTo(x - 0.55, y - 0.1, x - 0.35, y - 0.312, x, y - 0.5);
    shape.bezierCurveTo(x + 0.35, y - 0.312, x + 0.55, y - 0.1, x + 0.55, y + 0.075);
    shape.bezierCurveTo(x + 0.55, y + 0.075, x + 0.55, y + 0.35, x + 0.25, y + 0.35);
    shape.bezierCurveTo(x + 0.1, y + 0.35, x, y + 0.25, x, y + 0.25);

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.35;
    const pulse = activated ? 1.35 + Math.sin(t * 5) * 0.15 : 1 + Math.sin(t * 1.8) * 0.08;
    meshRef.current.scale.setScalar(pulse);

    if (glowRef.current) {
      const glowScale = activated ? 2.8 : 1.5 + Math.sin(t * 2) * 0.2;
      glowRef.current.scale.setScalar(glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = activated ? 0.6 : 0.25;
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial
          color="#FF9FCF"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* 3D Heart mesh */}
      <mesh
        ref={meshRef}
        geometry={heartGeometry}
        rotation={[0, 0, Math.PI]}
        position={[0, 0.2, -0.15]}
      >
        <meshStandardMaterial
          color="#FF5B9A"
          emissive="#FF9FCF"
          emissiveIntensity={activated ? 3.5 : 1.8}
          roughness={0.2}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Generous touch hitbox for mobile and desktop */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onInteract();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onInteract();
        }}
      >
        <sphereGeometry args={[1.6, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* Golden key formation from particles */
function GoldenKey({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 350;
  const progressRef = useRef(0);

  const { positions, targets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1 + Math.random() * 3;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      if (i < count * 0.3) {
        const a = (i / (count * 0.3)) * Math.PI * 2;
        targets[i * 3] = Math.cos(a) * 0.3;
        targets[i * 3 + 1] = 0.35 + Math.sin(a) * 0.3;
        targets[i * 3 + 2] = 0;
      } else if (i < count * 0.7) {
        const t = (i - count * 0.3) / (count * 0.4);
        targets[i * 3] = 0;
        targets[i * 3 + 1] = -t * 0.9;
        targets[i * 3 + 2] = 0;
      } else {
        const t = (i - count * 0.7) / (count * 0.3);
        const tooth = Math.floor(t * 3);
        targets[i * 3] = 0.12 + Math.random() * 0.1;
        targets[i * 3 + 1] = -0.55 - tooth * 0.14;
        targets[i * 3 + 2] = 0;
      }
    }
    return { positions, targets };
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    progressRef.current = Math.min(1, progressRef.current + 0.015);
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = progressRef.current;
    const ease = t * t * (3 - 2 * t);

    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += (targets[i * 3] - posArr.array[i * 3]) * ease * 0.1;
      posArr.array[i * 3 + 1] += (targets[i * 3 + 1] - posArr.array[i * 3 + 1]) * ease * 0.1;
      posArr.array[i * 3 + 2] += (targets[i * 3 + 2] - posArr.array[i * 3 + 2]) * ease * 0.1;
    }
    posArr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFE5AD"
        size={0.045}
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* 3D Scene 3 Canvas Elements */
export function Scene3Canvas() {
  const { activated, showKey, triggerHeart } = useScene3Shared();

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 3]} intensity={1.8} color="#FF9FCF" />
      <pointLight position={[-3, -1, 2]} intensity={0.6} color="#B99AFF" />

      {/* Spiral galaxy */}
      <group position={[0, 0, -5]} rotation={[0.8, 0, 0]}>
        <SpiralGalaxy />
      </group>

      {/* Orbital rings */}
      <OrbitalRing radius={1.2} speed={0.3} tilt={0.3} color="#B99AFF" />
      <OrbitalRing radius={1.5} speed={-0.2} tilt={-0.5} color="#FF9FCF" />
      <OrbitalRing radius={1.0} speed={0.5} tilt={1.0} color="#FFE5AD" />

      {/* Central heart */}
      <GlowingHeart onInteract={triggerHeart} activated={activated} />

      {/* Golden key */}
      <GoldenKey active={showKey} />
    </group>
  );
}

/* 2D HTML UI Overlay for Scene 3 */
export function Scene3Overlay() {
  const { activated, triggerHeart } = useScene3Shared();
  const { goToScene } = useScene();

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none pointer-events-none">
      {/* Top Text */}
      <div className="text-center pt-16 sm:pt-20">
        <p className="font-display text-base sm:text-xl text-glow text-[#B99AFF] mb-1">
          {loveStory.galaxyMessages[0]}
        </p>
        <p className="font-display text-base sm:text-xl text-glow-pink text-[#FF9FCF]">
          {loveStory.galaxyMessages[1]}
        </p>
      </div>

      {/* Bottom Button / Prompt */}
      <div className="pb-10 flex flex-col items-center gap-3">
        {!activated ? (
          <button
            type="button"
            onClick={triggerHeart}
            className="btn-glow px-8 py-3.5 rounded-full text-white font-body text-base sm:text-lg cursor-pointer
                       transition-all duration-300 pointer-events-auto flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 159, 207, 0.45), rgba(185, 154, 255, 0.45))',
              border: '1px solid rgba(255, 229, 173, 0.6)',
              boxShadow: '0 0 25px rgba(255, 159, 207, 0.4)',
            }}
          >
            <span>{loveStory.galaxyPrompt}</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 animate-fade-in pointer-events-auto">
            <p className="font-display text-sm sm:text-base text-glow-gold text-[#FFE5AD]">
              ✨ Chìa khóa tình yêu đã xuất hiện! ✨
            </p>
            <button
              type="button"
              onClick={() => goToScene(4)}
              className="btn-glow px-8 py-3.5 rounded-full text-white font-body text-base sm:text-lg cursor-pointer
                         transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 229, 173, 0.7), rgba(239, 197, 168, 0.7))',
                color: '#3B1828',
                fontWeight: 700,
                border: '1px solid #FFE5AD',
                boxShadow: '0 0 30px rgba(255, 229, 173, 0.6)',
              }}
            >
              Mở bức thư tình ✉️ ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Scene3() {
  return (
    <group>
      <Scene3Canvas />
    </group>
  );
}
