// globe.js — Three.js 3D globe with atmospheric glow, city pins, and imperative animation API.
const { useState: useStG, useEffect: useEffG, useRef: useRefG, useMemo: useMemoG, useImperativeHandle, forwardRef } = React;

function latLonToXYZ(lat, lon, r = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y:  r * Math.cos(phi),
    z:  r * Math.sin(phi) * Math.sin(theta),
  };
}

const Globe3D = forwardRef(function Globe3D({
  cities, size = 340,
  highlightId = null,
  onCityTap,
  autoRotate = true,
  spinning = false,
}, ref) {
  const mountRef = useRefG(null);
  const stateRef = useRefG({});

  useEffG(() => {
    let mounted = true;
    let cleanup = () => {};

    const ensureThree = () => new Promise((resolve) => {
      if (window.THREE) return resolve(window.THREE);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      s.onload = () => resolve(window.THREE);
      document.head.appendChild(s);
    });

    ensureThree().then((THREE) => {
      if (!mounted || !mountRef.current) return;

      const W = size, H = size;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 3.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);
      renderer.domElement.style.cursor = 'grab';
      renderer.domElement.style.touchAction = 'none';

      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      const earthTex = loader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg');
      earthTex.colorSpace = THREE.SRGBColorSpace;

      const earthGeom = new THREE.SphereGeometry(1, 96, 96);
      const earthMat = new THREE.MeshPhongMaterial({
        map: earthTex,
        specular: new THREE.Color(0x2b3a5c),
        shininess: 18,
      });
      const earth = new THREE.Mesh(earthGeom, earthMat);
      scene.add(earth);

      const tintGeom = new THREE.SphereGeometry(1.001, 64, 64);
      const tintMat = new THREE.MeshBasicMaterial({
        color: 0x0a1430, transparent: true, opacity: 0.35, blending: THREE.MultiplyBlending,
      });
      const tint = new THREE.Mesh(tintGeom, tintMat);
      scene.add(tint);

      const atmoGeom = new THREE.SphereGeometry(1.18, 64, 64);
      const atmoMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { glowColor: { value: new THREE.Color(0x6fb6ff) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `,
      });
      const atmo = new THREE.Mesh(atmoGeom, atmoMat);
      scene.add(atmo);

      const ambient = new THREE.AmbientLight(0x6688aa, 0.55);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xfff2d6, 1.4);
      sun.position.set(2.5, 1.0, 2.0);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x4a7cff, 0.6);
      rim.position.set(-3, -1, -2);
      scene.add(rim);

      const group = new THREE.Group();
      scene.add(group);
      group.add(earth);
      group.add(tint);
      group.rotation.y = -1.6;
      group.rotation.x = -0.35;

      const pinGroup = new THREE.Group();
      group.add(pinGroup);

      const pinObjs = cities.map((c) => {
        const pos = latLonToXYZ(c.lat, c.lon, 1.0);
        const isHi = c.id === highlightId;
        const pinMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.012, 16, 16),
          new THREE.MeshBasicMaterial({ color: isHi ? 0xffd9a0 : 0xeaf4ff })
        );
        pinMesh.position.set(pos.x * 1.012, pos.y * 1.012, pos.z * 1.012);
        pinMesh.userData.city = c;
        pinGroup.add(pinMesh);

        const haloMat = new THREE.SpriteMaterial({
          map: makeHaloTexture(THREE, isHi ? '#ffd9a0' : '#9dd0ff'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.set(0.09, 0.09, 1);
        halo.position.copy(pinMesh.position);
        halo.userData.city = c;
        halo.userData.baseScale = 0.09;
        halo.userData.highlight = isHi;
        pinGroup.add(halo);
        return { city: c, mesh: pinMesh, halo };
      });

      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const drag = { active: false, lastX: 0, lastY: 0, vx: 0, vy: 0, moved: 0 };

      const onPointerDown = (e) => {
        drag.active = true;
        drag.lastX = e.clientX; drag.lastY = e.clientY;
        drag.moved = 0;
        renderer.domElement.style.cursor = 'grabbing';
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (!drag.active) return;
        const dx = e.clientX - drag.lastX;
        const dy = e.clientY - drag.lastY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        group.rotation.y += dx * 0.0055;
        group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + dy * 0.0055));
        drag.vx = dx * 0.0055;
        drag.vy = dy * 0.0055;
        drag.lastX = e.clientX; drag.lastY = e.clientY;
      };
      const onPointerUp = (e) => {
        if (!drag.active) return;
        drag.active = false;
        renderer.domElement.style.cursor = 'grab';
        if (drag.moved < 6) {
          const rect = renderer.domElement.getBoundingClientRect();
          ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          ray.setFromCamera(ndc, camera);
          const hits = ray.intersectObjects(pinObjs.map(p => p.mesh), false);
          if (hits.length > 0) {
            const c = hits[0].object.userData.city;
            if (c && onCityTap) onCityTap(c);
          } else {
            const rect2 = renderer.domElement.getBoundingClientRect();
            const px = e.clientX - rect2.left;
            const py = e.clientY - rect2.top;
            let best = null, bestD = 999;
            pinObjs.forEach(p => {
              const v = p.mesh.position.clone().applyMatrix4(group.matrixWorld).project(camera);
              const sx = (v.x + 1) / 2 * rect2.width;
              const sy = (1 - (v.y + 1) / 2) * rect2.height;
              const dpx = Math.hypot(sx - px, sy - py);
              if (v.z < 1 && dpx < bestD) { bestD = dpx; best = p.city; }
            });
            if (best && bestD < 26 && onCityTap) onCityTap(best);
          }
        }
      };
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);

      let raf;
      let auto = autoRotate;
      stateRef.current = {
        THREE, scene, camera, renderer, group, pinObjs,
        spinning: false,
        setAutoRotate: (v) => { auto = v; },
        setSpinning: (v) => { stateRef.current.spinning = v; },
        glideTo: (yaw, pitch, duration = 800) => {
          const startY = group.rotation.y, startX = group.rotation.x;
          let dy = yaw - startY;
          while (dy > Math.PI) dy -= 2 * Math.PI;
          while (dy < -Math.PI) dy += 2 * Math.PI;
          const dx = pitch - startX;
          const t0 = performance.now();
          stateRef.current._tween = (t) => {
            const k = Math.min(1, (t - t0) / duration);
            const e = 1 - Math.pow(1 - k, 3);
            group.rotation.y = startY + dy * e;
            group.rotation.x = startX + dx * e;
            return k < 1;
          };
        },
        spinTo: (yaw, pitch, duration = 2400, revolutions = 3) => {
          const startY = group.rotation.y, startX = group.rotation.x;
          let dy = yaw - startY;
          while (dy > Math.PI) dy -= 2 * Math.PI;
          while (dy < -Math.PI) dy += 2 * Math.PI;
          const totalY = dy + revolutions * 2 * Math.PI;
          const dx = pitch - startX;
          const t0 = performance.now();
          stateRef.current._tween = (t) => {
            const k = Math.min(1, (t - t0) / duration);
            const e = 1 - Math.pow(1 - k, 4);
            group.rotation.y = startY + totalY * e;
            group.rotation.x = startX + dx * e;
            return k < 1;
          };
        },
        setHighlight: (id) => {
          pinObjs.forEach(p => {
            const isHi = p.city.id === id;
            p.mesh.material.color.setHex(isHi ? 0xffd9a0 : 0xeaf4ff);
            p.halo.material.map = makeHaloTexture(THREE, isHi ? '#ffd9a0' : '#9dd0ff');
            p.halo.userData.highlight = isHi;
          });
        },
      };

      const tick = () => {
        const t = performance.now();
        if (stateRef.current._tween) {
          const cont = stateRef.current._tween(t);
          if (!cont) stateRef.current._tween = null;
        } else if (auto && !drag.active && !stateRef.current.spinning) {
          group.rotation.y += 0.0008;
          if (Math.abs(drag.vx) > 0.0001 || Math.abs(drag.vy) > 0.0001) {
            group.rotation.y += drag.vx;
            group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + drag.vy));
            drag.vx *= 0.94;
            drag.vy *= 0.94;
          }
        }
        pinObjs.forEach((p, i) => {
          const phase = (t * 0.0015 + i * 0.4) % 1;
          const s = p.halo.userData.baseScale * (1 + 0.3 * Math.sin(phase * Math.PI * 2));
          p.halo.scale.set(s, s, 1);
          p.halo.material.opacity = p.halo.userData.highlight ? 0.95 : 0.75;
          const worldPos = p.mesh.getWorldPosition(new THREE.Vector3());
          const camDir = camera.position.clone().normalize();
          const facing = worldPos.clone().normalize().dot(camDir);
          const visible = facing > -0.05;
          p.mesh.visible = visible;
          p.halo.visible = visible;
          if (visible) p.halo.material.opacity *= Math.max(0, Math.min(1, (facing + 0.1) * 2));
        });
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        renderer.dispose();
        if (mountRef.current) mountRef.current.innerHTML = '';
      };
    });

    return () => { mounted = false; cleanup(); };
  }, [size]);

  useEffG(() => {
    if (stateRef.current.setHighlight) stateRef.current.setHighlight(highlightId);
  }, [highlightId]);

  useImperativeHandle(ref, () => ({
    glideToCity: (city, duration) => {
      if (!stateRef.current.glideTo) return;
      const yp = computeYPForCity(city);
      stateRef.current.glideTo(yp.yaw, yp.pitch, duration);
    },
    spinToCity: (city, duration, revolutions) => {
      if (!stateRef.current.spinTo) return;
      const yp = computeYPForCity(city);
      stateRef.current.setSpinning(true);
      stateRef.current.spinTo(yp.yaw, yp.pitch, duration, revolutions);
      setTimeout(() => stateRef.current.setSpinning(false), duration);
    },
  }), []);

  return (
    <div ref={mountRef} style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      width: size, height: size,
    }}/>
  );
});

function computeYPForCity(city) {
  const p = latLonToXYZ(city.lat, city.lon, 1.0);
  const yaw = Math.atan2(p.x, p.z);
  const z2 = Math.sqrt(p.x * p.x + p.z * p.z);
  const y2 = p.y;
  const pitch = Math.atan2(y2, z2);
  return { yaw: -yaw, pitch: -pitch };
}

function makeHaloTexture(THREE, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, color);
  grd.addColorStop(0.25, color + 'cc');
  grd.addColorStop(0.6, color + '22');
  grd.addColorStop(1, color + '00');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

window.Globe = Globe3D;
window.Globe3D = Globe3D;
window.computeYPForCity = computeYPForCity;
