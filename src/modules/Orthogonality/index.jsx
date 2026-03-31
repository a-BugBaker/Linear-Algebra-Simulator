import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import SceneSetup from '../../components/three/SceneSetup';
import useStore from '../../store/useStore';
import { projectOntoSubspace, vecNorm, vecDot } from '../../utils/mathUtils';
import { COLORS } from '../../utils/threeUtils';

export default function Orthogonality() {
  const sceneRef = useRef(null);
  const objectsRef = useRef({});
  const { orthoVector, orthoNormal, setOrthoVector, setOrthoNormal } = useStore();

  const handleSceneReady = useCallback((state) => {
    sceneRef.current = state;
    const { scene } = state;

    const planeGeo = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.MeshPhongMaterial({
      color: 0x4ecdc4, transparent: true, opacity: 0.2,
      side: THREE.DoubleSide, depthWrite: false
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(plane);

    const arrowV = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
      1, COLORS.vectorU, 0.25, 0.15
    );
    scene.add(arrowV);

    const arrowProj = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
      1, COLORS.transformed, 0.25, 0.15
    );
    scene.add(arrowProj);

    const arrowPerp = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0),
      1, COLORS.highlight, 0.25, 0.15
    );
    scene.add(arrowPerp);

    const rightAngleGeo = new THREE.BufferGeometry();
    const rightAnglePts = new Float32Array(12);
    rightAngleGeo.setAttribute('position', new THREE.Float32BufferAttribute(rightAnglePts, 3));
    const rightAngleMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const rightAngleLine = new THREE.LineSegments(rightAngleGeo, rightAngleMat);
    scene.add(rightAngleLine);

    const arrowNormal = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0),
      2, 0xaaaaff, 0.2, 0.1
    );
    scene.add(arrowNormal);

    objectsRef.current = { plane, arrowV, arrowProj, arrowPerp, rightAngleLine, arrowNormal };
  }, []);

  useEffect(() => {
    const objs = objectsRef.current;
    if (!objs.arrowV) return;

    const { proj, perp } = projectOntoSubspace(orthoVector, orthoNormal);

    const n = new THREE.Vector3(...orthoNormal).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(n.dot(up)) < 0.999) {
      const q = new THREE.Quaternion().setFromUnitVectors(up, n);
      objs.plane.quaternion.copy(q);
    } else {
      objs.plane.quaternion.identity();
    }

    const vLen = vecNorm(orthoVector);
    if (vLen > 0.001) {
      objs.arrowV.setDirection(new THREE.Vector3(...orthoVector).normalize());
      objs.arrowV.setLength(vLen, Math.min(vLen*0.3, 0.3), Math.min(vLen*0.18, 0.18));
    }

    const pLen = vecNorm(proj);
    if (pLen > 0.001) {
      objs.arrowProj.setDirection(new THREE.Vector3(...proj).normalize());
      objs.arrowProj.setLength(pLen, Math.min(pLen*0.3, 0.3), Math.min(pLen*0.18, 0.18));
    }

    const perpLen = vecNorm(perp);
    if (perpLen > 0.001) {
      objs.arrowPerp.position.set(...proj);
      objs.arrowPerp.setDirection(new THREE.Vector3(...perp).normalize());
      objs.arrowPerp.setLength(perpLen, Math.min(perpLen*0.3, 0.3), Math.min(perpLen*0.18, 0.18));
    }

    objs.arrowNormal.setDirection(n);

    if (pLen > 0.001 && perpLen > 0.001) {
      const s = 0.2;
      const pNorm = new THREE.Vector3(...proj).normalize();
      const perpNorm = new THREE.Vector3(...perp).normalize();
      const corner = new THREE.Vector3(...proj);
      const p1 = corner.clone().addScaledVector(pNorm, -s);
      const p2 = corner.clone().addScaledVector(pNorm, -s).addScaledVector(perpNorm, s);
      const p3 = corner.clone().addScaledVector(perpNorm, s);
      const pts = new Float32Array([p1.x,p1.y,p1.z, p2.x,p2.y,p2.z, p2.x,p2.y,p2.z, p3.x,p3.y,p3.z]);
      objs.rightAngleLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    }
  }, [orthoVector, orthoNormal]);

  const { proj, perp } = projectOntoSubspace(orthoVector, orthoNormal);

  return (
    <div className="relative w-full h-full">
      <SceneSetup ref={sceneRef} onSceneReady={handleSceneReady} />
      
      <div className="absolute bottom-24 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-sm">
        <div className="text-xs text-white/50 mb-3">Orthogonal Projection</div>
        
        <div className="mb-3">
          <div className="text-xs text-red-400 mb-2">Vector v (red)</div>
          {['x','y','z'].map((c,i) => (
            <div key={c} className="flex items-center gap-2 mb-1">
              <span className="text-white/50 text-xs w-4">{c}</span>
              <input type="range" min="-3" max="3" step="0.1" value={orthoVector[i]}
                onChange={e => { const nv=[...orthoVector]; nv[i]=parseFloat(e.target.value); setOrthoVector(nv); }}
                className="flex-1 accent-red-400" />
              <span className="text-white/70 text-xs w-10 text-right">{orthoVector[i].toFixed(1)}</span>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <div className="text-xs text-blue-400 mb-2">Subspace normal n</div>
          {['x','y','z'].map((c,i) => (
            <div key={c} className="flex items-center gap-2 mb-1">
              <span className="text-white/50 text-xs w-4">{c}</span>
              <input type="range" min="-1" max="1" step="0.05" value={orthoNormal[i]}
                onChange={e => { const nv=[...orthoNormal]; nv[i]=parseFloat(e.target.value); setOrthoNormal(nv); }}
                className="flex-1 accent-blue-400" />
              <span className="text-white/70 text-xs w-10 text-right">{orthoNormal[i].toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="text-xs space-y-1 border-t border-white/10 pt-3">
          <div className="text-green-400">v_S = [{proj.map(x => x.toFixed(3)).join(', ')}]</div>
          <div className="text-pink-400">v_⊥ = [{perp.map(x => x.toFixed(3)).join(', ')}]</div>
          <div className="text-white/60">v_S · v_⊥ = {vecDot(proj, perp).toFixed(6)} ≈ 0 ✓</div>
        </div>
      </div>
      <div className="absolute top-4 left-80 text-white/60 text-sm bg-black/40 px-3 py-1 rounded-lg">
        Module 5: Orthogonality &amp; Projection
      </div>
    </div>
  );
}
