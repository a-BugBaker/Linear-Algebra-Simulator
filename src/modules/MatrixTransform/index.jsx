import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { matVecMul, matDet } from '../../utils/mathUtils';
import { COLORS } from '../../utils/threeUtils';
import gsap from 'gsap';

const PRESETS = {
  identity: [[1,0,0],[0,1,0],[0,0,1]],
  scaleX: [[2,0,0],[0,1,0],[0,0,1]],
  rotation: [[0,-1,0],[1,0,0],[0,0,1]],
  shear: [[1,1,0],[0,1,0],[0,0,1]],
  projectionXY: [[1,0,0],[0,1,0],[0,0,0]],
  reflectionYZ: [[-1,0,0],[0,1,0],[0,0,1]],
};

function MatrixEditor({ matrix, onChange, label }) {
  return (
    <div>
      <div className="text-xs text-white/50 mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {matrix.map((row, i) => row.map((val, j) => (
          <input key={`${i}-${j}`} type="number" step="0.1" value={val}
            onChange={e => {
              const nm = matrix.map(r => [...r]);
              nm[i][j] = parseFloat(e.target.value) || 0;
              onChange(nm);
            }}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-teal-400"
          />
        )))}
      </div>
    </div>
  );
}

export default function MatrixTransform() {
  const sceneRef = useRef(null);
  const gridRef = useRef(null);
  const originalVertices = useRef([]);
  const basisArrows = useRef([]);
  const { matrixA, setMatrixA } = useStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('identity');

  const handleSceneReady = useCallback((state) => {
    const { scene } = state;
    sceneRef.current = state;

    const size = 4;
    const divs = 4;
    const step = size / divs;
    const half = size / 2;
    const vertices = [];
    
    for (let i = 0; i <= divs; i++) {
      for (let j = 0; j <= divs; j++) {
        vertices.push([-half + i*step, -half + j*step, -half]);
        vertices.push([-half + i*step, -half + j*step,  half]);
        vertices.push([-half + i*step, -half, -half + j*step]);
        vertices.push([-half + i*step,  half, -half + j*step]);
        vertices.push([-half, -half + i*step, -half + j*step]);
        vertices.push([ half, -half + i*step, -half + j*step]);
      }
    }

    const positions = new Float32Array(vertices.flat());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    gridRef.current = points;
    originalVertices.current = vertices;

    const bases = [[1,0,0], [0,1,0], [0,0,1]];
    const colors = [COLORS.xAxis, COLORS.yAxis, COLORS.zAxis];
    basisArrows.current = [];
    bases.forEach((b, i) => {
      const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(...b), new THREE.Vector3(0,0,0), 1.5,
        colors[i], 0.3, 0.15
      );
      scene.add(arrow);
      basisArrows.current.push(arrow);
    });
  }, []);

  const applyTransform = useCallback(() => {
    if (!gridRef.current || isAnimating) return;
    setIsAnimating(true);

    const geo = gridRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    const orig = originalVertices.current;
    const A = matrixA;

    const transformed = orig.map(v => matVecMul(A, v));

    const proxy = { t: 0 };
    gsap.to(proxy, {
      t: 1, duration: 1.2, ease: 'power2.inOut',
      onUpdate: () => {
        for (let i = 0; i < orig.length; i++) {
          const v = orig[i];
          const tv = transformed[i];
          posAttr.setXYZ(i,
            v[0] + (tv[0] - v[0]) * proxy.t,
            v[1] + (tv[1] - v[1]) * proxy.t,
            v[2] + (tv[2] - v[2]) * proxy.t
          );
        }
        posAttr.needsUpdate = true;
      },
      onComplete: () => setIsAnimating(false),
    });

    const bases = [[1,0,0], [0,1,0], [0,0,1]];
    bases.forEach((b, i) => {
      const target = matVecMul(A, b);
      const arrow = basisArrows.current[i];
      const proxy2 = { t: 0 };
      gsap.to(proxy2, {
        t: 1, duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => {
          const cx = b[0] + (target[0]-b[0])*proxy2.t;
          const cy = b[1] + (target[1]-b[1])*proxy2.t;
          const cz = b[2] + (target[2]-b[2])*proxy2.t;
          const cl = Math.sqrt(cx*cx+cy*cy+cz*cz) || 0.001;
          arrow.setDirection(new THREE.Vector3(cx/cl, cy/cl, cz/cl));
          arrow.setLength(cl, Math.min(cl*0.3,0.3), Math.min(cl*0.18,0.18));
        }
      });
    });
  }, [matrixA, isAnimating]);

  const resetTransform = useCallback(() => {
    if (!gridRef.current) return;
    const geo = gridRef.current.geometry;
    const posAttr = geo.getAttribute('position');
    const orig = originalVertices.current;
    for (let i = 0; i < orig.length; i++) {
      posAttr.setXYZ(i, orig[i][0], orig[i][1], orig[i][2]);
    }
    posAttr.needsUpdate = true;
    const bases = [[1,0,0], [0,1,0], [0,0,1]];
    bases.forEach((b, i) => {
      const arrow = basisArrows.current[i];
      if (arrow) {
        arrow.setDirection(new THREE.Vector3(...b));
        arrow.setLength(1.5, 0.3, 0.15);
      }
    });
  }, []);

  const det = matDet(matrixA);

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      <div className="absolute bottom-24 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm">
        <MatrixEditor matrix={matrixA} onChange={setMatrixA} label="Matrix A (3×3)" />
        
        <div className="mt-3">
          <div className="text-xs text-white/50 mb-2">Presets</div>
          <div className="flex flex-wrap gap-1">
            {Object.keys(PRESETS).map(p => (
              <button key={p} onClick={() => { setMatrixA(PRESETS[p]); setSelectedPreset(p); }}
                className={`px-2 py-1 rounded text-xs capitalize transition-all ${selectedPreset === p ? 'bg-teal-500/40 text-teal-300 border border-teal-400/40' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={applyTransform} disabled={isAnimating}
            className="flex-1 py-2 bg-teal-500/30 border border-teal-400/40 text-teal-300 rounded-lg text-sm font-medium hover:bg-teal-500/40 disabled:opacity-50 transition-all"
          >{isAnimating ? 'Animating...' : 'Apply A'}</button>
          <button onClick={resetTransform}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg text-sm hover:bg-white/20 transition-all"
          >Reset</button>
        </div>

        <div className={`mt-3 text-sm font-mono ${Math.abs(det) < 0.01 ? 'text-red-400' : det < 0 ? 'text-purple-400' : 'text-green-400'}`}>
          det(A) = {det.toFixed(4)}
          {Math.abs(det) < 0.01 && ' ⚠ Singular!'}
        </div>
      </div>
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 2: Matrix as Transformation
      </div>
    </div>
  );
}
