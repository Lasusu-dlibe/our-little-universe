import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

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
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current || collected) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.5 + index;
    meshRef.current.rotation.z = Math.sin(t * 0.3 + index * 2) * 0.2;
    meshRef.current.position.y = position[1] + Math.sin(t + index * 1.5) * 0.15;

    if (glowRef.current) {
      const s = hovered ? 1.5 : 1 + Math.sin(t * 2 + index) * 0.15;
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered ? 0.5 : 0.25;
    }
  });

  if (collected) return null;

  const colors = ['#FFE5AD', '#FF9FCF', '#B99AFF', '#EFC5A8', '#FFE5AD'];

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color={colors[index]}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Star body */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onCollect(index);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial
          color={colors[index]}
          emissive={colors[index]}
          emissiveIntensity={hovered ? 2 : 1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* Burst effect on star collection */
function StarBurst({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 30;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.02 + Math.random() * 0.04;
      velocities.push([
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed,
      ]);
    }
    return { positions, velocities };
  }, []);

  const frameRef = useRef(0);

  useFrame(() => {
    if (!ref.current || !active) return;
    frameRef.current++;
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += velocities[i][0];
      posArr.array[i * 3 + 1] += velocities[i][1];
      posArr.array[i * 3 + 2] += velocities[i][2];
    }
    posArr.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - frameRef.current / 40);
  });

  if (!active) return null;

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FFE5AD"
        size={0.06}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* Particle name reveal component - particles form the name */
function ParticleNameReveal({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const particleCount = mobile ? 2000 : 5000;
  const [phase, setPhase] = useState<'scatter' | 'forming' | 'formed' | 'dissolve'>('scatter');
  const progressRef = useRef(0);
  const targetPositions = useRef<Float32Array>(new Float32Array(particleCount * 3));
  const initialized = useRef(false);

  // Generate target positions from text using canvas
  useEffect(() => {
    if (!active || initialized.current) return;
    initialized.current = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const fontSize = mobile ? 28 : 48;
    canvas.width = mobile ? 360 : 800;
    canvas.height = mobile ? 120 : 100;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px 'Quicksand', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const name = loveStory.girlfriendName;
    if (mobile) {
      const parts = name.split(' ');
      const mid = Math.ceil(parts.length / 2);
      const line1 = parts.slice(0, mid).join(' ');
      const line2 = parts.slice(mid).join(' ');
      ctx.font = `bold ${fontSize * 0.8}px 'Quicksand', Arial, sans-serif`;
      ctx.fillText(line1, canvas.width / 2, canvas.height / 2 - fontSize * 0.5);
      ctx.fillText(line2, canvas.width / 2, canvas.height / 2 + fontSize * 0.5);
    } else {
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    }

    // Sample white pixels
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

    // Map pixel positions to 3D world coords
    const scaleX = mobile ? 6 : 8;
    const scaleY = mobile ? 2.5 : 2;

    for (let i = 0; i < particleCount; i++) {
      if (validPositions.length > 0) {
        const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
        targetPositions.current[i * 3] = (pos[0] / canvas.width - 0.5) * scaleX;
        targetPositions.current[i * 3 + 1] = -(pos[1] / canvas.height - 0.5) * scaleY;
        targetPositions.current[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      } else {
        targetPositions.current[i * 3] = (Math.random() - 0.5) * 5;
        targetPositions.current[i * 3 + 1] = (Math.random() - 0.5) * 2;
        targetPositions.current[i * 3 + 2] = 0;
      }
    }

    // Start forming after a brief delay
    setTimeout(() => setPhase('forming'), 500);
  }, [active, mobile, particleCount]);

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 5;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return arr;
  }, [particleCount]);

  const colors = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    const goldColor = new THREE.Color('#FFE5AD');
    const pinkColor = new THREE.Color('#FF9FCF');
    for (let i = 0; i < particleCount; i++) {
      const c = Math.random() > 0.5 ? goldColor : pinkColor;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current || !active) return;
    const posArr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

    if (phase === 'forming') {
      progressRef.current = Math.min(1, progressRef.current + 0.008);

      for (let i = 0; i < particleCount; i++) {
        const t = progressRef.current;
        const ease = t * t * (3 - 2 * t);
        posArr.array[i * 3] = posArr.array[i * 3] + (targetPositions.current[i * 3] - posArr.array[i * 3]) * ease * 0.05;
        posArr.array[i * 3 + 1] = posArr.array[i * 3 + 1] + (targetPositions.current[i * 3 + 1] - posArr.array[i * 3 + 1]) * ease * 0.05;
        posArr.array[i * 3 + 2] = posArr.array[i * 3 + 2] + (targetPositions.current[i * 3 + 2] - posArr.array[i * 3 + 2]) * ease * 0.05;
      }

      if (progressRef.current >= 1) {
        setPhase('formed');
        setTimeout(() => setPhase('dissolve'), 4000);
      }
    } else if (phase === 'dissolve') {
      for (let i = 0; i < particleCount; i++) {
        posArr.array[i * 3] += (Math.random() - 0.5) * 0.05;
        posArr.array[i * 3 + 1] += Math.random() * 0.03;
        posArr.array[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
      }
      (pointsRef.current.material as THREE.PointsMaterial).opacity -= 0.005;
      if ((pointsRef.current.material as THREE.PointsMaterial).opacity <= 0) {
        onComplete();
      }
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
        size={mobile ? 0.025 : 0.02}
        transparent
        opacity={0.9}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function Scene2() {
  const { goToScene } = useScene();
  const [collected, setCollected] = useState<boolean[]>([false, false, false, false, false]);
  const [activeMessage, setActiveMessage] = useState<number | null>(null);
  const [showNameReveal, setShowNameReveal] = useState(false);
  const [bursts, setBursts] = useState<boolean[]>([false, false, false, false, false]);

  const allCollected = collected.every(Boolean);

  const starPositions: [number, number, number][] = useMemo(() => {
    const mobile = isMobile();
    const spread = mobile ? 2 : 3;
    return [
      [-spread, 1.5, -2],
      [spread, 0.8, -3],
      [-spread * 0.6, -1, -2.5],
      [spread * 0.7, -1.5, -2],
      [0, 2, -3.5],
    ];
  }, []);

  const handleCollect = useCallback((index: number) => {
    if (collected[index]) return;
    audioManager.playSound('star');

    // Show burst
    const newBursts = [...bursts];
    newBursts[index] = true;
    setBursts(newBursts);

    setActiveMessage(index);
    setTimeout(() => {
      setCollected(prev => {
        const next = [...prev];
        next[index] = true;
        if (next.every(Boolean)) {
          setTimeout(() => {
            setActiveMessage(null);
            setShowNameReveal(true);
          }, 2000);
        }
        return next;
      });
    }, 300);

    setTimeout(() => {
      setActiveMessage(null);
    }, 3000);
  }, [collected, bursts]);

  const handleNameRevealComplete = useCallback(() => {
    goToScene(3);
  }, [goToScene]);

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 2]} intensity={1} color="#FFE5AD" />

      {/* Collectible stars */}
      {!showNameReveal && starPositions.map((pos, i) => (
        <React.Fragment key={i}>
          <CollectibleStar
            position={pos}
            index={i}
            collected={collected[i]}
            onCollect={handleCollect}
          />
          <StarBurst position={pos} active={bursts[i]} />
        </React.Fragment>
      ))}

      {/* Particle name reveal */}
      <ParticleNameReveal active={showNameReveal} onComplete={handleNameRevealComplete} />

      {/* UI overlay */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-col items-center justify-end pb-16 sm:pb-20 px-4">
          {/* Intro text */}
          {!allCollected && !showNameReveal && (
            <div className="text-center mb-4">
              <p className="font-display text-base sm:text-lg md:text-xl text-glow mb-2"
                style={{ color: '#B99AFF' }}>
                {loveStory.starIntro[0]}
              </p>
              <p className="font-display text-sm sm:text-base md:text-lg text-glow-pink"
                style={{ color: '#FF9FCF' }}>
                {loveStory.starIntro[1]}
              </p>
            </div>
          )}

          {/* Star count */}
          {!allCollected && !showNameReveal && (
            <div className="text-center">
              <p className="text-sm font-body" style={{ color: '#EFC5A8' }}>
                ⭐ {collected.filter(Boolean).length} / 5
              </p>
            </div>
          )}

          {/* Active message */}
          {activeMessage !== null && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center
                          px-6 py-4 rounded-2xl max-w-xs sm:max-w-sm"
              style={{
                background: 'rgba(9, 7, 31, 0.85)',
                border: '1px solid rgba(255, 229, 173, 0.3)',
                animation: 'fadeInUp 0.5s ease forwards',
              }}>
              <p className="font-display text-base sm:text-lg text-glow-gold" style={{ color: '#FFE5AD' }}>
                {loveStory.starMessages[activeMessage]}
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translate(-50%, -50%) translateY(10px); }
            to { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
          }
        `}</style>
      </Html>
    </group>
  );
}
