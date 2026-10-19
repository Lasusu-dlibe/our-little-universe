import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isMobile } from '../utils/particles';

/* Continuously falling golden glitter across the scene */
export function GoldenGlitter({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const actualCount = isMobile() ? Math.floor(count * 0.4) : count;

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(actualCount * 3);
    const velocities = new Float32Array(actualCount);
    const sizes = new Float32Array(actualCount);
    for (let i = 0; i < actualCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 15 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      velocities[i] = 0.005 + Math.random() * 0.015;
      sizes[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions, velocities, sizes };
  }, [actualCount]);

  useFrame(() => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < actualCount; i++) {
      posArr.array[i * 3 + 1] -= velocities[i];
      posArr.array[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.001;
      if (posArr.array[i * 3 + 1] < -8) {
        posArr.array[i * 3 + 1] = 8;
        posArr.array[i * 3] = (Math.random() - 0.5) * 20;
      }
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
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FFE5AD"
        size={0.04}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Background star field */
export function StarField({ count = 1000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const actualCount = isMobile() ? Math.floor(count * 0.3) : count;

  const positions = useMemo(() => {
    const arr = new Float32Array(actualCount * 3);
    for (let i = 0; i < actualCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 2] = -Math.random() * 30 - 5;
    }
    return arr;
  }, [actualCount]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(t * 0.5) * 0.2;
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
        color="#B99AFF"
        size={0.06}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Shooting stars that fly across the screen */
export function ShootingStars() {
  const ref = useRef<THREE.Group>(null);
  const starsRef = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }[]>([]);

  useFrame(() => {
    if (Math.random() < 0.005 && starsRef.current.length < 3) {
      const x = (Math.random() - 0.5) * 20;
      const y = 5 + Math.random() * 5;
      starsRef.current.push({
        pos: new THREE.Vector3(x, y, -5),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.3, -0.15 - Math.random() * 0.1, 0),
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    }

    starsRef.current = starsRef.current.filter(s => {
      s.pos.add(s.vel);
      s.life++;
      return s.life < s.maxLife;
    });
  });

  return <group ref={ref} />;
}

/* Nebula-like ambient glow clouds */
export function NebulaGlow() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(t * 0.2) * 0.01;
    ref.current.rotation.z = t * 0.02;
  });

  return (
    <mesh ref={ref} position={[0, 0, -15]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial
        color="#B99AFF"
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
