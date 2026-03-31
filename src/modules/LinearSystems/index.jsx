import React, { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { solveLinearSystem, vecScale, vecNorm } from '../../utils/mathUtils';
import { COLORS } from '../../utils/threeUtils';

function createEquationPlane(scene, normal, d, color, opacity) {
  const n = new THREE.Vector3(...normal);
  const len = n.length();
  if (len < 1e-10) return null;
  const nn = n.clone().normalize();
  const center = nn.clone().multiplyScalar(d / len);
  
  const geo = new THREE.PlaneGeometry(8, 8);
  const mat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: opacity || 0.25,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  
  const up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(nn.dot(up)) < 0.99) {
    const q = new THREE.Quaternion().setFromUnitVectors(up, nn);
    mesh.applyQuaternion(q);
  }
  mesh.position.copy(center);
  scene.add(mesh);
  return mesh;
}

export default function LinearSystems() {
  const sceneRef = useRef(null);
  const planesRef = useRef([]);
  const colArrowsRef = useRef([]);
  const solutionSphere = useRef(null);
  const { systemCoeffs, systemRHS, columnWeights, setSystemCoeffs, setSystemRHS, setColumnWeights } = useStore();
  const [view, setView] = useState('row');
  const [solution, setSolution] = useState(null);

  const handleSceneReady = useCallback((state) => {
    sceneRef.current = state;
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene } = sceneRef.current;

    planesRef.current.forEach(p => { if (p) scene.remove(p); });
    colArrowsRef.current.forEach(a => { if (a) scene.remove(a); });
    if (solutionSphere.current) scene.remove(solutionSphere.current);
    planesRef.current = [];
    colArrowsRef.current = [];

    const planeColors = [0xff6b6b, 0x4ecdc4, 0xffe66d];
    
    if (view === 'row') {
      const newPlanes = systemCoeffs.map((row, i) => {
        const d = systemRHS[i];
        return createEquationPlane(scene, row, d, planeColors[i], 0.3);
      });
      planesRef.current = newPlanes.filter(Boolean);
    } else {
      const colors = [COLORS.vectorU, COLORS.vectorV, COLORS.vectorW];
      systemCoeffs[0].forEach((_, j) => {
        const col = systemCoeffs.map(row => row[j]);
        const w = columnWeights[j];
        const scaled = vecScale(w, col);
        const len = vecNorm(scaled);
        if (len < 0.001) return;
        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(...scaled).normalize(),
          new THREE.Vector3(0, 0, 0),
          len, colors[j], 0.25, 0.15
        );
        scene.add(arrow);
        colArrowsRef.current.push(arrow);
      });

      const bVec = systemRHS;
      const bLen = vecNorm(bVec);
      if (bLen > 0.001) {
        const bArrow = new THREE.ArrowHelper(
          new THREE.Vector3(...bVec).normalize(),
          new THREE.Vector3(0,0,0),
          bLen, 0xffffff, 0.25, 0.15
        );
        scene.add(bArrow);
        colArrowsRef.current.push(bArrow);
      }
    }

    const sol = solveLinearSystem(systemCoeffs, systemRHS);
    setSolution(sol);

    if (sol.solution && view === 'row') {
      const [x,y,z] = sol.solution;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
      );
      sphere.position.set(Number(x), Number(y), Number(z));
      scene.add(sphere);
      solutionSphere.current = sphere;
    }
  }, [view, systemCoeffs, systemRHS, columnWeights]);

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 border border-white/10 rounded-xl p-1">
        <button onClick={() => setView('row')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${view === 'row' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
        >Row Picture</button>
        <button onClick={() => setView('column')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${view === 'column' ? 'bg-white/20 text-white font-bold' : 'text-white/50 hover:text-white'}`}
        >Column Picture</button>
      </div>

      <div className="absolute bottom-24 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm">
        <div className="text-xs text-white/50 mb-3">System Ax = b</div>
        <div className="grid grid-cols-4 gap-1 text-xs mb-3">
          {systemCoeffs.map((row, i) => (
            <React.Fragment key={i}>
              {row.map((val, j) => (
                <input key={j} type="number" step="0.5" value={val}
                  onChange={e => {
                    const nc = systemCoeffs.map(r => [...r]);
                    nc[i][j] = parseFloat(e.target.value) || 0;
                    setSystemCoeffs(nc);
                  }}
                  className="bg-white/10 border border-white/20 rounded px-1 py-1 text-white text-center focus:outline-none focus:border-teal-400"
                />
              ))}
              <input type="number" step="0.5" value={systemRHS[i]}
                onChange={e => {
                  const nb = [...systemRHS];
                  nb[i] = parseFloat(e.target.value) || 0;
                  setSystemRHS(nb);
                }}
                className="bg-yellow-400/20 border border-yellow-400/30 rounded px-1 py-1 text-yellow-300 text-center focus:outline-none"
              />
            </React.Fragment>
          ))}
        </div>

        {view === 'column' && (
          <div>
            <div className="text-xs text-white/50 mb-2">Weights x₁, x₂, x₃</div>
            {['x₁','x₂','x₃'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <span className="text-white/50 text-xs w-6">{label}</span>
                <input type="range" min="-3" max="3" step="0.1" value={columnWeights[i]}
                  onChange={e => {
                    const nw = [...columnWeights];
                    nw[i] = parseFloat(e.target.value);
                    setColumnWeights(nw);
                  }}
                  className="flex-1" />
                <span className="text-white/70 text-xs w-10 text-right">{columnWeights[i].toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}

        <div className={`mt-3 text-sm ${solution?.type === 'unique' ? 'text-green-400' : 'text-red-400'}`}>
          {solution?.type === 'unique' && solution.solution
            ? `Solution: [${solution.solution.map(x => parseFloat(x).toFixed(3)).join(', ')}]`
            : 'No unique solution'}
        </div>
      </div>
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 3: Linear Systems
      </div>
    </div>
  );
}
