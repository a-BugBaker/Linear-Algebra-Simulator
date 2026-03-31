import * as THREE from 'three';

export const COLORS = {
  vectorU: 0xff6b6b,
  vectorV: 0x4ecdc4,
  vectorW: 0xffe66d,
  transformed: 0xc7f464,
  highlight: 0xff006e,
  grid: 0xffffff,
  xAxis: 0xff4444,
  yAxis: 0x44ff44,
  zAxis: 0x4444ff,
  white: 0xffffff,
};

export function createArrow(dir, origin, length, color, headLength, headWidth) {
  const d = new THREE.Vector3(...dir).normalize();
  const o = new THREE.Vector3(...origin);
  const hl = headLength || Math.min(length * 0.3, 0.4);
  const hw = headWidth || hl * 0.6;
  const arrow = new THREE.ArrowHelper(d, o, length, color, hl, hw);
  return arrow;
}

export function createSphere(radius, color, pos) {
  const geo = new THREE.SphereGeometry(radius, 16, 16);
  const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  if (pos) mesh.position.set(...pos);
  return mesh;
}

export function createPlane(normal, point, size, color, opacity) {
  const geo = new THREE.PlaneGeometry(size, size, 20, 20);
  const mat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: opacity || 0.25,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const n = new THREE.Vector3(...normal).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(n.dot(up)) < 0.999) {
    const q = new THREE.Quaternion().setFromUnitVectors(up, n);
    mesh.applyQuaternion(q);
  }
  mesh.position.set(...point);
  return mesh;
}

export function createCoordinateAxes(size) {
  const group = new THREE.Group();
  const axes = [
    { dir: [1,0,0], color: COLORS.xAxis },
    { dir: [0,1,0], color: COLORS.yAxis },
    { dir: [0,0,1], color: COLORS.zAxis },
  ];
  axes.forEach(({ dir, color }) => {
    const arrow = createArrow(dir, [0,0,0], size, color, 0.15, 0.08);
    group.add(arrow);
  });
  return group;
}

export function createGridHelper(size, divisions, color) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const step = size / divisions;
  const half = size / 2;
  for (let i = 0; i <= divisions; i++) {
    const p = -half + i * step;
    positions.push(-half, 0, p,  half, 0, p);
    positions.push(p, 0, -half,  p, 0,  half);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color: color || 0xffffff, transparent: true, opacity: 0.08 });
  return new THREE.LineSegments(geo, mat);
}

export function disposeObject(obj) {
  if (!obj) return;
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
    else obj.material.dispose();
  }
  while (obj.children.length > 0) {
    disposeObject(obj.children[0]);
    obj.remove(obj.children[0]);
  }
}
