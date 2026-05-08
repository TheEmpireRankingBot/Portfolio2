// globe.js — Three.js 3D globe. Refined: bigger pins, hover labels, larger
// hit areas, multiple texture sources with fallback, atmospheric improvements.

const { useState: useStG, useEffect: useEffG, useRef: useRefG, useImperativeHandle, forwardRef } = React;

function latLonToXYZ(lat, lon, r = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y:  r * Math.cos(phi),
    z:  r * Math.sin(phi) * Math.sin(theta),
  };
}

// Texture sources, tried in order. If all fail we fall back to a procedural ocean.
const TEXTURE_SOURCES = [
  'https://cdn.jsdelivr.net/gh/turban/webgl-earth@master/images/2_no_clouds_4k.jpg',
  'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
];

function loadTextureWithFallback(THREE, sources) {
  return new Promise((resolve) => {
    const tryLoad = (i) => {
      if (i >= sources.length) {
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 512;
        const g = c.getContext('2d');
        const grd = g.createLinearGradient(0, 0, 0, 512);
        grd.addColorStop(0, '#0a1f48');
        grd.addColorStop(0.5, '#0d3a78');
        grd.addColorStop(1, '#091a3c');
        g.fillStyle = grd; g.fillRect(0, 0, 1024, 512);
        g.fillStyle = '#1a4a2e';
        [[200,180,140,80],[450,150,90,60],[600,300,110,70],[850,200,80,55],[150,360,70,40],[700,400,150,60]].forEach(([x,y,w,h])=>{
          g.beginPath(); g.ellipse(x,y,w,h,0,0,Math.PI*2); g.fill();
        });
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return resolve(tex);
      }
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      loader.load(
        sources[i],
        (tex) => { tex.colorSpace = THREE.SRGBColorSpace; resolve(tex); },
        undefined,
        () => tryLoad(i + 1),
      );
    };
    tryLoad(0);
  });
}

const Globe3D = forwardRef(function Globe3D({
  cities, size = 340,
  highlightId = null,
  onCityTap,
  onCityHover,
  autoRotate = true,
}, ref) {
  const mountRef = useRefG(null);
  const stateRef = useRefG({});
  const [hoveredCity, setHoveredCity] = useStG(null);
  const [hoverPos, setHoverPos] = useStG({ x: 0, y: 0 });
  const [loaded, setLoaded] = useStG(false);

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

    ensureThree().then(async (THREE) => {
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

      const earthTex = await loadTextureWithFallback(THREE, TEXTURE_SOURCES);

      const earthGeom = new THREE.SphereGeometry(1, 96, 96);
      const earthMat = new THREE.MeshPhongMaterial({
        map: earthTex,
        specular: new THREE.Color(0x3a5b8c),
        shininess: 24,
      });
      const earth = new THREE.Mesh(earthGeom, earthMat);
      scene.add(earth);

      const tintGeom = new THREE.SphereGeometry(1.001, 64, 64);
      const tintMat = new THREE.MeshBasicMaterial({
        color: 0x081232, transparent: true, opacity: 0.32, blending: THREE.MultiplyBlending,
      });
      const tint = new THREE.Mesh(tintGeom, tintMat);
      scene.add(tint);

      const innerGeom = new THREE.SphereGeometry(1.022, 64, 64);
      const innerMat = new THREE.ShaderMaterial({
        transparent: true, side: THREE.FrontSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { glowColor: { value: new THREE.Color(0x9dd0ff) } },
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; void main() { float intensity = pow(1.0 - dot(vNormal, vec3(0.0,0.0,1.0)), 8.0) * 0.45; gl_FragColor = vec4(glowColor, intensity); }`,
      });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      scene.add(inner);

      const atmoGeom = new THREE.SphereGeometry(1.22, 64, 64);
      const atmoMat = new THREE.ShaderMaterial({
        transparent: true, side: THREE.BackSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
        uniforms: { glowColor: { value: new THREE.Color(0x7fbcff) } },
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; void main() { float intensity = pow(0.74 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(glowColor, 1.0) * intensity; }`,
      });
      const atmo = new THREE.Mesh(atmoGeom, atmoMat);
      scene.add(atmo);

      scene.add(new THREE.AmbientLight(0x6a86b0, 0.6));
      const sun = new THREE.DirectionalLight(0xfff0d8, 1.45);
      sun.position.set(2.6, 1.0, 2.0);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x4a7cff, 0.55);
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

      const HIT_RADIUS = 0.06;
      const PIN_RADIUS = 0.018;
      const HALO_SCALE = 0.14;

      const pinObjs = cities.map((c) => {
        const pos = latLonToXYZ(c.lat, c.lon, 1.0);
        const isHi = c.id === highlightId;

        const pinMesh = new THREE.Mesh(
          new THREE.SphereGeometry(PIN_RADIUS, 18, 18),
          new THREE.MeshBasicMaterial({ color: isHi ? 0xffd9a0 : 0xeaf4ff }),
        );
        pinMesh.position.set(pos.x * 1.018, pos.y * 1.018, pos.z * 1.018);
        pinMesh.userData.city = c;
        pinGroup.add(pinMesh);

        const hitMesh = new THREE.Mesh(
          new THREE.SphereGeometry(HIT_RADIUS, 12, 12),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        hitMesh.position.copy(pinMesh.position);
        hitMesh.userData.city = c;
        pinGroup.add(hitMesh);

        const haloMat = new THREE.SpriteMaterial({
          map: makeHaloTexture(THREE, isHi ? '#ffd9a0' : '#9dd0ff'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.set(HALO_SCALE, HALO_SCALE, 1);
        halo.position.copy(pinMesh.position);
        halo.userData.city = c;
        halo.userData.baseScale = HALO_SCALE;
        halo.userData.highlight = isHi;
        pinGroup.add(halo);

        const ringMat = new THREE.SpriteMaterial({
          map: makeRingTexture(THREE, '#ffd9a0'),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: isHi ? 1 : 0,
        });
        const ring = new THREE.Sprite(ringMat);
        ring.scale.set(0.22, 0.22, 1);
        ring.position.copy(pinMesh.position);
        pinGroup.add(ring);

        return { city: c, mesh: pinMesh, hit: hitMesh, halo, ring };
      });

      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();

      const drag = { active: false, lastX: 0, lastY: 0, vx: 0, vy: 0, moved: 0 };
      let hoveredId = null;

      const screenPosOf = (mesh, rect) => {
        const v = mesh.position.clone().applyMatrix4(group.matrixWorld).project(camera);
        return { x: (v.x + 1) / 2 * rect.width, y: (1 - (v.y + 1) / 2) * rect.height, z: v.z };
      };

      const updateHover = (e) => {
        if (drag.active) return;
        const rect = renderer.domElement.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(pinObjs.map(p => p.hit), false);
        let foundCity = null;
        if (hits.length > 0) {
          foundCity = hits[0].object.userData.city;
        } else {
          let bestD = 999, best = null;
          pinObjs.forEach(p => {
            const sp = screenPosOf(p.mesh, rect);
            if (sp.z >= 1) return;
            const d = Math.hypot(sp.x - (e.clientX - rect.left), sp.y - (e.clientY - rect.top));
            if (d < bestD) { bestD = d; best = p.city; }
          });
          if (best && bestD < 28) foundCity = best;
        }
        if (foundCity?.id !== hoveredId) {
          hoveredId = foundCity?.id || null;
          setHoveredCity(foundCity);
          if (onCityHover) onCityHover(foundCity);
          renderer.domElement.style.cursor = foundCity ? 'pointer' : 'grab';
        }
        if (foundCity) {
          const p = pinObjs.find(p => p.city.id === foundCity.id);
          if (p) {
            const sp = screenPosOf(p.mesh, rect);
            setHoverPos({ x: sp.x, y: sp.y });
          }
        }
      };

      const onPointerDown = (e) => {
        drag.active = true;
        drag.lastX = e.clientX; drag.lastY = e.clientY; drag.moved = 0;
        renderer.domElement.style.cursor = 'grabbing';
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (drag.active) {
          const dx = e.clientX - drag.lastX, dy = e.clientY - drag.lastY;
          drag.moved += Math.abs(dx) + Math.abs(dy);
          group.rotation.y += dx * 0.0055;
          group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + dy * 0.0055));
          drag.vx = dx * 0.0055;
          drag.vy = dy * 0.0055;
          drag.lastX = e.clientX; drag.lastY = e.clientY;
          if (hoveredId) { hoveredId = null; setHoveredCity(null); if (onCityHover) onCityHover(null); }
        } else {
          updateHover(e);
        }
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
          const hits = ray.intersectObjects(pinObjs.map(p => p.hit), false);
          if (hits.length > 0) {
            const c = hits[0].object.userData.city;
            if (c && onCityTap) onCityTap(c);
          } else {
            const px = e.clientX - rect.left, py = e.clientY - rect.top;
            let best = null, bestD = 999;
            pinObjs.forEach(p => {
              const sp = screenPosOf(p.mesh, rect);
              if (sp.z >= 1) return;
              const d = Math.hypot(sp.x - px, sp.y - py);
              if (d < bestD) { bestD = d; best = p.city; }
            });
            if (best && bestD < 40 && onCityTap) onCityTap(best);
          }
        }
      };
      const onLeave = () => {
        if (hoveredId) { hoveredId = null; setHoveredCity(null); if (onCityHover) onCityHover(null); }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointerleave', onLeave);
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
            p.ring.material.opacity = isHi ? 1 : 0;
          });
        },
      };
      stateRef.current._currentHover = () => hoveredId;

      const tick = () => {
        const t = performance.now();
        if (stateRef.current._tween) {
          const cont = stateRef.current._tween(t);
          if (!cont) stateRef.current._tween = null;
        } else if (auto && !drag.active && !stateRef.current.spinning && !hoveredId) {
          group.rotation.y += 0.0008;
          if (Math.abs(drag.vx) > 0.0001 || Math.abs(drag.vy) > 0.0001) {
            group.rotation.y += drag.vx;
            group.rotation.x = Math.max(-1.1, Math.min(1.1, group.rotation.x + drag.vy));
            drag.vx *= 0.94; drag.vy *= 0.94;
          }
        }

        pinObjs.forEach((p, i) => {
          const isHovered = p.city.id === hoveredId;
          const phase = (t * 0.0015 + i * 0.4) % 1;
          const baseS = p.halo.userData.baseScale;
          const pulse = 1 + 0.3 * Math.sin(phase * Math.PI * 2);
          const targetS = (isHovered ? 1.6 : 1) * baseS * pulse;
          p.halo.scale.set(targetS, targetS, 1);
          p.halo.material.opacity = (p.halo.userData.highlight || isHovered) ? 0.95 : 0.7;

          if (isHovered) {
            p.ring.material.opacity = 0.85;
            const ringS = 0.26 + 0.04 * Math.sin(t * 0.005);
            p.ring.scale.set(ringS, ringS, 1);
          } else if (!p.halo.userData.highlight) {
            p.ring.material.opacity = 0;
          }

          const worldPos = p.mesh.getWorldPosition(new THREE.Vector3());
          const camDir = camera.position.clone().normalize();
          const facing = worldPos.clone().normalize().dot(camDir);
          const visible = facing > -0.05;
          p.mesh.visible = visible;
          p.halo.visible = visible;
          p.ring.visible = visible;
          if (visible) p.halo.material.opacity *= Math.max(0, Math.min(1, (facing + 0.1) * 2));
        });

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();
      setLoaded(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointerleave', onLeave);
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
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: size, height: size }}>
      <div ref={mountRef} style={{ width: size, height: size, position: 'absolute', inset: 0 }}/>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(244,217,166,0.65)', fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>Loading the world…</div>
      )}
      {hoveredCity && (
        <div style={{
          position: 'absolute',
          left: hoverPos.x, top: hoverPos.y - 28,
          transform: 'translate(-50%, -100%)',
          padding: '7px 12px',
          background: 'rgba(8,12,28,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(244,217,166,0.5)',
          borderRadius: 12,
          fontFamily: '"Inter Tight", sans-serif',
          color: '#fff', fontSize: 12, fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          letterSpacing: 0.3,
          animation: 'tooltipIn 180ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <span style={{ fontSize: 14, marginRight: 6 }}>{hoveredCity.flag}</span>
          {hoveredCity.name}
          <span style={{ color: 'rgba(244,217,166,0.85)', marginLeft: 6, fontWeight: 500 }}>· {hoveredCity.country}</span>
        </div>
      )}
    </div>
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
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRingTexture(THREE, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = color;
  g.lineWidth = 3;
  g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1; g.globalAlpha = 0.4;
  g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

window.Globe = Globe3D;
window.Globe3D = Globe3D;
window.computeYPForCity = computeYPForCity;
