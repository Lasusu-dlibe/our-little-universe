import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

interface Scene2State {
  collected: boolean[];
  activeMessage: number | null;
  collectStar: (index: number) => void;
  showNameReveal: boolean;
}

// Shared hook for scene 2 state between Canvas and Overlay
let scene2StateListeners: Array<() => void> = [];
let scene2GlobalState: {
  collected: boolean[];
  activeMessage: number | null;
  showNameReveal: boolean;
} = {
  collected: [false, false, false, false, false],
  activeMessage: null,
  showNameReveal: false,
};

function useScene2Shared(): Scene2State {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick(t => t + 1);
    scene2StateListeners.push(cb);
    return () => {
      scene2StateListeners = scene2StateListeners.filter(l => l !== cb);
    };
  }, []);

  const collectStar = (index: number) => {
    if (scene2GlobalState.collected[index]) return;
    audioManager.playSound('star');
    const newCollected = [...scene2GlobalState.collected];
    newCollected[index] = true;
    scene2GlobalState.collected = newCollected;
    scene2GlobalState.activeMessage = index;

    if (newCollected.every(Boolean)) {
      setTimeout(() => {
        scene2GlobalState.showNameReveal = true;
        scene2StateListeners.forEach(l => l());
      }, 1000);
    }
    scene2StateListeners.forEach(l => l());

    setTimeout(() => {
      if (scene2GlobalState.activeMessage === index) {
        scene2GlobalState.activeMessage = null;
        scene2StateListeners.forEach(l => l());
      }
    }, 4000);
  };

  return {
    collected: scene2GlobalState.collected,
    activeMessage: scene2GlobalState.activeMessage,
    collectStar,
    showNameReveal: scene2GlobalState.showNameReveal,
  };
}

/* Interactive collectible star */
function CollectibleStar({
  position,
  index,
  collected,
  onCollect,
}: {
  position: [number, number, number];
  index: number;
  collected: boolean;
  onCollect: (index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || collected) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.6 + index;
    meshRef.current.rotation.z = Math.sin(t * 0.4 + index * 2) * 0.25;
    meshRef.current.position.y = position[1] + Math.sin(t * 1.5 + index * 1.5) * 0.2;

    if (glowRef.current) {
      const s = 1.2 + Math.sin(t * 2 + index) * 0.2;
      glowRef.current.scale.setScalar(s);
    }
  });

  if (collected) return null;

  const colors = ['#FFE5AD', '#FF9FCF', '#B99AFF', '#EFC5A8', '#FFE5AD'];

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color={colors[index]}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Star visual body */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={colors[index]}
          emissive={colors[index]}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* Invisible larger hit area for easy touch on mobile */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onCollect(index);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onCollect(index);
        }}
      >
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* Particle name reveal component */
function ParticleNameReveal({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const particleCount = mobile ? 1800 : 4000;
  const progressRef = useRef(0);
  const targetPositions = useRef<Float32Array>(new Float32Array(particleCount * 3));
  const initialized = useRef(false);

  useEffect(() => {
    if (!active || initialized.current) return;
    initialized.current = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const fontSize = mobile ? 26 : 46;
    canvas.width = mobile ? 360 : 760;
    canvas.height = mobile ? 120 : 100;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px 'Playfair Display', 'Quicksand', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const name = loveStory.girlfriendName;
    if (mobile) {
      const parts = name.split(' ');
      const mid = Math.ceil(parts.length / 2);
      const line1 = parts.slice(0, mid).join(' ');
      const line2 = parts.slice(mid).join(' ');
      ctx.font = `bold ${fontSize * 0.85}px 'Playfair Display', Arial, sans-serif`;
      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - fontSize * 0.55);
      ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + fontSize * 0.55);
    } else {
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const validPositions: [number, number][] = [];

    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        if (imageData.data[idx] > 128) {
          validPositions.push([x, y]);
        }
      }
    }

    const scaleX = mobile ? 5.5 : 7.5;
    const scaleY = mobile ? 2.2 : 1.8;

    for (let i = 0; i < particleCount; i++) {
      if (validPositions.length > 0) {
        const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
        targetPositions.current[i * 3] = (pos[0] / canvas.width - 0.5) * scaleX;
        targetPositions.current[i * 3 + 1] = -(pos[1] / canvas.height - 0.5) * scaleY;
        targetPositions.current[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      } else {
        targetPositions.current[i * 3] = (Math.random() - 0.5) * 4;
        targetPositions.current[i * 3 + 1] = (Math.random() - 0.5) * 2;
        targetPositions.current[i * 3 + 2] = 0;
      }
    }
  }, [active, mobile, particleCount]);

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 4;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  }, [particleCount]);

  const colors = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    const goldColor = new THREE.Color('#FFE5AD');
    const pinkColor = new THREE.Color('#FF9FCF');
    for (let i = 0; i < particleCount; i++) {
      const c = Math.random() > 0.4 ? goldColor : pinkColor;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current || !active) return;
    const posArr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

    progressRef.current = Math.min(1, progressRef.current + 0.01);
    const t = progressRef.current;
    const ease = t * t * (3 - 2 * t);

    for (let i = 0; i < particleCount; i++) {
      posArr.array[i * 3] += (targetPositions.current[i * 3] - posArr.array[i * 3]) * ease * 0.07;
      posArr.array[i * 3 + 1] += (targetPositions.current[i * 3 + 1] - posArr.array[i * 3 + 1]) * ease * 0.07;
      posArr.array[i * 3 + 2] += (targetPositions.current[i * 3 + 2] - posArr.array[i * 3 + 2]) * ease * 0.07;
    }
    posArr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={mobile ? 0.028 : 0.022}
        transparent
        opacity={0.95}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* 3D Scene 2 Canvas Elements */
export function Scene2Canvas() {
  const { collected, collectStar, showNameReveal } = useScene2Shared();

  const starPositions: [number, number, number][] = useMemo(() => {
    const mobile = isMobile();
    const spread = mobile ? 1.8 : 2.8;
    return [
      [-spread, 1.2, -2],
      [spread, 0.9, -2.5],
      [-spread * 0.7, -1, -2.2],
      [spread * 0.7, -1.2, -2],
      [0, 1.8, -3],
    ];
  }, []);

  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2, 2]} intensity={1.5} color="#FFE5AD" />

      {!showNameReveal && starPositions.map((pos, i) => (
        <CollectibleStar
          key={i}
          position={pos}
          index={i}
          collected={collected[i]}
          onCollect={collectStar}
        />
      ))}

      <ParticleNameReveal active={showNameReveal} />
    </group>
  );
}

/* 2D HTML UI Overlay for Scene 2 */
export function Scene2Overlay() {
  const { collected, activeMessage, collectStar, showNameReveal } = useScene2Shared();
  const { goToScene } = useScene();
  const allCollected = collected.every(Boolean);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 select-none pointer-events-none">
      {/* Top Header / Instructions */}
      <div className="text-center pt-16 sm:pt-20">
        {!showNameReveal ? (
          <div>
            <p className="font-display text-base sm:text-lg text-glow text-[#B99AFF] mb-1">
              {loveStory.starIntro[0]}
            </p>
            <p className="font-display text-sm sm:text-base text-glow-pink text-[#FF9FCF]">
              {loveStory.starIntro[1]}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="font-display text-sm sm:text-base text-glow-gold text-[#FFE5AD]">
              ✨ Ngôi sao sáng nhất trong vũ trụ của anh ✨
            </p>
            <h1 className="font-display text-2xl sm:text-4xl text-glow-gold text-[#FFE5AD] mt-2 font-bold tracking-wider">
              {loveStory.girlfriendName}
            </h1>
          </div>
        )}
      </div>

      {/* Middle Active Romantic Message Toast */}
      {activeMessage !== null && (
        <div className="self-center max-w-sm sm:max-w-md mx-auto text-center px-6 py-4 rounded-2xl pointer-events-auto"
             style={{
               background: 'rgba(9, 7, 31, 0.9)',
               border: '1px solid rgba(255, 229, 173, 0.4)',
               boxShadow: '0 0 30px rgba(255, 229, 173, 0.3)',
               animation: 'fadeInUp 0.4s ease forwards',
             }}>
          <p className="font-display text-base sm:text-lg text-glow-gold text-[#FFE5AD] leading-relaxed">
            "{loveStory.starMessages[activeMessage]}"
          </p>
        </div>
      )}

      {/* Bottom Bar: Interactive Stars List + Next Scene Button */}
      <div className="pb-8 flex flex-col items-center gap-4">
        {/* 5 Star Buttons for Easy Touch */}
        {!showNameReveal && (
          <div className="flex items-center gap-3 bg-[rgba(9,7,31,0.7)] px-4 py-2 rounded-full border border-[rgba(255,229,173,0.3)] pointer-events-auto backdrop-blur-md">
            {collected.map((isDone, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => collectStar(idx)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 cursor-pointer active:scale-90"
                style={{
                  background: isDone
                    ? 'radial-gradient(circle, #FFE5AD 0%, #EFC5A8 100%)'
                    : 'rgba(185, 154, 255, 0.15)',
                  border: isDone ? '1px solid #FFE5AD' : '1px solid rgba(185, 154, 255, 0.3)',
                  boxShadow: isDone ? '0 0 15px rgba(255, 229, 173, 0.6)' : 'none',
                  filter: isDone ? 'none' : 'grayscale(1)',
                  opacity: isDone ? 1 : 0.6,
                }}
                title={`Điều thứ ${idx + 1}`}
              >
                ⭐
              </button>
            ))}
          </div>
        )}

        {/* Transition Button to Scene 3 */}
        {allCollected && (
          <button
            type="button"
            onClick={() => goToScene(3)}
            className="btn-glow px-8 py-3 rounded-full text-white font-body text-base sm:text-lg cursor-pointer
                       transition-all duration-300 pointer-events-auto flex items-center gap-2 hover:scale-105 active:scale-95 shadow-xl animate-bounce"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 159, 207, 0.6), rgba(185, 154, 255, 0.6))',
              border: '1px solid rgba(255, 229, 173, 0.7)',
              boxShadow: '0 0 30px rgba(255, 159, 207, 0.5)',
            }}
          >
            <span>Bước vào Ngân Hà 💖</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Scene2() {
  return (
    <group>
      <Scene2Canvas />
    </group>
  );
}
