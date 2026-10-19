import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

// Shared state between 3D and 2D
let scene4Listeners: Array<() => void> = [];
let scene4State = {
  showHeartBurst: false,
};

function useScene4Shared() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const cb = () => setTick(t => t + 1);
    scene4Listeners.push(cb);
    return () => {
      scene4Listeners = scene4Listeners.filter(l => l !== cb);
    };
  }, []);

  const triggerFinaleBurst = () => {
    audioManager.playSound('star');
    scene4State.showHeartBurst = true;
    scene4Listeners.forEach(l => l());
  };

  return {
    showHeartBurst: scene4State.showHeartBurst,
    triggerFinaleBurst,
  };
}

/* Falling petals in 3D */
function FallingPetals() {
  const ref = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const count = mobile ? 40 : 100;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
      velocities[i * 2] = (Math.random() - 0.5) * 0.015;
      velocities[i * 2 + 1] = 0.008 + Math.random() * 0.015;
    }
    return { positions, velocities };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += velocities[i * 2] + Math.sin(t + i) * 0.004;
      posArr.array[i * 3 + 1] -= velocities[i * 2 + 1];
      if (posArr.array[i * 3 + 1] < -6) {
        posArr.array[i * 3 + 1] = 7;
        posArr.array[i * 3] = (Math.random() - 0.5) * 16;
      }
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
        size={0.09}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Heart-shaped particle burst for finale */
function HeartBurst({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = isMobile() ? 150 : 400;
  const frameRef = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const pink = new THREE.Color('#FF9FCF');
    const gold = new THREE.Color('#FFE5AD');

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3) * 0.05;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.05;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.5;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 1] = Math.random() * 0.03 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;

      const c = Math.random() > 0.4 ? pink : gold;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, velocities, colors };
  }, [count]);

  useFrame(() => {
    if (!ref.current || !active) return;
    frameRef.current++;
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += velocities[i * 3];
      posArr.array[i * 3 + 1] += velocities[i * 3 + 1];
      posArr.array[i * 3 + 2] += velocities[i * 3 + 2];
    }
    posArr.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - frameRef.current / 160);
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        transparent
        opacity={1}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* 3D Scene 4 Canvas Elements */
export function Scene4Canvas() {
  const { showHeartBurst } = useScene4Shared();

  return (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 3]} intensity={1.2} color="#FFE5AD" />

      <FallingPetals />
      <HeartBurst active={showHeartBurst} />
    </group>
  );
}

/* 2D HTML UI Overlay for Scene 4 */
export function Scene4Overlay() {
  const { goToScene } = useScene();
  const { triggerFinaleBurst } = useScene4Shared();
  const [phase, setPhase] = useState<'envelope' | 'letter' | 'finale'>('envelope');
  const [letterProgress, setLetterProgress] = useState(0);

  const handleOpenEnvelope = () => {
    if (phase !== 'envelope') return;
    audioManager.playSound('envelope');
    setPhase('letter');
  };

  useEffect(() => {
    if (phase !== 'letter') return;
    const letterText = loveStory.loveLetter;
    const totalChars = letterText.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 3;
      setLetterProgress(Math.min(current / totalChars, 1));
      if (current >= totalChars) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [phase]);

  const handleShowFullLetter = () => {
    setLetterProgress(1);
  };

  const handleMoreToSay = () => {
    setPhase('finale');
    triggerFinaleBurst();
  };

  const visibleLetterText = loveStory.loveLetter.slice(
    0, Math.floor(letterProgress * loveStory.loveLetter.length)
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 select-none pointer-events-none overflow-y-auto no-scrollbar">
      {/* PHASE 1: FLOATING ENVELOPE */}
      {phase === 'envelope' && (
        <div
          onClick={handleOpenEnvelope}
          className="cursor-pointer pointer-events-auto flex flex-col items-center group transition-transform duration-300 hover:scale-105 active:scale-95"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <div className="relative w-64 h-44 sm:w-80 sm:h-52 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden"
               style={{
                 background: 'linear-gradient(145deg, #FFF8F0 0%, #FFEEDD 100%)',
                 border: '2px solid rgba(239, 197, 168, 0.7)',
                 boxShadow: '0 0 50px rgba(255, 229, 173, 0.35), 0 20px 40px rgba(0,0,0,0.4)',
               }}>
            {/* Flap triangle */}
            <div className="absolute top-0 left-0 right-0 h-24 sm:h-28"
                 style={{
                   background: 'linear-gradient(180deg, #FFF3E6 0%, #FFE8D6 100%)',
                   clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                   borderBottom: '1px solid rgba(239, 197, 168, 0.5)',
                 }} />

            {/* Heart wax seal */}
            <div className="absolute top-12 sm:top-14 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                 style={{
                   background: 'radial-gradient(circle, #EFC5A8 0%, #D4956B 100%)',
                   boxShadow: '0 0 25px rgba(239, 197, 168, 0.8)',
                 }}>
              <span className="text-xl">❤️</span>
            </div>

            <p className="absolute bottom-3 text-xs sm:text-sm font-display text-[#8B4513] opacity-80">
              {loveStory.letterRecipient}
            </p>
          </div>

          <p className="text-center mt-5 font-display text-sm sm:text-base text-glow-gold text-[#FFE5AD] animate-pulse">
            Chạm để mở thư ✉️ ✨
          </p>
        </div>
      )}

      {/* PHASE 2 & 3: THE LETTER & FINALE */}
      {(phase === 'letter' || phase === 'finale') && (
        <div className="w-full max-w-sm sm:max-w-lg mx-auto pointer-events-auto my-auto pt-16 pb-8">
          <div className="letter-paper rounded-2xl p-6 sm:p-8 shadow-2xl relative"
               style={{
                 boxShadow: '0 0 50px rgba(255, 229, 173, 0.35), 0 25px 50px rgba(0,0,0,0.3)',
                 animation: 'fadeInUp 0.6s ease forwards',
               }}>
            {/* Title */}
            <h2 className="font-display text-xl sm:text-2xl text-center mb-5 font-bold tracking-wide text-[#8B4513]">
              {loveStory.letterRecipient}
            </h2>

            {/* Body */}
            <div className="font-body text-sm sm:text-base leading-relaxed whitespace-pre-line text-[#4A3728] max-h-[50vh] overflow-y-auto pr-1">
              {phase === 'letter' ? visibleLetterText : loveStory.loveLetter}
            </div>

            {/* Quick show if typing */}
            {phase === 'letter' && letterProgress < 1 && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={handleShowFullLetter}
                  className="text-xs text-[#8B4513] underline opacity-60 hover:opacity-100 cursor-pointer"
                >
                  (Hiển thị nhanh toàn bộ thư)
                </button>
              </div>
            )}

            {/* Button "Anh còn một điều muốn nói..." */}
            {phase === 'letter' && letterProgress >= 1 && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleMoreToSay}
                  className="px-6 py-3 rounded-full font-body text-sm sm:text-base font-semibold cursor-pointer
                             transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF9FCF 0%, #B99AFF 100%)',
                    color: 'white',
                    boxShadow: '0 0 25px rgba(255, 159, 207, 0.5)',
                  }}
                >
                  {loveStory.moreToSayButton}
                </button>
              </div>
            )}

            {/* FINALE: Happy 20/10 & Anh yêu em */}
            {phase === 'finale' && (
              <div className="mt-6 pt-5 border-t border-[#EFC5A8] text-center animate-fade-in">
                <p className="font-display text-xl sm:text-2xl font-bold mb-3 text-[#D4408F] animate-bounce">
                  {loveStory.finalMessage}
                </p>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#FF428E] drop-shadow-md">
                  {loveStory.finalLoveText}
                </p>

                {/* Replay */}
                <button
                  type="button"
                  onClick={() => goToScene(1)}
                  className="mt-6 px-6 py-2 rounded-full font-body text-xs sm:text-sm font-semibold cursor-pointer
                             transition-all duration-300 hover:scale-105 active:scale-95 border border-[#B99AFF] text-[#8B4513] bg-[rgba(185,154,255,0.15)]"
                >
                  🔄 Xem lại từ đầu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Scene4() {
  return (
    <group>
      <Scene4Canvas />
    </group>
  );
}
