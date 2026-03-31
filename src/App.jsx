import React, { Suspense } from 'react';
import Navigation from './components/layout/Navigation';
import MathPanel from './components/layout/MathPanel';
import Toolbar from './components/layout/Toolbar';
import useStore from './store/useStore';
import VectorEssence from './modules/VectorEssence/index';
import MatrixTransform from './modules/MatrixTransform/index';
import LinearSystems from './modules/LinearSystems/index';
import Eigendecomposition from './modules/Eigendecomposition/index';
import Orthogonality from './modules/Orthogonality/index';
import FourSubspaces from './modules/FourSubspaces/index';

const MODULES = [
  VectorEssence,
  MatrixTransform,
  LinearSystems,
  Eigendecomposition,
  Orthogonality,
  FourSubspaces,
];

export default function App() {
  const { currentModule } = useStore();
  const CurrentModule = MODULES[currentModule];

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a1a]" style={{background: 'radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 70%)'}}>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading...</div>}>
        <CurrentModule />
      </Suspense>
      <MathPanel />
      <Toolbar />
      <Navigation />
    </div>
  );
}
