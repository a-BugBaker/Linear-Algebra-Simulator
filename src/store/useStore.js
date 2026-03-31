import { create } from 'zustand';

const useStore = create((set, get) => ({
  currentModule: 0,
  setCurrentModule: (m) => set({ currentModule: m }),
  
  // Global UI
  showGrid: true,
  showLabels: true,
  slowMotion: false,
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleLabels: () => set(s => ({ showLabels: !s.showLabels })),
  toggleSlowMotion: () => set(s => ({ slowMotion: !s.slowMotion })),
  
  // Module 1: Vectors
  vectorU: [2, 1, 0],
  vectorV: [0, 2, 1],
  vectorScalar: 1,
  vectorOperation: 'add',
  spanA: 1,
  spanB: 1,
  setVectorU: (v) => set({ vectorU: v }),
  setVectorV: (v) => set({ vectorV: v }),
  setVectorScalar: (k) => set({ vectorScalar: k }),
  setVectorOperation: (op) => set({ vectorOperation: op }),
  setSpanA: (a) => set({ spanA: a }),
  setSpanB: (b) => set({ spanB: b }),
  
  // Module 2: Matrix
  matrixA: [[1,0,0],[0,1,0],[0,0,1]],
  matrixB: [[1,0,0],[0,1,0],[0,0,1]],
  matrixPreset: 'identity',
  showDeterminant: true,
  setMatrixA: (m) => set({ matrixA: m }),
  setMatrixB: (m) => set({ matrixB: m }),
  setMatrixPreset: (p) => set({ matrixPreset: p }),
  
  // Module 3: Linear Systems
  systemCoeffs: [[2,1,-1],[1,3,2],[-1,1,4]],
  systemRHS: [8, 1, -2],
  setSystemCoeffs: (c) => set({ systemCoeffs: c }),
  setSystemRHS: (b) => set({ systemRHS: b }),
  columnWeights: [1, 0, 0],
  setColumnWeights: (w) => set({ columnWeights: w }),
  
  // Module 4: Eigendecomposition
  eigenMatrix: [[2,1,0],[1,2,0],[0,0,3]],
  eigenStep: 0,
  setEigenMatrix: (m) => set({ eigenMatrix: m }),
  setEigenStep: (s) => set({ eigenStep: s }),
  
  // Module 5: Orthogonality
  orthoVector: [2, 3, 1],
  orthoNormal: [0, 0, 1],
  orthoLeastSquares: false,
  setOrthoVector: (v) => set({ orthoVector: v }),
  setOrthoNormal: (n) => set({ orthoNormal: n }),
  toggleLeastSquares: () => set(s => ({ orthoLeastSquares: !s.orthoLeastSquares })),
  
  // Module 6: Four Subspaces
  subspaceMatrix: [[1,2,0],[2,4,1],[0,0,1]],
  setSubspaceMatrix: (m) => set({ subspaceMatrix: m }),
}));

export default useStore;
