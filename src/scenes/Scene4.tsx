import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { loveStory } from '../content/loveStory';
import { useScene } from '../hooks/useScene';
import { audioManager } from '../utils/audio';
import { isMobile } from '../utils/particles';

/* Falling petals */
function FallingPetals() {
  const ref = useRef<THREE.Points>(null);
  const mobile = isMobile();
  const count = mobile ? 30 : 80;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3;
      velocities[i * 2] = (Math.random() - 0.5) * 0.01;
      velocities[i * 2 + 1] = 0.005 + Math.random() * 0.01;
    }
    return { positions, velocities };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      posArr.array[i * 3] += velocities[i * 2] + Math.sin(t + i) * 0.003;
      posArr.array[i * 3 + 1] -= velocities[i * 2 + 1];
      if (posArr.array[i * 3 + 1] < -5) {
        posArr.array[i * 3 + 1] = 6;
        posArr.array[i * 3] = (Math.random() - 0.5) * 15;
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
        size={0.08}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* Heart-shaped particle burst for the finale */
function HeartBurst({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = isMobile() ? 100 : 300;
  const frameRef = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const pink = new THREE.Color('#FF9FCF');
    const gold = new THREE.Color('#FFE5AD');

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3) * 0.04;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.04;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y + 0.5;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = (Math.random() - 0.5) * 0.03;
      velocities[i * 3 + 1] = Math.random() * 0.02 + 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

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
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - frameRef.current / 120);
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
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

export default function Scene4() {
  const { goToScene } = useScene();
  const [phase, setPhase] = useState<'envelope' | 'opening' | 'letter' | 'finale' | 'end'>('envelope');
  const [letterProgress, setLetterProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleEnvelopeClick = () => {
    if (phase !== 'envelope') return;
    audioManager.playSound('envelope');
    setPhase('opening');
    setTimeout(() => setPhase('letter'), 1200);
  };

  useEffect(() => {
    if (phase !== 'letter') return;
    const letterText = loveStory.loveLetter;
    const totalChars = letterText.length;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setLetterProgress(Math.min(current / totalChars, 1));
      if (current >= totalChars) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  const handleMoreToSay = () => {
    setPhase('finale');
    setShowHeartBurst(true);
    audioManager.playSound('star');
  };

  const handleReplay = () => {
    goToScene(1);
  };

  const visibleLetterText = loveStory.loveLetter.slice(
    0, Math.floor(letterProgress * loveStory.loveLetter.length)
  );

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#FFE5AD" />

      <FallingPetals />
      <HeartBurst active={showHeartBurst} />

      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full flex flex-col items-center justify-center px-4 overflow-hidden">

          {/* ENVELOPE PHASE */}
          {phase === 'envelope' && (
            <div
              className="cursor-pointer pointer-events-auto select-none"
              onClick={handleEnvelopeClick}
              style={{ animation: 'float 3s ease-in-out infinite' }}
            >
              {/* Envelope */}
              <div className="relative w-64 h-44 sm:w-72 sm:h-48"
                style={{ perspective: '500px' }}>
                <div className="absolute inset-0 rounded-lg shadow-2xl"
                  style={{
                    background: 'linear-gradient(145deg, #FFF8F0 0%, #FFEEDD 100%)',
                    border: '1px solid rgba(239, 197, 168, 0.5)',
                    boxShadow: '0 0 40px rgba(255, 229, 173, 0.3), 0 10px 30px rgba(0,0,0,0.3)',
                  }} />
                <div className="absolute top-0 left-0 right-0 h-20 sm:h-24"
                  style={{
                    background: 'linear-gradient(180deg, #FFF3E6 0%, #FFEEDD 100%)',
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                    borderRadius: '8px 8px 0 0',
                  }} />
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, #EFC5A8 0%, #D4956B 100%)',
                    boxShadow: '0 0 20px rgba(239, 197, 168, 0.6)',
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}>
                  <span className="text-lg">❤️</span>
                </div>
              </div>
              <p className="text-center mt-6 font-display text-sm text-glow"
                style={{ color: '#EFC5A8' }}>
                Chạm để mở thư ✉️
              </p>
            </div>
          )}

          {/* OPENING ANIMATION */}
          {phase === 'opening' && (
            <div className="relative w-64 h-44 sm:w-72 sm:h-48"
              style={{ animation: 'envelopeOpen 1.2s ease forwards' }}>
              <div className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(145deg, #FFF8F0 0%, #FFEEDD 100%)',
                  boxShadow: '0 0 40px rgba(255, 229, 173, 0.5)',
                }} />
            </div>
          )}

          {/* LETTER PHASE */}
          {(phase === 'letter' || phase === 'finale' || phase === 'end') && (
            <div className="w-full max-w-sm sm:max-w-md mx-auto max-h-[80vh] overflow-y-auto no-scrollbar pointer-events-auto"
              style={{ animation: 'slideUp 0.8s ease forwards' }}>
              <div className="letter-paper rounded-lg p-6 sm:p-8 shadow-2xl"
                style={{
                  boxShadow: '0 0 40px rgba(255, 229, 173, 0.3), 0 20px 40px rgba(0,0,0,0.2)',
                }}>
                <h2 className="font-display text-xl sm:text-2xl text-center mb-6"
                  style={{ color: '#8B4513' }}>
                  {loveStory.letterRecipient}
                </h2>

                <div className="font-body text-sm sm:text-base leading-relaxed whitespace-pre-line"
                  style={{ color: '#4A3728' }}>
                  {phase === 'letter' ? visibleLetterText : loveStory.loveLetter}
                </div>

                {phase === 'letter' && letterProgress >= 1 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleMoreToSay}
                      className="px-6 py-2.5 rounded-full font-body text-sm cursor-pointer
                                 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #FF9FCF, #B99AFF)',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(255, 159, 207, 0.4)',
                        animation: 'fadeIn 0.8s ease forwards',
                      }}
                    >
                      {loveStory.moreToSayButton}
                    </button>
                  </div>
                )}

                {(phase === 'finale' || phase === 'end') && (
                  <div className="mt-8 text-center" style={{ animation: 'fadeIn 1s ease forwards' }}>
                    <div className="py-4">
                      <p className="font-display text-xl sm:text-2xl mb-4"
                        style={{
                          color: '#D4408F',
                          animation: 'fadeInUp 1s ease forwards',
                        }}>
                        {loveStory.finalMessage}
                      </p>
                      <p className="font-display text-2xl sm:text-3xl mt-4"
                        style={{
                          color: '#FF6BAA',
                          animation: 'fadeInUp 1s ease 0.5s forwards',
                          opacity: 0,
                          textShadow: '0 0 20px rgba(255, 107, 170, 0.5)',
                        }}>
                        {loveStory.finalLoveText}
                      </p>

                      <button
                        onClick={handleReplay}
                        className="mt-8 px-6 py-2 rounded-full font-body text-xs cursor-pointer
                                   transition-all duration-300"
                        style={{
                          background: 'rgba(185, 154, 255, 0.2)',
                          border: '1px solid rgba(185, 154, 255, 0.4)',
                          color: '#B99AFF',
                          animation: 'fadeIn 1s ease 1.5s forwards',
                          opacity: 0,
                        }}
                      >
                        🔄 Xem lại từ đầu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes envelopeOpen {
            0% { transform: scale(1); }
            50% { transform: scale(1.1) rotateX(-20deg); }
            100% { transform: scale(0.8) translateY(-50px); opacity: 0; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        `}</style>
      </Html>
    </group>
  );
}
