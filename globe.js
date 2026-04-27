/* =================================================================
 *  3D Globe — Three.js
 *  - 真實地球紋理 (jsdelivr GitHub mirror, 帶 fallback)
 *  - 大氣輝光 shader
 *  - 星空背景
 *  - 大圓 (great-circle) 弧線 + 飛行頭部光點動畫
 *  - 起點 (台北) 永遠固定，終點隨 app.js 計算結果切換
 *  - OrbitControls + auto-rotate
 *  - 切換目的地時相機平滑 tween 到弧線中點
 * ================================================================= */
(function () {
  const D = window.THSR_DATA;
  let scene, camera, renderer, controls;
  let earthMesh, atmosphere;
  let mountEl;
  let arcGroup, markersGroup;
  const RADIUS = 1;
  let cameraTween = null;
  let initialized = false;

  function latLonToVec3(lat, lon, r) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lon + 180) * Math.PI) / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function init() {
    if (initialized) return;
    mountEl = document.getElementById('globe');
    if (!mountEl) return;

    const w = mountEl.clientWidth || 480;
    const h = mountEl.clientHeight || 380;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
    camera.position.set(0, 0.6, 2.8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mountEl.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0x9fb0d1, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x4ed7ff, 0.35);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    // Stars
    addStars();

    // Earth (start with stylized fallback, swap in real texture once loaded)
    const earthGeo = new THREE.SphereGeometry(RADIUS, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a4480,
      emissive: 0x081834,
      emissiveIntensity: 0.5,
      shininess: 18,
      specular: 0x335577,
    });
    earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Subtle wireframe overlay (lat/lon grid)
    const grid = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(RADIUS * 1.001, 24, 16)),
      new THREE.LineBasicMaterial({ color: 0x4ed7ff, transparent: true, opacity: 0.08 })
    );
    earthMesh.add(grid);

    // Try to upgrade to a real Earth texture
    const tl = new THREE.TextureLoader();
    tl.crossOrigin = 'anonymous';
    const tex = tl.load(
      'lib/earth.jpg',
      () => {
        earthMat.map = tex;
        earthMat.color.set(0xffffff);
        earthMat.emissive.set(0x000000);
        earthMat.emissiveIntensity = 0;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {/* keep stylized fallback */}
    );

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(RADIUS * 1.06, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color(0x4ed7ff) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(uColor, 1.0) * intensity;
        }
      `,
    });
    atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    // Groups
    markersGroup = new THREE.Group();
    arcGroup = new THREE.Group();
    earthMesh.add(markersGroup);  // markers/arcs ride along with earth rotation
    earthMesh.add(arcGroup);

    // Controls
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.45;
      controls.zoomSpeed = 0.6;
      controls.enablePan = false;
      controls.minDistance = 1.5;
      controls.maxDistance = 5.5;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.45;
    }

    // Always show Taipei marker
    placeMarker(D.TAIPEI.lat, D.TAIPEI.lon, 0xed5c32, 'taipei');

    window.addEventListener('resize', onResize);
    initialized = true;
    animate();
  }

  function addStars() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for (let i = 0; i < 1800; i++) {
      const r = 60;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      pos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.75,
    });
    scene.add(new THREE.Points(geo, mat));
  }

  function placeMarker(lat, lon, color, kind) {
    const v = latLonToVec3(lat, lon, RADIUS * 1.005);

    // Surface dot
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 16, 16),
      new THREE.MeshBasicMaterial({ color })
    );
    dot.position.copy(v);
    dot.userData = { kind: 'dot' };
    markersGroup.add(dot);

    // Pulsing halo
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
    );
    halo.position.copy(v);
    halo.userData = { kind: 'halo', t: Math.random() * Math.PI * 2 };
    markersGroup.add(halo);

    // Antenna
    const v2 = v.clone().multiplyScalar(1.10);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([v, v2]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
    line.userData = { kind: 'antenna' };
    markersGroup.add(line);
  }

  function clearGroup(g) {
    while (g.children.length) {
      const c = g.children[0];
      g.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
        else c.material.dispose();
      }
    }
  }

  function buildArc(from, to, color = 0xffd2b9) {
    const v1 = latLonToVec3(from.lat, from.lon, RADIUS);
    const v2 = latLonToVec3(to.lat, to.lon, RADIUS);
    const angle = v1.angleTo(v2);
    const lift = 0.18 + Math.min(angle / Math.PI, 1) * 0.55;

    const segments = 96;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const sinA = Math.sin(angle) || 1e-6;
      const a = Math.sin((1 - t) * angle) / sinA;
      const b = Math.sin(t * angle) / sinA;
      const p = new THREE.Vector3(
        a * v1.x + b * v2.x,
        a * v1.y + b * v2.y,
        a * v1.z + b * v2.z
      );
      const liftFactor = 1 + lift * Math.sin(Math.PI * t);
      p.multiplyScalar(liftFactor);
      points.push(p);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, segments, 0.0055, 8, false);
    const arcMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,  // fade in
    });
    const arcMesh = new THREE.Mesh(tubeGeo, arcMat);
    arcMesh.userData = { kind: 'arc', fadeIn: 0 };
    arcGroup.add(arcMesh);

    // Traveling head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    head.userData = { kind: 'head', t: 0, points };
    arcGroup.add(head);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.052, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd2b9, transparent: true, opacity: 0.45 })
    );
    glow.userData = { kind: 'headGlow', t: 0, points };
    arcGroup.add(glow);
  }

  function setDestination(toCity) {
    if (!initialized) {
      // queue until init done
      window.__pendingDest = toCity;
      return;
    }
    clearGroup(markersGroup);
    clearGroup(arcGroup);
    placeMarker(D.TAIPEI.lat, D.TAIPEI.lon, 0xed5c32, 'taipei');
    if (toCity) {
      placeMarker(toCity.lat, toCity.lon, 0x4ed7ff, 'destination');
      buildArc(D.TAIPEI, toCity);
      focusOn(toCity);
    }
  }

  function focusOn(toCity) {
    const v1 = latLonToVec3(D.TAIPEI.lat, D.TAIPEI.lon, 1);
    const v2 = latLonToVec3(toCity.lat, toCity.lon, 1);
    const mid = v1.clone().add(v2);
    if (mid.length() < 1e-6) mid.copy(v1);  // antipode safeguard
    mid.normalize();

    // Account for earth's current rotation
    const worldMid = mid.clone().applyMatrix4(earthMesh.matrixWorld);
    const dist = camera.position.length();
    const target = worldMid.clone().normalize().multiplyScalar(Math.max(2.4, dist));

    cameraTween = {
      from: camera.position.clone(),
      to: target,
      start: performance.now(),
      duration: 1400,
    };
  }

  function onResize() {
    if (!renderer) return;
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight || 380;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // Halo pulse
    markersGroup.children.forEach((m) => {
      if (m.userData.kind === 'halo') {
        m.userData.t += dt * 2.4;
        const s = 1 + Math.sin(m.userData.t) * 0.45;
        m.scale.setScalar(s);
        m.material.opacity = 0.45 - 0.32 * (s - 0.55);
      }
    });

    // Arc head travel + arc fade-in
    arcGroup.children.forEach((obj) => {
      if (obj.userData.kind === 'arc') {
        if (obj.userData.fadeIn < 1) {
          obj.userData.fadeIn = Math.min(1, obj.userData.fadeIn + dt * 1.2);
          obj.material.opacity = obj.userData.fadeIn * 0.85;
        }
      }
      if (obj.userData.kind === 'head' || obj.userData.kind === 'headGlow') {
        obj.userData.t += dt * 0.35;
        const t = obj.userData.t % 1;
        const pts = obj.userData.points;
        const idxF = t * (pts.length - 1);
        const idx = Math.floor(idxF);
        const frac = idxF - idx;
        const next = Math.min(idx + 1, pts.length - 1);
        obj.position.copy(pts[idx]).lerp(pts[next], frac);
        if (obj.userData.kind === 'headGlow') {
          const s = 1 + Math.sin(obj.userData.t * 6) * 0.25;
          obj.scale.setScalar(s);
        }
      }
    });

    // Camera tween
    if (cameraTween) {
      const k = Math.min((performance.now() - cameraTween.start) / cameraTween.duration, 1);
      const ease = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(cameraTween.from, cameraTween.to, ease);
      camera.lookAt(0, 0, 0);
      if (k >= 1) cameraTween = null;
    }

    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  // Public API
  window.GLOBE = { init, setDestination };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      if (window.__pendingDest) setDestination(window.__pendingDest);
    });
  } else {
    init();
    if (window.__pendingDest) setDestination(window.__pendingDest);
  }
})();
