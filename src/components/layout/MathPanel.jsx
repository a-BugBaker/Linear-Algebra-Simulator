import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import useStore from '../../store/useStore';

function KaTeXFormula({ formula, display }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(formula, ref.current, { displayMode: !!display, throwOnError: false });
      } catch(e) {
        if (ref.current) ref.current.textContent = formula;
      }
    }
  }, [formula, display]);
  return <span ref={ref} />;
}

const moduleFormulas = [
  [
    { label: 'Vector', formula: '\\vec{v} = \\begin{bmatrix} x \\\\ y \\\\ z \\end{bmatrix}', display: true },
    { label: 'Magnitude', formula: '\\|\\vec{v}\\| = \\sqrt{x^2+y^2+z^2}', display: true },
    { label: 'Addition', formula: '\\vec{u}+\\vec{v} = \\begin{bmatrix} u_1+v_1 \\\\ u_2+v_2 \\\\ u_3+v_3 \\end{bmatrix}', display: true },
    { label: 'Dot Product', formula: '\\vec{u}\\cdot\\vec{v} = \\|\\vec{u}\\|\\|\\vec{v}\\|\\cos\\theta', display: true },
    { label: 'Cross Product', formula: '\\vec{u}\\times\\vec{v} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}', display: true },
    { label: 'Span', formula: '\\text{Span}\\{\\vec{u},\\vec{v}\\} = \\{a\\vec{u}+b\\vec{v} \\mid a,b\\in\\mathbb{R}\\}', display: true },
  ],
  [
    { label: 'Transform', formula: 'A\\vec{x} = \\vec{x}\'', display: true },
    { label: 'Determinant', formula: '\\det(A) = \\vec{a}_1\\cdot(\\vec{a}_2\\times\\vec{a}_3)', display: true },
    { label: 'Composite', formula: '(AB)\\vec{x} = A(B\\vec{x})', display: true },
    { label: 'Invertible', formula: 'A^{-1}A = AA^{-1} = I', display: true },
  ],
  [
    { label: 'System', formula: 'A\\vec{x} = \\vec{b}', display: true },
    { label: 'Solution', formula: '\\vec{x} = \\vec{x}_p + \\vec{x}_n', display: true },
    { label: 'Column View', formula: 'x_1\\vec{a}_1 + x_2\\vec{a}_2 + x_3\\vec{a}_3 = \\vec{b}', display: true },
  ],
  [
    { label: 'Eigenvalue Eq', formula: 'A\\vec{v} = \\lambda\\vec{v}', display: true },
    { label: 'Char. Equation', formula: '\\det(A-\\lambda I) = 0', display: true },
    { label: 'Diagonalization', formula: 'A = P\\Lambda P^{-1}', display: true },
    { label: 'Matrix Power', formula: 'A^k = P\\Lambda^k P^{-1}', display: true },
  ],
  [
    { label: 'Projection', formula: '\\vec{v}_S = \\vec{v} - (\\vec{n}\\cdot\\vec{v})\\vec{n}', display: true },
    { label: 'Orthogonal', formula: '\\vec{v} = \\vec{v}_S + \\vec{v}_{S^\\perp}', display: true },
    { label: 'Least Squares', formula: 'A^TA\\hat{x} = A^T\\vec{b}', display: true },
    { label: 'Gram-Schmidt', formula: '\\vec{u}_k = \\vec{v}_k - \\sum_{j<k}(\\vec{q}_j\\cdot\\vec{v}_k)\\vec{q}_j', display: true },
  ],
  [
    { label: 'Rank-Nullity', formula: '\\dim C(A^T) + \\dim N(A) = n', display: true },
    { label: 'R^n split', formula: '\\mathbb{R}^n = C(A^T) \\oplus N(A)', display: true },
    { label: 'R^m split', formula: '\\mathbb{R}^m = C(A) \\oplus N(A^T)', display: true },
  ],
];

export default function MathPanel() {
  const { currentModule } = useStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const formulas = moduleFormulas[currentModule] || [];

  return (
    <div className={`fixed top-4 left-4 z-50 transition-all duration-300 ${collapsed ? 'w-12' : 'w-72'}`}>
      <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          {!collapsed && <span className="text-white/80 text-sm font-semibold">Formulas</span>}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-white/60 hover:text-white transition-colors ml-auto"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
        {!collapsed && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {formulas.map((f, i) => (
              <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="text-white/50 text-xs mb-2">{f.label}</div>
                <div className="text-white overflow-x-auto">
                  <KaTeXFormula formula={f.formula} display={f.display} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
