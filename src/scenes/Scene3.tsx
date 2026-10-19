import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

/* Spiral galaxy particles */
function SpiralGalaxy() {
  const ref = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const count = mobile ? 1500 : 4000;

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
      const dist = Math.random() * 5;
      const angle = armAngle + dist * 0.6 + (Math.random() - 0.5) * 0.5;
      const spread = 0.3 + dist * 0.15;

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
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={mobile ? 0.04 : 0.03}
        transparent
        opacity={0.7}
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
      <torusGeometry args={[radius, 0.008, 8, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Glowing 3D Heart */
function GlowingHeart({ onInteract, activated }: { onInteract: () => void; activated: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create heart shape
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

    meshRef.current.rotation.y = t * 0.3;
    const pulse = activated ? 1.3 + Math.sin(t * 4) * 0.1 : 1 + Math.sin(t * 1.5) * 0.05;
    const scale = hovered ? pulse * 1.15 : pulse;
    meshRef.current.scale.setScalar(scale);

    if (glowRef.current) {
      const glowScale = activated ? 2.5 : hovered ? 1.8 : 1.4 + Math.sin(t * 2) * 0.2;
      glowRef.current.scale.setScalar(glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = activated ? 0.5 : 0.2;
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#FF9FCF"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={meshRef}
        geometry={heartGeometry}
        onClick={(e) => {
          e.stopPropagation();
          onInteract();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        rotation={[0, 0, Math.PI]}
        position={[0, 0.2, -0.15]}
      >
        <meshStandardMaterial
          color="#FF6BAA"
          emissive="#FF9FCF"
          emissiveIntensity={activated ? 3 : 1.5}
          roughness={0.2}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* Golden key formation from particles */
function GoldenKey({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 300;
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
        targets[i * 3] = Math.cos(a) * 0.25;
        targets[i * 3 + 1] = 0.3 + Math.sin(a) * 0.25;
        targets[i * 3 + 2] = 0;
      } else if (i < count * 0.7) {
        const t = (i - count * 0.3) / (count * 0.4);
        targets[i * 3] = 0;
        targets[i * 3 + 1] = -t * 0.8;
        targets[i * 3 + 2] = 0;
      } else {
        const t = (i - count * 0.7) / (count * 0.3);
        const tooth = Math.floor(t * 3);
        targets[i * 3] = 0.1 + Math.random() * 0.1;
        targets[i * 3 + 1] = -0.5 - tooth * 0.12;
        targets[i * 3 + 2] = 0;
      }
    }
    return { positions, targets };
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    progressRef.current = Math.min(1, progressRef.current + 0.01);
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = progressRef.current;
    const ease = t * t * (3 - 2 * t);

    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += (targets[i * 3] - posArr.array[i * 3]) * ease * 0.08;
      posArr.array[i * 3 + 1] += (targets[i * 3 + 1] - posArr.array[i * 3 + 1]) * ease * 0.08;
      posArr.array[i * 3 + 2] += (targets[i * 3 + 2] - posArr.array[i * 3 + 2]) * ease * 0.08;
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
        size={0.04}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export default function Scene3() {
  const { goToScene } = useScene();
  const [showText, setShowText] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [activated, setActivated] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 800);
    const t2 = setTimeout(() => setShowPrompt(true), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleHeartInteract = () => {
    if (activated) return;
    setActivated(true);
    audioManager.playSound('galaxy');

    setTimeout(() => setShowKey(true), 1500);
    setTimeout(() => goToScene(4), 5000);
  };

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 2, 3]} intensity={1.5} color="#FF9FCF" />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color="#B99AFF" />

      {/* Spiral galaxy */}
      <group position={[0, 0, -5]} rotation={[0.8, 0, 0]}>
        <SpiralGalaxy />
      </group>

      {/* Orbital rings */}
      <OrbitalRing radius={1.2} speed={0.3} tilt={0.3} color="#B99AFF" />
      <OrbitalRing radius={1.5} speed={-0.2} tilt={-0.5} color="#FF9FCF" />
      <OrbitalRing radius={1.0} speed={0.5} tilt={1.0} color="#FFE5AD" />

      {/* Central heart */}
      <GlowingHeart onInteract={handleHeartInteract} activated={activated} />

      {/* Golden key */}
      <GoldenKey active={showKey} />

      {/* UI overlay */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-col items-center justify-end pb-16 sm:pb-20 px-4">
          {showText && !activated && (
            <div className="text-center mb-6">
              <p className="font-display text-base sm:text-lg md:text-xl text-glow mb-2"
                style={{ color: '#B99AFF', animation: 'fadeIn 1s ease forwards', opacity: 0 }}>
                {loveStory.galaxyMessages[0]}
              </p>
              <p className="font-display text-base sm:text-lg md:text-xl text-glow-pink"
                style={{ color: '#FF9FCF', animation: 'fadeIn 1s ease 0.5s forwards', opacity: 0 }}>
                {loveStory.galaxyMessages[1]}
              </p>
            </div>
          )}

          {showPrompt && !activated && (
            <p className="font-display text-lg sm:text-xl text-glow-gold text-center"
              style={{
                color: '#FFE5AD',
                animation: 'fadeIn 0.8s ease forwards, pulse-glow 2s ease infinite',
                opacity: 0,
              }}>
              {loveStory.galaxyPrompt}
            </p>
          )}

          {activated && (
            <p className="font-display text-lg sm:text-xl text-glow-gold text-center"
              style={{ color: '#FFE5AD', animation: 'fadeIn 0.5s ease forwards' }}>
              ✨ Đang mở khóa... ✨
            </p>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </Html>
    </group>
  );
}
