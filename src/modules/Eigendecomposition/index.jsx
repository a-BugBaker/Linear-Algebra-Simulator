import React, { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { computeEigenvalues, matVecMul, vecNorm } from '../../utils/mathUtils';
import { COLORS } from '../../utils/threeUtils';
import gsap from 'gsap';

function generateUnitSpherePoints(n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    pts.push([Math.sin(phi)*Math.cos(theta), Math.sin(phi)*Math.sin(theta), Math.cos(phi)]);
  }
  return pts;
}

const EIGEN_PRESETS = {
  symmetric: [[3,1,0],[1,2,1],[0,1,3]],
  rotation: [[0,-1,0],[1,0,0],[0,0,1]],
  diagonal: [[2,0,0],[0,-1,0],[0,0,3]],
  shear: [[1,2,0],[0,3,0],[0,0,2]],
};

export default function Eigendecomposition() {
  const sceneRef = useRef(null);
  const pointsRef = useRef(null);
  const eigenArrowsRef = useRef([]);
  const originalPts = useRef([]);
  const { eigenMatrix, setEigenMatrix } = useStore();
  const [eigenData, setEigenData] = useState(null);
  const [isIterating, setIsIterating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('symmetric');

  const handleSceneReady = useCallback((state) => {
    sceneRef.current = state;
    const { scene } = state;

    const pts = generateUnitSpherePoints(100);
    originalPts.current = pts;
    const positions = new Float32Array(pts.flat());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.08, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    pointsRef.current = points;
  }, []);

  useEffect(() => {
    try {
      const eig = computeEigenvalues(eigenMatrix);
      setEigenData(eig);
    } catch(e) {
      setEigenData(null);
    }
  }, [eigenMatrix]);

  useEffect(() => {
    if (!sceneRef.current || !eigenData) return;
    const { scene } = sceneRef.current;

    eigenArrowsRef.current.forEach(a => scene.remove(a));
    eigenArrowsRef.current = [];

    const { values, vectors } = eigenData;
    const n = values.length;
    for (let i = 0; i < n; i++) {
      const evec = vectors.map(row => Array.isArray(row) ? row[i] : row);
      const lam = values[i];
      const lamReal = typeof lam === 'object' ? (lam.re || 0) : lam;
      const absLam = Math.abs(lamReal);
      const color = absLam > 1 ? 0xff4444 : absLam < 1 ? 0x4444ff : 0xffff44;
      
      const norm = vecNorm(evec);
      if (norm < 0.001) continue;
      const dir = evec.map(x => x/norm);
      const arrowLen = Math.min(Math.max(absLam * 1.5, 0.5), 4);
      
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(...dir), new THREE.Vector3(0,0,0),
        arrowLen, color, 0.3, 0.15
      );
      scene.add(arrow);
      eigenArrowsRef.current.push(arrow);
    }
  }, [eigenData]);

  const iterateMatrix = useCallback(() => {
    if (!pointsRef.current || isIterating) return;
    setIsIterating(true);
    
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    const A = eigenMatrix;
    const count = posAttr.count;
    
    const current = [];
    const transformed = [];
    for (let i = 0; i < count; i++) {
      const v = [posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)];
      current.push(v);
      transformed.push(matVecMul(A, v));
    }
    
    const proxy = { t: 0 };
    gsap.to(proxy, {
      t: 1, duration: 1.0, ease: 'power2.inOut',
      onUpdate: () => {
        for (let i = 0; i < count; i++) {
          const ox = current[i][0], oy = current[i][1], oz = current[i][2];
          const tx = transformed[i][0], ty = transformed[i][1], tz = transformed[i][2];
          posAttr.setXYZ(i,
            ox + (tx - ox) * proxy.t,
            oy + (ty - oy) * proxy.t,
            oz + (tz - oz) * proxy.t
          );
        }
        posAttr.needsUpdate = true;
      },
      onComplete: () => setIsIterating(false),
    });
  }, [eigenMatrix, isIterating]);

  const resetPoints = useCallback(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    const pts = originalPts.current;
    pts.forEach((p, i) => posAttr.setXYZ(i, p[0], p[1], p[2]));
    posAttr.needsUpdate = true;
  }, []);

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      
      <div className="absolute bottom-24 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm">
        <div className="text-xs text-white/50 mb-3">Matrix A</div>
        <div className="grid grid-cols-3 gap-1 mb-3">
          {eigenMatrix.map((row, i) => row.map((val, j) => (
            <input key={`${i}-${j}`} type="number" step="0.1" value={val}
              onChange={e => {
                const nm = eigenMatrix.map(r => [...r]);
                nm[i][j] = parseFloat(e.target.value) || 0;
                setEigenMatrix(nm);
              }}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-purple-400"
            />
          )))}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.keys(EIGEN_PRESETS).map(p => (
            <button key={p} onClick={() => { setEigenMatrix(EIGEN_PRESETS[p]); setSelectedPreset(p); }}
              className={`px-2 py-1 rounded text-xs capitalize transition-all ${selectedPreset === p ? 'bg-purple-500/40 text-purple-300 border border-purple-400/40' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >{p}</button>
          ))}
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={iterateMatrix} disabled={isIterating}
            className="flex-1 py-2 bg-purple-500/30 border border-purple-400/40 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-500/40 disabled:opacity-50 transition-all"
          >{isIterating ? 'Iterating...' : 'Apply A'}</button>
          <button onClick={resetPoints}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-all"
          >Reset</button>
        </div>

        {eigenData && (
          <div className="text-xs space-y-1">
            <div className="text-white/50 mb-1">Eigenvalues:</div>
            {eigenData.values.map((lam, i) => {
              const lamStr = typeof lam === 'object'
                ? `${(lam.re||0).toFixed(3)} + ${(lam.im||0).toFixed(3)}i`
                : (typeof lam === 'number' ? lam.toFixed(4) : String(lam));
              const absLam = typeof lam === 'object'
                ? Math.sqrt((lam.re||0)**2+(lam.im||0)**2)
                : Math.abs(typeof lam === 'number' ? lam : 0);
              const color = absLam > 1 ? 'text-red-400' : absLam < 1 ? 'text-blue-400' : 'text-yellow-400';
              return <div key={i} className={color}>λ{i+1} = {lamStr}</div>;
            })}
          </div>
        )}
      </div>
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 4: Eigendecomposition
      </div>
    </div>
  );
}
