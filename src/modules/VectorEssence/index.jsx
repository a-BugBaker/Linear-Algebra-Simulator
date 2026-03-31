import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { vecAdd, vecScale, vecDot, vecCross, vecNorm } from '../../utils/mathUtils';
import { COLORS } from '../../utils/threeUtils';

function VectorControls() {
  const {
    vectorU, vectorV, vectorScalar, vectorOperation,
    spanA, spanB,
    setVectorU, setVectorV, setVectorScalar, setVectorOperation,
    setSpanA, setSpanB
  } = useStore();

  const ops = ['add', 'scalar', 'dot', 'cross', 'span'];
  const u = vectorU, v = vectorV;

  const dot = vecDot(u, v).toFixed(3);
  const cross = vecCross(u, v).map(x => x.toFixed(2));
  const sum = vecAdd(u, v).map(x => x.toFixed(2));

  return (
    <div className="absolute bottom-24 left-4 right-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-md">
      <div className="flex gap-2 mb-4 flex-wrap">
        {ops.map(op => (
          <button key={op} onClick={() => setVectorOperation(op)}
            className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${vectorOperation === op ? 'bg-white/30 text-white font-bold' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >{op}</button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-red-400 font-semibold mb-2">Vector U (red)</div>
          {['x','y','z'].map((c,i) => (
            <div key={c} className="flex items-center gap-2 mb-1">
              <span className="text-white/50 text-xs w-4">{c}</span>
              <input type="range" min="-3" max="3" step="0.1" value={u[i]}
                onChange={e => { const nv=[...u]; nv[i]=parseFloat(e.target.value); setVectorU(nv); }}
                className="flex-1 accent-red-400" />
              <span className="text-white/70 text-xs w-10 text-right">{u[i].toFixed(1)}</span>
            </div>
          ))}
        </div>
        
        {vectorOperation !== 'scalar' && (
          <div>
            <div className="text-xs text-teal-400 font-semibold mb-2">Vector V (teal)</div>
            {['x','y','z'].map((c,i) => (
              <div key={c} className="flex items-center gap-2 mb-1">
                <span className="text-white/50 text-xs w-4">{c}</span>
                <input type="range" min="-3" max="3" step="0.1" value={v[i]}
                  onChange={e => { const nv=[...v]; nv[i]=parseFloat(e.target.value); setVectorV(nv); }}
                  className="flex-1 accent-teal-400" />
                <span className="text-white/70 text-xs w-10 text-right">{v[i].toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
        
        {vectorOperation === 'scalar' && (
          <div>
            <div className="text-xs text-yellow-400 font-semibold mb-2">Scalar k</div>
            <input type="range" min="-3" max="3" step="0.1" value={vectorScalar}
              onChange={e => setVectorScalar(parseFloat(e.target.value))}
              className="w-full accent-yellow-400" />
            <span className="text-white/70 text-sm">k = {vectorScalar.toFixed(2)}</span>
          </div>
        )}
        
        {vectorOperation === 'span' && (
          <div>
            <div className="text-xs text-yellow-400 font-semibold mb-2">Span coefficients</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/50 text-xs">a</span>
              <input type="range" min="-2" max="2" step="0.1" value={spanA}
                onChange={e => setSpanA(parseFloat(e.target.value))} className="flex-1 accent-yellow-400" />
              <span className="text-white/70 text-xs">{spanA.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs">b</span>
              <input type="range" min="-2" max="2" step="0.1" value={spanB}
                onChange={e => setSpanB(parseFloat(e.target.value))} className="flex-1 accent-yellow-400" />
              <span className="text-white/70 text-xs">{spanB.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        {vectorOperation === 'add' && <div className="text-white/70 text-xs">Sum: [{sum.join(', ')}] |u+v| = {vecNorm(vecAdd(u,v)).toFixed(3)}</div>}
        {vectorOperation === 'dot' && <div className="text-white/70 text-xs">u·v = {dot}</div>}
        {vectorOperation === 'cross' && <div className="text-white/70 text-xs">u×v = [{cross.join(', ')}]</div>}
        {vectorOperation === 'scalar' && <div className="text-white/70 text-xs">k·u = [{vecScale(vectorScalar,u).map(x=>x.toFixed(2)).join(', ')}]</div>}
        {vectorOperation === 'span' && <div className="text-white/70 text-xs">a·u + b·v = [{vecAdd(vecScale(spanA,u), vecScale(spanB,v)).map(x=>x.toFixed(2)).join(', ')}]</div>}
      </div>
    </div>
  );
}

export default function VectorEssence() {
  const sceneRef = useRef(null);
  const objectsRef = useRef({});
  const { vectorU, vectorV, vectorScalar, vectorOperation, spanA, spanB } = useStore();
  const spanPoints = useRef([]);

  const handleSceneReady = useCallback((state) => {
    const { scene } = state;
    sceneRef.current = state;

    const arrowU = new THREE.ArrowHelper(
      new THREE.Vector3(...vectorU).normalize(),
      new THREE.Vector3(0, 0, 0),
      Math.max(vecNorm(vectorU), 0.01),
      COLORS.vectorU, 0.25, 0.15
    );
    scene.add(arrowU);

    const arrowV = new THREE.ArrowHelper(
      new THREE.Vector3(...vectorV).normalize(),
      new THREE.Vector3(0, 0, 0),
      Math.max(vecNorm(vectorV), 0.01),
      COLORS.vectorV, 0.25, 0.15
    );
    scene.add(arrowV);

    const arrowResult = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0.01,
      COLORS.vectorW, 0.25, 0.15
    );
    arrowResult.visible = false;
    scene.add(arrowResult);

    const arrowCross = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      0.01,
      COLORS.transformed, 0.25, 0.15
    );
    arrowCross.visible = false;
    scene.add(arrowCross);

    const parallelGeo = new THREE.BufferGeometry();
    const parallelPts = new Float32Array([0,0,0, 1,0,0, 1,1,0, 0,1,0]);
    parallelGeo.setAttribute('position', new THREE.Float32BufferAttribute(parallelPts, 3));
    const parallelMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const parallelLine = new THREE.LineLoop(parallelGeo, parallelMat);
    parallelLine.visible = false;
    scene.add(parallelLine);

    const projGeo = new THREE.BufferGeometry();
    projGeo.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0,1,0,0], 3));
    const projMat = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.7 });
    const projLine = new THREE.Line(projGeo, projMat);
    projLine.visible = false;
    scene.add(projLine);

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3), 3));
    const pMat = new THREE.PointsMaterial({ color: COLORS.vectorW, size: 0.05, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    particles.visible = false;
    scene.add(particles);

    objectsRef.current = { arrowU, arrowV, arrowResult, arrowCross, parallelLine, projLine, particles };
  }, []);

  const updateArrow = (arrow, vec) => {
    const len = Math.max(vecNorm(vec), 0.001);
    const dir = new THREE.Vector3(...vec).normalize();
    arrow.setDirection(dir);
    arrow.setLength(len, Math.min(len * 0.3, 0.3), Math.min(len * 0.18, 0.18));
  };

  useEffect(() => {
    const objs = objectsRef.current;
    if (!objs.arrowU) return;

    updateArrow(objs.arrowU, vectorU);

    if (vectorOperation === 'scalar') {
      objs.arrowV.visible = false;
      objs.arrowResult.visible = true;
      objs.parallelLine.visible = false;
      objs.projLine.visible = false;
      objs.arrowCross.visible = false;
      objs.particles.visible = false;
      const scaledVec = vecScale(vectorScalar, vectorU);
      const scaledLen = Math.max(vecNorm(scaledVec), 0.001);
      const scaledDir = new THREE.Vector3(...scaledVec).normalize();
      objs.arrowResult.setDirection(scaledDir);
      objs.arrowResult.setLength(scaledLen, Math.min(scaledLen*0.3,0.3), Math.min(scaledLen*0.18,0.18));
      objs.arrowResult.setColor(new THREE.Color(COLORS.vectorW));
    } else if (vectorOperation === 'add') {
      objs.arrowV.visible = true;
      objs.arrowResult.visible = true;
      objs.parallelLine.visible = true;
      objs.projLine.visible = false;
      objs.arrowCross.visible = false;
      objs.particles.visible = false;

      updateArrow(objs.arrowV, vectorV);
      const sum = vecAdd(vectorU, vectorV);
      updateArrow(objs.arrowResult, sum);
      objs.arrowResult.setColor(new THREE.Color(COLORS.vectorW));

      const [ux,uy,uz] = vectorU;
      const [vx,vy,vz] = vectorV;
      const pts = new Float32Array([0,0,0, ux,uy,uz, ux+vx,uy+vy,uz+vz, vx,vy,vz]);
      objs.parallelLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    } else if (vectorOperation === 'dot') {
      objs.arrowV.visible = true;
      objs.arrowResult.visible = false;
      objs.parallelLine.visible = false;
      objs.projLine.visible = true;
      objs.arrowCross.visible = false;
      objs.particles.visible = false;

      updateArrow(objs.arrowV, vectorV);
      const dot = vecDot(vectorU, vectorV);
      const vNorm = vecNorm(vectorV);
      if (vNorm > 0.001) {
        const projLen = dot / (vNorm * vNorm);
        const projPt = vecScale(projLen, vectorV);
        const pts = new Float32Array([...vectorU, ...projPt, ...projPt, 0, 0, 0]);
        objs.projLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      }
    } else if (vectorOperation === 'cross') {
      objs.arrowV.visible = true;
      objs.arrowResult.visible = false;
      objs.parallelLine.visible = false;
      objs.projLine.visible = false;
      objs.arrowCross.visible = true;
      objs.particles.visible = false;

      updateArrow(objs.arrowV, vectorV);
      const cross = vecCross(vectorU, vectorV);
      if (vecNorm(cross) > 0.001) {
        updateArrow(objs.arrowCross, cross);
      }
    } else if (vectorOperation === 'span') {
      objs.arrowV.visible = true;
      objs.arrowResult.visible = true;
      objs.parallelLine.visible = false;
      objs.projLine.visible = false;
      objs.arrowCross.visible = false;
      objs.particles.visible = true;

      updateArrow(objs.arrowV, vectorV);
      const combo = vecAdd(vecScale(spanA, vectorU), vecScale(spanB, vectorV));
      const comboSafe = combo.map(x => x === 0 ? 0.001 : x);
      updateArrow(objs.arrowResult, comboSafe);
      objs.arrowResult.setColor(new THREE.Color(COLORS.highlight));

      spanPoints.current.push(...combo);
      if (spanPoints.current.length > 3000) spanPoints.current.splice(0, 3);
      const pts = new Float32Array(spanPoints.current);
      objs.particles.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    }
  }, [vectorU, vectorV, vectorScalar, vectorOperation, spanA, spanB]);

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      <VectorControls />
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 1: Vector Essence
      </div>
    </div>
  );
}
