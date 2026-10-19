import { useScene, type SceneType } from '../hooks/useScene';

export default function Navigation() {
  const { currentScene, goToScene } = useScene();

  const scenes: { id: SceneType; label: string; icon: string }[] = [
    { id: 1, label: 'Cổng Vũ Trụ', icon: '✨' },
    { id: 2, label: '5 Ngôi Sao', icon: '⭐' },
    { id: 3, label: 'Ngân Hà', icon: '💖' },
    { id: 4, label: 'Thư Tình', icon: '✉️' },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full
                    backdrop-blur-md transition-all duration-300"
         style={{
           background: 'rgba(9, 7, 31, 0.7)',
           border: '1px solid rgba(255, 229, 173, 0.25)',
           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
         }}>
      {scenes.map((s) => {
        const isActive = currentScene === s.id;
        return (
          <button
            key={s.id}
            onClick={() => goToScene(s.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body transition-all duration-300 cursor-pointer"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, rgba(185, 154, 255, 0.5), rgba(255, 159, 207, 0.5))'
                : 'transparent',
              color: isActive ? '#FFE5AD' : 'rgba(255, 255, 255, 0.6)',
              border: isActive ? '1px solid rgba(255, 229, 173, 0.5)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 400,
            }}
            title={s.label}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
