import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export async function initSkyline() {
  const container = document.getElementById('skyline-viewer');
  const status = document.getElementById('skyline-status');
  let renderer;
  let controls;
  let model;
  let resize;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 10000);
    scene.add(new THREE.HemisphereLight(0xd7eeff, 0x263346, 1.5));
    const keyLight = new THREE.DirectionalLight(0xffedce, 3);
    keyLight.position.set(-100, 200, 150);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x76bfff, 2);
    rimLight.position.set(100, 60, -100);
    scene.add(rimLight);

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(container.dataset.model);
    model = gltf.scene;
    scene.add(model);

    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI / 2;
    const render = () => renderer.render(scene, camera);

    function resetView() {
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const direction = new THREE.Vector3(1, 0.9, 0.65).normalize();
      const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
      const up = new THREE.Vector3().crossVectors(direction, right);
      let distance = 0;
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            const corner = new THREE.Vector3(x, y, z).sub(center);
            distance = Math.max(distance,
              Math.abs(corner.dot(right)) / Math.tan(horizontalFov / 2) + corner.dot(direction),
              Math.abs(corner.dot(up)) / Math.tan(verticalFov / 2) + corner.dot(direction));
          }
        }
      }
      distance *= 1.12;
      camera.position.copy(center).add(direction.multiplyScalar(distance));
      camera.near = distance / 100;
      camera.far = distance * 10;
      camera.updateProjectionMatrix();
      controls.target.copy(center);
      controls.minDistance = size.length() * 0.2;
      controls.maxDistance = distance * 3;
      controls.update();
      render();
    }

    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Interactive GitHub contribution skyline, 2008 to 2026');
    canvas.setAttribute('aria-describedby', 'skyline-status');
    canvas.addEventListener('keydown', (event) => {
      const angles = { ArrowLeft: -0.1, ArrowRight: 0.1, ArrowUp: -0.1, ArrowDown: 0.1 };
      if (Object.hasOwn(angles, event.key)) {
        event.preventDefault();
        const offset = camera.position.clone().sub(controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') spherical.theta += angles[event.key];
        else spherical.phi = THREE.MathUtils.clamp(spherical.phi + angles[event.key], 0.1, Math.PI / 2);
        camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
        controls.update();
      } else if (event.key === '+' || event.key === '=' || event.key === '-') {
        event.preventDefault();
        const offset = camera.position.clone().sub(controls.target);
        offset.multiplyScalar(event.key === '-' ? 1.1 : 0.9);
        offset.clampLength(controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(offset);
        controls.update();
      } else if (event.key === 'Home') {
        event.preventDefault();
        resetView();
      }
    });
    controls.addEventListener('change', render);
    resize = new ResizeObserver(() => {
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      resetView();
    });

    container.append(canvas);
    document.getElementById('skyline-poster').hidden = true;
    resetView();
    resize.observe(container);
    const reset = document.getElementById('skyline-reset');
    reset.hidden = false;
    reset.addEventListener('click', resetView);
    status.textContent = 'Drag to orbit and scroll or pinch to zoom. With the view focused, use arrow keys to orbit, + or - to zoom, and Home to reset.';
    canvas.focus({ preventScroll: true });
  } catch (error) {
    resize?.disconnect();
    controls?.dispose();
    renderer?.domElement.remove();
    renderer?.dispose();
    document.getElementById('skyline-poster').hidden = false;
    document.getElementById('skyline-reset').hidden = true;
    model?.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    throw error;
  }
}
