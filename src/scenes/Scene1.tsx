import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
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
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Portal particles swirling around the center */
function PortalParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = isMobile() ? 200 : 500;

  const { positions, angles, radii, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 0.5 + Math.random() * 1.5;
      speeds[i] = 0.5 + Math.random() * 2;
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
      const r = active ? radii[i] * 0.3 : radii[i];
      posArr.array[i * 3] = Math.cos(a) * r;
      posArr.array[i * 3 + 1] = Math.sin(a) * r;
    }
    posArr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FF9FCF"
        size={0.03}
        transparent
        opacity={0.7}
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
    const baseOpacity = active ? 0.4 : 0.15;
    mat.opacity = baseOpacity + Math.sin(t * 3) * 0.05;
    const s = active ? 2.5 : 1.2 + Math.sin(t * 1.5) * 0.2;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        color="#B99AFF"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Scene1() {
  const { goToScene } = useScene();
  const { camera } = useThree();
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowText(true), 800);
    const t2 = setTimeout(() => setShowButton(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleStart = () => {
    if (leaving) return;
    setLeaving(true);
    setPortalActive(true);
    audioManager.playSound('portal');

    gsap.to(camera.position, {
      z: -10,
      duration: 1.5,
      ease: 'power2.in',
      onComplete: () => {
        camera.position.z = 5;
        goToScene(2);
      },
    });
  };

  return (
    <group>
      <group position={[0, 0, -3]}>
        <PortalRing radius={1.8} speed={0.3} color="#B99AFF" width={0.025} />
        <PortalRing radius={1.5} speed={-0.5} color="#FF9FCF" width={0.02} />
        <PortalRing radius={1.2} speed={0.7} color="#FFE5AD" width={0.015} />
        <PortalParticles active={portalActive} />
        <PortalGlow active={portalActive} />
      </group>

      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-col items-center justify-center px-4">
          {showText && !leaving && (
            <div className="text-center mb-8 animate-fade-in">
              <p
                className="font-display text-xl sm:text-2xl md:text-3xl text-glow mb-4"
                style={{
                  color: '#B99AFF',
                  animation: 'fadeInUp 1s ease forwards',
                  opacity: 0,
                }}
              >
                {loveStory.introMessages[0]}
              </p>
              <p
                className="font-display text-lg sm:text-xl md:text-2xl text-glow-pink mt-4"
                style={{
                  color: '#FF9FCF',
                  animation: 'fadeInUp 1s ease 1s forwards',
                  opacity: 0,
                }}
              >
                {loveStory.introMessages[1]}
              </p>
            </div>
          )}

          {showButton && !leaving && (
            <button
              onClick={handleStart}
              className="btn-glow px-8 py-3 rounded-full text-white font-body text-lg cursor-pointer
                         transition-all duration-300 pointer-events-auto"
              style={{
                animation: 'fadeInUp 0.8s ease forwards',
                opacity: 0,
                animationDelay: '0.3s',
              }}
            >
              {loveStory.portalButtonText}
            </button>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Html>
    </group>
  );
}
