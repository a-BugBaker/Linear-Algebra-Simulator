import React from 'react';
import useStore from '../../store/useStore';

export default function Toolbar() {
  const { showGrid, showLabels, slowMotion, toggleGrid, toggleLabels, toggleSlowMotion } = useStore();

  const screenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'linear-essence.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <button
        onClick={toggleGrid}
        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
          showGrid ? 'bg-white/20 border-white/40 text-white' : 'bg-black/40 border-white/10 text-white/50'
        }`}
      >
        Grid
      </button>
      <button
        onClick={toggleLabels}
        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
          showLabels ? 'bg-white/20 border-white/40 text-white' : 'bg-black/40 border-white/10 text-white/50'
        }`}
      >
        Labels
      </button>
      <button
        onClick={toggleSlowMotion}
        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
          slowMotion ? 'bg-yellow-500/40 border-yellow-400/60 text-yellow-300' : 'bg-black/40 border-white/10 text-white/50'
        }`}
      >
        0.25x
      </button>
      <button
        onClick={screenshot}
        className="px-3 py-2 rounded-lg text-sm font-medium border bg-black/40 border-white/10 text-white/70 hover:bg-white/10 transition-all"
      >
        📷
      </button>
    </div>
  );
}
