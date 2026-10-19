import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type SceneType = 1 | 2 | 3 | 4;

interface SceneContextType {
  currentScene: SceneType;
  transitioning: boolean;
  goToScene: (scene: SceneType) => void;
  setTransitioning: (val: boolean) => void;
}

const SceneContext = createContext<SceneContextType | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [currentScene, setCurrentScene] = useState<SceneType>(1);
  const [transitioning, setTransitioning] = useState(false);

  const goToScene = useCallback((scene: SceneType) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentScene(scene);
      setTimeout(() => setTransitioning(false), 300);
    }, 400);
  }, []);

  return (
    <SceneContext.Provider value={{ currentScene, transitioning, goToScene, setTransitioning }}>
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}
