import * as math from 'mathjs';

export function vecAdd(u, v) {
  return [u[0]+v[0], u[1]+v[1], u[2]+v[2]];
}
export function vecScale(k, v) {
  return [k*v[0], k*v[1], k*v[2]];
}
export function vecDot(u, v) {
  return u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
}
export function vecCross(u, v) {
  return [
    u[1]*v[2] - u[2]*v[1],
    u[2]*v[0] - u[0]*v[2],
    u[0]*v[1] - u[1]*v[0]
  ];
}
export function vecNorm(v) {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}
export function vecNormalize(v) {
  const n = vecNorm(v);
  if (n < 1e-10) return [0,0,0];
  return [v[0]/n, v[1]/n, v[2]/n];
}
export function matDet(m) {
  try { return math.det(m); } catch(e) { return 0; }
}
export function matMul(A, B) {
  try { return math.multiply(A, B).toArray(); } catch(e) { return A; }
}
export function matVecMul(A, v) {
  try {
    const res = math.multiply(A, v);
    return Array.isArray(res) ? res : res.toArray();
  } catch(e) { return v; }
}
export function computeEigenvalues(m) {
  try {
    const M = math.matrix(m);
    const eig = math.eigs(M);
    const values = eig.values.toArray ? eig.values.toArray() : Array.from(eig.values);
    const vectors = eig.vectors.toArray ? eig.vectors.toArray() : Array.from(eig.vectors);
    return { values, vectors };
  } catch(e) {
    return { values: [1,1,1], vectors: [[1,0,0],[0,1,0],[0,0,1]] };
  }
}
export function solveLinearSystem(A, b) {
  try {
    const x = math.lusolve(A, b);
    const flat = x.flat ? x.flat() : x;
    return { solution: flat, type: 'unique' };
  } catch(e) {
    return { solution: null, type: 'none' };
  }
}
export function gramSchmidt(vecs) {
  const result = [];
  for (let i = 0; i < vecs.length; i++) {
    let v = [...vecs[i]];
    for (let j = 0; j < result.length; j++) {
      const proj = vecScale(vecDot(v, result[j]), result[j]);
      v = [v[0]-proj[0], v[1]-proj[1], v[2]-proj[2]];
    }
    const norm = vecNorm(v);
    if (norm > 1e-10) result.push(vecScale(1/norm, v));
    else result.push(v);
  }
  return result;
}
export function projectOntoSubspace(v, normal) {
  const n = vecNormalize(normal);
  const dot = vecDot(v, n);
  const perp = vecScale(dot, n);
  const proj = [v[0]-perp[0], v[1]-perp[1], v[2]-perp[2]];
  return { proj, perp };
}
