import React from 'react';
import useStore from '../../store/useStore';

const modules = [
  { id: 0, label: 'Vectors', icon: '→', color: '#ff6b6b' },
  { id: 1, label: 'Matrix', icon: '⊞', color: '#4ecdc4' },
  { id: 2, label: 'Systems', icon: '≡', color: '#ffe66d' },
  { id: 3, label: 'Eigen', icon: 'λ', color: '#c7f464' },
  { id: 4, label: 'Ortho', icon: '⊥', color: '#ff006e' },
  { id: 5, label: 'Subspaces', icon: '◈', color: '#a78bfa' },
];

export default function Navigation() {
  const { currentModule, setCurrentModule } = useStore();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
      <div className="flex gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 shadow-2xl">
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => setCurrentModule(m.id)}
            className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-300 ${
              currentModule === m.id
                ? 'bg-white/20 scale-110'
                : 'hover:bg-white/10 opacity-60 hover:opacity-100'
            }`}
            style={currentModule === m.id ? { color: m.color } : { color: '#e0e0e0' }}
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-xs mt-1 font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
