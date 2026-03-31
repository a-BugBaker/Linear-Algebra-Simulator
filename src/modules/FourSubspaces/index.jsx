import React, { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { matDet } from '../../utils/mathUtils';
import * as math from 'mathjs';

function computeSubspaces(A) {
  try {
    const det = math.det(A);
    const rank = Math.abs(det) > 1e-10 ? 3 : 2;
    const rowSpace = A.map(row => [...row]);
    const colSpace = A[0].map((_, j) => A.map(row => row[j]));
    return { rank, rowSpace, colSpace, det };
  } catch(e) {
    return { rank: 3, rowSpace: [[1,0,0],[0,1,0],[0,0,1]], colSpace: [[1,0,0],[0,1,0],[0,0,1]], det: 1 };
  }
}

export default function FourSubspaces() {
  const sceneRef = useRef(null);
  const objectsRef = useRef({});
  const { subspaceMatrix, setSubspaceMatrix } = useStore();
  const [subspaceInfo, setSubspaceInfo] = useState(null);

  const handleSceneReady = useCallback((state) => {
    sceneRef.current = state;
    const { scene } = state;

    const rowArrows = [];
    const colArrows = [];
    const rowColors = [0xff6b6b, 0xff9944, 0xffcc44];
    const colColors = [0x4ecdc4, 0x44aaff, 0x44ffaa];

    for (let i = 0; i < 3; i++) {
      const ra = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
        0.01, rowColors[i], 0.2, 0.1
      );
      scene.add(ra);
      rowArrows.push(ra);

      const ca = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0),
        0.01, colColors[i], 0.2, 0.1
      );
      scene.add(ca);
      colArrows.push(ca);
    }

    objectsRef.current = { rowArrows, colArrows };
  }, []);

  useEffect(() => {
    const info = computeSubspaces(subspaceMatrix);
    setSubspaceInfo(info);

    if (!objectsRef.current.rowArrows) return;
    const { rowArrows, colArrows } = objectsRef.current;

    info.rowSpace.forEach((row, i) => {
      const len = Math.sqrt(row[0]**2 + row[1]**2 + row[2]**2);
      if (len > 0.001 && rowArrows[i]) {
        rowArrows[i].setDirection(new THREE.Vector3(...row).normalize());
        rowArrows[i].setLength(Math.min(len * 0.8, 3), 0.2, 0.1);
        rowArrows[i].visible = true;
      }
    });

    info.colSpace.forEach((col, i) => {
      const len = Math.sqrt(col[0]**2 + col[1]**2 + col[2]**2);
      if (len > 0.001 && colArrows[i]) {
        colArrows[i].setDirection(new THREE.Vector3(...col).normalize());
        colArrows[i].setLength(Math.min(len * 0.8, 3), 0.2, 0.1);
        colArrows[i].visible = true;
      }
    });
  }, [subspaceMatrix]);

  const det = matDet(subspaceMatrix);
  const rank = Math.abs(det) > 1e-10 ? 3 : 2;

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      
      <div className="absolute bottom-24 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
        <div className="text-xs text-white/50 mb-3">Matrix A (3×3)</div>
        <div className="grid grid-cols-3 gap-1 mb-4">
          {subspaceMatrix.map((row, i) => row.map((val, j) => (
            <input key={`${i}-${j}`} type="number" step="0.1" value={val}
              onChange={e => {
                const nm = subspaceMatrix.map(r => [...r]);
                nm[i][j] = parseFloat(e.target.value) || 0;
                setSubspaceMatrix(nm);
              }}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-violet-400"
            />
          )))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3">
            <div className="text-red-400 font-semibold mb-1">Row Space C(A^T)</div>
            <div className="text-white/60">dim = {rank}</div>
            <div className="text-white/40 mt-1">Rows of A</div>
          </div>
          <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-3">
            <div className="text-orange-400 font-semibold mb-1">Null Space N(A)</div>
            <div className="text-white/60">dim = {3 - rank}</div>
            <div className="text-white/40 mt-1">Ax = 0</div>
          </div>
          <div className="bg-teal-500/10 border border-teal-400/20 rounded-lg p-3">
            <div className="text-teal-400 font-semibold mb-1">Column Space C(A)</div>
            <div className="text-white/60">dim = {rank}</div>
            <div className="text-white/40 mt-1">Columns of A</div>
          </div>
          <div className="bg-teal-900/10 border border-teal-900/20 rounded-lg p-3">
            <div className="text-cyan-400 font-semibold mb-1">Left Null N(A^T)</div>
            <div className="text-white/60">dim = {3 - rank}</div>
            <div className="text-white/40 mt-1">A^T y = 0</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 text-xs space-y-1">
          <div className="text-white/60">Rank-Nullity: {rank} + {3-rank} = 3 ✓</div>
          <div className={`${Math.abs(det) < 0.01 ? 'text-red-400' : 'text-green-400'}`}>
            det(A) = {det.toFixed(4)}
          </div>
        </div>
      </div>
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 6: Four Fundamental Subspaces
      </div>
    </div>
  );
}
