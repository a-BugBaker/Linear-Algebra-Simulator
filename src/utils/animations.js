import gsap from 'gsap';

export const DURATION = { fast: 0.4, normal: 0.8, slow: 1.5 };

export function animateVector(arrow, targetDir, targetLen, duration, onComplete) {
  const proxy = { progress: 0 };
  gsap.to(proxy, {
    progress: 1,
    duration: duration || DURATION.normal,
    ease: 'power2.inOut',
    onUpdate: () => {},
    onComplete,
  });
  return proxy;
}

export function fadeIn(obj, duration) {
  if (!obj.material) return;
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  mats.forEach(m => {
    gsap.fromTo(m, { opacity: 0 }, { opacity: m._targetOpacity || 1, duration: duration || DURATION.normal });
  });
}

export function scaleIn(obj, duration) {
  obj.scale.set(0.001, 0.001, 0.001);
  gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: duration || DURATION.normal, ease: 'back.out(1.7)' });
}

export function pulseHighlight(obj, color, duration) {
  const proxy = { t: 0 };
  gsap.to(proxy, {
    t: 1, duration: duration || 0.5, yoyo: true, repeat: 3,
    ease: 'sine.inOut',
    onUpdate: () => {
      if (obj.material) obj.material.emissiveIntensity = proxy.t * 0.8;
    }
  });
}
