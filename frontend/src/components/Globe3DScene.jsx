import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Immersive scroll-driven 3D globe scene.
 * - Camera starts far in space, flies through 6 landmark markers on Earth,
 *   then exits toward the stars.
 * - Uses vanilla Three.js (no R3F) for maximum React-version compatibility.
 * - Landmark coordinates + names are read from `locations` prop (same shape as
 *   the /api/destinations/global backend payload).
 *
 * Landmark lat/lng lookup (used inside the component below):
 *   NASA         → 28.5721, -80.6480   (Kennedy Space Center, FL)
 *   Liberty      → 40.6892, -74.0445   (Statue of Liberty, NYC)
 *   Egypt        → 29.9773,  31.1325   (Pyramids of Giza)
 *   Dubai        → 25.1972,  55.2744   (Burj Khalifa)
 *   Singapore    →  1.2830, 103.8607   (Marina Bay)
 *   Malaysia     →  3.1579, 101.7118   (Petronas Towers)
 */
const LATLNG = {
  liberty:    { lat: 40.6892, lng: -74.0445 },
  washington: { lat: 38.8977, lng: -77.0365 },
  nasa:       { lat: 28.5721, lng: -80.648 },
  egypt:      { lat: 29.9773, lng: 31.1325 },
  dubai:      { lat: 25.1972, lng: 55.2744 },
  singapore:  { lat: 1.283,   lng: 103.8607 },
  malaysia:   { lat: 3.1579,  lng: 101.7118 },
};

// Convert lat/lng to xyz on a unit sphere (radius r).
const latLngToVec3 = (lat, lng, r = 1) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
};

export const Globe3DScene = ({ locations = [] }) => {
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer / scene / camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Lights
    scene.add(new THREE.AmbientLight(0x223344, 0.5));
    const sun = new THREE.DirectionalLight(0xfff2d6, 1.6);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x7ec8e3, 0.6);
    rim.position.set(-4, -2, 3);
    scene.add(rim);

    // Star field (large distant sphere with points)
    const starGeom = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 400 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: true, color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    scene.add(stars);

    // Earth group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Load Earth textures (three.js examples CDN — CORS OK)
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const dayMap = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
    const bumpMap = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg");
    const specMap = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg");
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    [dayMap, bumpMap, specMap].forEach((t) => { if (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; } });

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2, 128, 128),
      new THREE.MeshPhongMaterial({
        map: dayMap,
        normalMap: bumpMap,
        specularMap: specMap,
        specular: new THREE.Color(0x555555),
        shininess: 12,
      })
    );
    earthGroup.add(earth);

    // Atmosphere halo (fresnel-ish inverted sphere)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.08, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        uniforms: { uColor: { value: new THREE.Color(0x7ec8e3) } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 uColor;
          void main() {
            float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
            gl_FragColor = vec4(uColor * intensity, intensity);
          }`,
      })
    );
    earthGroup.add(atmosphere);

    // Cloud layer
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.015, 96, 96),
      new THREE.MeshPhongMaterial({
        map: (() => { const c = loader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"); c.anisotropy = maxAniso; return c; })(),
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      })
    );
    earthGroup.add(clouds);

    // Location markers
    const markers = [];
    locations.forEach((loc) => {
      const coord = LATLNG[loc.id];
      if (!coord) return;
      const pos = latLngToVec3(coord.lat, coord.lng, 2.03);

      // Pin sprite (glowing dot)
      const spriteMat = new THREE.SpriteMaterial({
        color: 0xE29578,
        transparent: true,
        opacity: 0.95,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.scale.set(0.14, 0.14, 0.14);
      earthGroup.add(sprite);

      // Halo ring
      const ringMat = new THREE.SpriteMaterial({
        color: 0xE29578,
        transparent: true,
        opacity: 0.4,
      });
      const halo = new THREE.Sprite(ringMat);
      halo.position.copy(pos);
      halo.scale.set(0.32, 0.32, 0.32);
      earthGroup.add(halo);

      // Vertical beacon line
      const beaconEnd = pos.clone().multiplyScalar(1.25);
      const beaconGeom = new THREE.BufferGeometry().setFromPoints([pos, beaconEnd]);
      const beacon = new THREE.Line(
        beaconGeom,
        new THREE.LineBasicMaterial({ color: 0xE29578, transparent: true, opacity: 0.7 })
      );
      earthGroup.add(beacon);

      markers.push({ id: loc.id, pos, halo, sprite, beacon });
    });

    // ---- Scroll-driven camera choreography ----
    // Timeline:
    //  0.00 → 0.10 : intro (far view rotating)
    //  0.10 → 0.85 : fly-through 6 stops (each stop is a segment of length seg)
    //  0.85 → 1.00 : pull back to full earth
    const stops = locations.map((l) => ({
      id: l.id,
      pos: LATLNG[l.id] ? latLngToVec3(LATLNG[l.id].lat, LATLNG[l.id].lng, 3.15) : null,
    })).filter((s) => s.pos);

    const seg = 0.75 / Math.max(1, stops.length);

    const tmpV = new THREE.Vector3();
    const tmpTarget = new THREE.Vector3();

    // Smooth 3-point cubic interpolation between segment start & end
    const smooth = (t) => t * t * (3 - 2 * t);

    const updateCamera = (p) => {
      if (p < 0.1) {
        // Intro: wide orbit
        const t = p / 0.1;
        const angle = t * Math.PI * 0.4;
        const rad = 12 - t * 4; // 12 → 8
        camera.position.set(Math.sin(angle) * rad, 1.6 - t * 0.6, Math.cos(angle) * rad);
        tmpTarget.set(0, 0, 0);
      } else if (p < 0.85 && stops.length > 0) {
        const local = (p - 0.1) / 0.75;
        const idxF = local / seg;
        const idx = Math.min(stops.length - 1, Math.floor(idxF));
        const frac = idxF - idx;
        const prev = idx === 0 ? new THREE.Vector3(0, 0, 8) : stops[idx - 1].pos.clone().multiplyScalar(1.4);
        const target = stops[idx].pos.clone();
        // Approach camera along outward-facing normal at radius 3.15 → 2.6 as we zoom in
        const approach = target.clone().multiplyScalar(1.15); // outside surface
        camera.position.copy(prev).lerp(approach, smooth(frac));
        tmpTarget.copy(target).multiplyScalar(1 / target.length()).multiplyScalar(2.0);
      } else {
        // Pull back
        const t = (p - 0.85) / 0.15;
        const from = stops.length > 0 ? stops[stops.length - 1].pos.clone().multiplyScalar(1.15) : new THREE.Vector3(0, 0, 4);
        const to = new THREE.Vector3(0, 1, 10);
        camera.position.copy(from).lerp(to, smooth(t));
        tmpTarget.set(0, 0, 0);
      }
      camera.lookAt(tmpTarget);
    };

    // Scroll listener
    const onScroll = () => {
      // We treat the entire document scroll as the timeline for the hero pin
      const scene = document.querySelector("[data-scene='globe-hero']");
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const height = scene.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), height);
      const p = height > 0 ? scrolled / height : 0;
      scrollProgressRef.current = p;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Animate loop
    let raf;
    const clock = new THREE.Clock();
    const render = () => {
      const dt = clock.getDelta();
      const p = scrollProgressRef.current;
      updateCamera(p);
      earthGroup.rotation.y += dt * (0.05 + p * 0.15);
      clouds.rotation.y += dt * 0.02;
      // Pulse markers
      const now = performance.now() * 0.003;
      markers.forEach((m, i) => {
        const s = 0.28 + Math.sin(now + i) * 0.08;
        m.halo.scale.set(s, s, s);
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      renderer.dispose();
      earth.geometry.dispose();
      atmosphere.geometry.dispose();
      clouds.geometry.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [locations]);

  return <div ref={containerRef} data-testid="globe-3d-scene" className="absolute inset-0" />;
};
