import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createCoordinateAxes, createGridHelper } from '../../utils/threeUtils';
import useStore from '../../store/useStore';

const SceneSetup = forwardRef(function SceneSetup({ onSceneReady }, ref) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const { showGrid } = useStore();

  useImperativeHandle(ref, () => ({
    getState: () => stateRef.current,
  }));

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x404080, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x6060ff, 0.5, 20);
    pointLight.position.set(-3, 3, -3);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 30;

    const axes = createCoordinateAxes(4);
    scene.add(axes);

    const grid = createGridHelper(10, 20);
    scene.add(grid);
    const gridXZ = createGridHelper(10, 20);
    gridXZ.rotation.x = Math.PI / 2;
    scene.add(gridXZ);

    stateRef.current = { scene, camera, renderer, controls, axes, grid, gridXZ };

    if (onSceneReady) onSceneReady(stateRef.current);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (s.grid) s.grid.visible = showGrid;
    if (s.gridXZ) s.gridXZ.visible = showGrid;
  }, [showGrid]);

  return <div ref={mountRef} className="w-full h-full" />;
});

export default SceneSetup;
