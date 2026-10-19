import React, { useState } from 'react';
import { Music, VolumeX } from 'lucide-react';
import { audioManager } from '../utils/audio';
import { loveStory } from '../content/loveStory';

export default function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const handleToggle = () => {
    if (!initialized) {
      audioManager.initMusic(loveStory.musicPath);
      setInitialized(true);
    }
    const isPlaying = audioManager.toggleMusic();
    setPlaying(isPlaying);
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center
                 transition-all duration-300 cursor-pointer"
      style={{
        background: 'rgba(185, 154, 255, 0.2)',
        border: '1px solid rgba(185, 154, 255, 0.4)',
        backdropFilter: 'blur(10px)',
      }}
      aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
    >
      {playing ? (
        <Music size={18} color="#B99AFF" />
      ) : (
        <VolumeX size={18} color="#B99AFF" />
      )}
    </button>
  );
}
