
const T = THREE,
  V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z),
  $ = (id) => document.getElementById(id);
$('introT').textContent = 'Happy Princess Day 👑';
$('note').textContent = CONFIG.note;

const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new T.Scene();
{
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const x = c.getContext('2d'),
    g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#070b26');
  g.addColorStop(0.5, '#241a5a');
  g.addColorStop(1, '#6a3a7c');
  x.fillStyle = g;
  x.fillRect(0, 0, 2, 256);
  scene.background = new T.CanvasTexture(c);
}
scene.fog = new T.Fog(0x1b1546, 60, 190);
const camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);
scene.add(new T.HemisphereLight(0x7f8cf0, 0x2b3f55, 0.6));
const sun = new T.DirectionalLight(0xaebcff, 0.65);
sun.position.set(-25, 50, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, far: 160 });
scene.add(sun);

/* ---------- helpers ---------- */
const M = (c, o = {}) =>
  new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85, ...o });
const add = (p, geo, mat, x = 0, y = 0, z = 0) => {
  const m = new T.Mesh(geo, mat);
  m.position.set(x, y, z);
  p.add(m);
  return m;
};
const Cy = (a, b, h, s = 8) => new T.CylinderGeometry(a, b, h, s),
  Bx = (w, h, d) => new T.BoxGeometry(w, h, d),
  Sp = (r, s = 12) => new T.SphereGeometry(r, s, s - 2),
  Co = (r, h, s = 8) => new T.ConeGeometry(r, h, s);
const PINK = 0xffb3d1,
  WHITE = 0xfff8fb,
  GOLD = 0xf6c453,
  STONE = 0xd2ccd0;
const goldM = () => M(GOLD, { metalness: 0.5, roughness: 0.35 });
const world = new T.Group();
scene.add(world);
const circles = [],
  boxes = [];
const col = (x, z, r) => circles.push({ x, z, r });
const shadowify = (o) =>
  o.traverse((m) => {
    if (m.isMesh && !m.material.transparent) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
const tex = (draw) => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  draw(c.getContext('2d'));
  return new T.CanvasTexture(c);
};
const heartT = tex((x) => {
  x.fillStyle = '#ff5c93';
  x.beginPath();
  x.moveTo(32, 56);
  x.bezierCurveTo(4, 36, 6, 8, 32, 20);
  x.bezierCurveTo(58, 8, 60, 36, 32, 56);
  x.fill();
});
const glowT = tex((x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,.6)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
});

/* ---------- island & sea ---------- */
add(world, Cy(36, 37, 1.2, 56), M(0x8fd694), 0, -0.6, 0);
add(world, Cy(38.5, 39.5, 1, 56), M(0xf6e3b8), 0, -0.9, 0);
const ocean = new T.Mesh(
  new T.PlaneGeometry(420, 420, 52, 52).rotateX(-Math.PI / 2),
  new T.MeshStandardMaterial({
    color: 0x24508f,
    emissive: 0x0a2a55,
    emissiveIntensity: 0.6,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
    roughness: 0.3,
  }),
);
ocean.position.y = -1;
scene.add(ocean);
const oPos = ocean.geometry.attributes.position;
const foam = new T.Mesh(
  new T.RingGeometry(39, 41, 64).rotateX(-Math.PI / 2),
  new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }),
);
foam.position.y = -0.8;
scene.add(foam);
const clouds = [];
for (let i = 0; i < 7; i++) {
  const g = new T.Group();
  for (let j = 0; j < 4; j++)
    add(
      g,
      Sp(2 + Math.random() * 2, 8),
      new T.MeshBasicMaterial({ color: 0x5a5190, transparent: true, opacity: 0.7 }),
      j * 2.4,
      Math.random(),
      Math.random() * 2,
    );
  const a = (i / 7) * 6.28,
    r = 60 + Math.random() * 40;
  g.position.set(Math.cos(a) * r, 24 + Math.random() * 10, Math.sin(a) * r);
  g.userData.a = a;
  g.userData.r = r;
  scene.add(g);
  clouds.push(g);
}

/* night sky: stars & moon */
const stars = (() => {
  const N = 450,
    pa = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * 6.283,
      e = Math.random() * 1.35 + 0.12,
      r = 250;
    pa.set([Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r], i * 3);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pa, 3));
  const o = new T.Points(
    g,
    new T.PointsMaterial({
      map: glowT,
      color: 0xffffff,
      size: 7,
      sizeAttenuation: false,
      transparent: true,
      depthWrite: false,
      fog: false,
    }),
  );
  scene.add(o);
  return o;
})();
const moon = new T.Mesh(
  new T.SphereGeometry(7, 24, 16),
  new T.MeshBasicMaterial({ color: 0xfff4d0, fog: false }),
);
moon.position.set(-60, 80, -140);
scene.add(moon);
const moonGlow = new T.Sprite(
  new T.SpriteMaterial({
    map: glowT,
    color: 0xbcd0ff,
    transparent: true,
    blending: T.AdditiveBlending,
    depthWrite: false,
    fog: false,
  }),
);
moonGlow.scale.set(70, 70, 1);
moonGlow.position.copy(moon.position);
scene.add(moonGlow);

/* ---------- scenery ---------- */
function stones(x1, z1, x2, z2) {
  const n = (Math.hypot(x2 - x1, z2 - z1) / 1.5) | 0;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    add(
      world,
      Cy(0.75, 0.8, 0.1, 9),
      M(i % 2 ? 0xcfc8cc : 0xe3dde0),
      x1 + (x2 - x1) * k + Math.sin(i * 2.1) * 0.15,
      0.04,
      z1 + (z2 - z1) * k,
    );
  }
}
stones(0, 25, 0, 5.4);
stones(0, 13, 12, 9);
stones(0, 13, -12.5, 7);
function tree(x, z, s = 1) {
  const g = new T.Group();
  add(g, Cy(0.25, 0.4, 2.2, 6), M(0x8b5e4a), 0, 1.1, 0);
  [
    [0, 3, 0, 1.7],
    [-1, 2.4, 0.4, 1.2],
    [1, 2.5, -0.3, 1.3],
    [0.2, 3.8, 0.2, 1.1],
  ].forEach(([a, b, c, r]) =>
    add(g, new T.IcosahedronGeometry(r, 0), M(PINK), a, b, c).material.color.setHex(
      Math.random() < 0.5 ? 0xffb3d1 : 0xffc7df,
    ),
  );
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  world.add(g);
  col(x, z, 0.7 * s);
}
[
  [22, 14],
  [-26, -2],
  [26, 0],
  [-12, -18],
  [14, -18],
  [24, -12],
  [-5, -24],
  [6, -26],
  [25, 24],
  [18, -7],
  [28, 9],
  [-28, 8],
  [-27, -12],
  [10, -28],
  [-31, -8],
].forEach(([x, z], i) => tree(x, z, 0.9 + (i % 3) * 0.15));
const bushes = [];
function bush(x, z) {
  const g = new T.Group();
  add(g, new T.IcosahedronGeometry(0.95, 1), M(0x5fbf72), 0, 0.65, 0).scale.y = 0.8;
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4,
      h = 0.35 + (i % 4) * 0.22;
    add(
      g,
      Sp(0.15, 6),
      M(0xe0243c),
      Math.cos(a) * 0.8 * Math.cos(h),
      0.6 + Math.sin(h) * 0.75,
      Math.sin(a) * 0.8 * Math.cos(h),
    );
  }
  g.position.set(x, 0, z);
  world.add(g);
  col(x, z, 1.2);
  bushes.push(g.position);
}
[
  [-8, 16],
  [-10, 11],
  [9, 17],
  [15, 19],
  [-18, 17],
].forEach((p) => bush(...p));
function lamp(x, z) {
  const g = new T.Group(),
    dk = M(0x2b2b33);
  add(g, Cy(0.28, 0.34, 0.35), dk, 0, 0.17, 0);
  add(g, Cy(0.07, 0.11, 3.2), dk, 0, 1.9, 0);
  add(
    g,
    Sp(0.3),
    new T.MeshStandardMaterial({ color: 0xfff6cc, emissive: 0xffe9a0, emissiveIntensity: 2.2 }),
    0,
    3.65,
    0,
  );
  add(g, Co(0.4, 0.4, 8), dk, 0, 4.1, 0);
  add(g, Cy(0.34, 0.34, 0.08), dk, 0, 3.35, 0);
  const gl = new T.Sprite(
    new T.SpriteMaterial({
      map: glowT,
      color: 0xffd98a,
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  gl.scale.set(4.2, 4.2, 1);
  gl.position.y = 3.65;
  g.add(gl);
  const pool = new T.Mesh(
    new T.CircleGeometry(3.2, 24).rotateX(-Math.PI / 2),
    new T.MeshBasicMaterial({
      map: glowT,
      color: 0xffcf80,
      transparent: true,
      opacity: 0.5,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  pool.position.y = 0.08;
  g.add(pool);
  g.position.set(x, 0, z);
  world.add(g);
  col(x, z, 0.4);
}
[
  [2.6, 22],
  [-2.6, 22],
  [2.6, 16],
  [-2.6, 16],
  [2.6, 10],
  [-2.6, 10],
  [8, 10.8],
  [-7, 10.5],
].forEach((p) => lamp(...p));

/* gate */
function signTex() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 224;
  const x = c.getContext('2d');
  x.fillStyle = '#fff8fb';
  x.fillRect(0, 0, 1024, 224);
  x.strokeStyle = '#e0a93a';
  x.lineWidth = 12;
  x.strokeRect(10, 10, 1004, 204);
  x.strokeStyle = '#ffb3d1';
  x.lineWidth = 4;
  x.strokeRect(28, 28, 968, 168);
  const t = `Welcome Princess`;
  let s = 78;
  x.font = `italic 700 ${s}px Georgia,serif`;
  while (x.measureText(t).width > 900 && s > 24) {
    s -= 2;
    x.font = `italic 700 ${s}px Georgia,serif`;
  }
  x.fillStyle = '#d4558f';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(t, 512, 116);
  return new T.CanvasTexture(c);
}
{
  const g = new T.Group(),
    w = M(WHITE),
    st = signTex();
  [-1, 1].forEach((s) => {
    add(g, Bx(0.9, 5, 0.9), w, s * 3.2, 2.5, 0);
    add(g, Bx(1.1, 0.3, 1.1), goldM(), s * 3.2, 5.1, 0);
    add(g, Sp(0.35), goldM(), s * 3.2, 5.5, 0);
    add(g, Bx(0.5, 0.5, 0.5), goldM(), s * 3.2, 0.25, 0);
    col(s * 3.2, 27, 0.7);
    for (let i = 0; i < 6; i++) {
      add(g, Bx(0.14, 1, 0.14), w, s * (4.3 + i * 0.9), 0.5, 0);
      add(g, Co(0.1, 0.2, 4), goldM(), s * (4.3 + i * 0.9), 1.1, 0);
    }
    add(g, Bx(5, 0.1, 0.1), w, s * 6.8, 0.75, 0);
  });
  add(g, Bx(7.4, 0.5, 0.8), goldM(), 0, 5.05, 0);
  add(g, Bx(5.7, 1.5, 0.12), goldM(), 0, 4.2, 0);
  [
    [0.07, 0],
    [-0.07, Math.PI],
  ].forEach(([z, r]) => {
    const p = new T.Mesh(new T.PlaneGeometry(5.4, 1.18), new T.MeshBasicMaterial({ map: st }));
    p.position.set(0, 4.2, z);
    p.rotation.y = r;
    g.add(p);
  });
  g.position.z = 27;
  world.add(g);
}

/* castle */
const flags = [];
function flag(g, x, y, z) {
  add(g, Cy(0.04, 0.04, 2), M(0xffffff), x, y + 1, z);
  const f = new T.Mesh(
    new T.PlaneGeometry(1.1, 0.6).translate(0.55, 0, 0),
    new T.MeshStandardMaterial({ color: 0xff5f9e, side: T.DoubleSide }),
  );
  f.position.set(x, y + 1.6, z);
  g.add(f);
  flags.push(f);
}
function windowAt(g, x, y, z, ry = 0) {
  const m = add(
    g,
    Bx(0.7, 1.2, 0.15),
    new T.MeshStandardMaterial({ color: 0xfff0b0, emissive: 0xffd978, emissiveIntensity: 1.5 }),
    x,
    y,
    z,
  );
  m.rotation.y = ry;
  add(g, Bx(0.9, 1.4, 0.1), goldM(), x, y, z - 0.04 * Math.cos(ry));
}
{
  const g = new T.Group(),
    w = M(0xfff3f8),
    p = M(0xffb0d0);
  add(g, Bx(10, 6, 6), w, 0, 3, 0);
  add(g, Bx(10.3, 0.5, 6.3), p, 0, 1.1, 0);
  add(g, Bx(10.3, 0.5, 6.3), p, 0, 6.1, 0);
  for (let i = -4; i <= 4; i += 2) add(g, Bx(0.8, 0.6, 6.4), w, i, 6.5, 0);
  [
    [-5.5, -3.2],
    [5.5, -3.2],
    [-5.5, 3.2],
    [5.5, 3.2],
  ].forEach(([x, z], i) => {
    add(g, Cy(1.3, 1.4, 8, 10), w, x, 4, z);
    add(g, Cy(1.45, 1.45, 0.4, 10), p, x, 7.9, z);
    add(g, Co(1.8, 3.6, 10), p, x, 9.9, z);
    flag(g, x, 11.7, z);
    windowAt(g, x, 5.2, z + (z > 0 ? 1.38 : -1.38));
  });
  add(g, Cy(1.9, 2, 11, 12), w, 0, 5.5, -1);
  add(g, Cy(2.1, 2.1, 0.4, 12), p, 0, 10.8, -1);
  add(g, Co(2.5, 4.6, 12), p, 0, 13.3, -1);
  flag(g, 0, 15.6, -1);
  add(g, Bx(2, 3, 0.3), goldM(), 0, 1.5, 3.05);
  add(g, Cy(1, 1, 0.3, 16), goldM(), 0, 3, 3.05).rotation.x = Math.PI / 2;
  add(g, Bx(1.6, 2.8, 0.2), M(0xe85b9a), 0, 1.4, 3.12);
  add(g, Cy(0.8, 0.8, 0.2, 16), M(0xe85b9a), 0, 2.8, 3.12).rotation.x = Math.PI / 2;
  [-3, 3].forEach((x) => {
    windowAt(g, x, 3.6, 3.05);
    windowAt(g, x, 3.6, -3.05, Math.PI);
  });
  windowAt(g, 0, 8, 0.9);
  g.position.set(0, 0, -6);
  world.add(g);
  boxes.push({ x: 0, z: -6, hx: 6.9, hz: 4.7 });
}

/* gazebo */
{
  const g = new T.Group(),
    w = M(WHITE);
  add(g, Cy(3.2, 3.3, 0.3, 6), M(STONE), 0, 0.15, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.283,
      x = Math.cos(a) * 2.7,
      z = Math.sin(a) * 2.7;
    add(g, Cy(0.12, 0.12, 3.2, 6), w, x, 1.9, z);
    add(g, Bx(0.3, 0.15, 0.3), M(PINK), x, 0.4, z);
    col(-14 + x, 6 + z, 0.35);
  }
  add(g, Cy(3.2, 3.2, 0.2, 6), M(PINK), 0, 3.5, 0);
  add(g, Co(3.7, 2, 6), M(0xffa6c9), 0, 4.6, 0);
  add(g, Sp(0.28), goldM(), 0, 5.8, 0);
  add(g, Bx(1.8, 0.2, 0.6), w, 0, 0.6, -1.6);
  g.position.set(-14, 0, 6);
  world.add(g);
}

/* wishing well */
const wellPos = V(13, 0, 8);
const wellWater = new T.MeshStandardMaterial({
  color: 0xffe59a,
  emissive: 0xffcf5a,
  emissiveIntensity: 1.2,
});
{
  const g = new T.Group(),
    s = M(0xc9c3c8);
  add(g, Cy(1.2, 1.3, 1.1, 12), s, 0, 0.55, 0);
  add(g, Cy(0.9, 0.9, 0.06, 12), wellWater, 0, 1.0, 0);
  [-1, 1].forEach((k) => add(g, Bx(0.15, 2, 0.15), M(0x9b6b4a), k * 1.05, 2, 0));
  add(g, Co(1.8, 1.1, 4), M(0xffa6c9), 0, 3.5, 0).rotation.y = Math.PI / 4;
  add(g, Cy(0.05, 0.05, 2.1, 5), M(0x9b6b4a), 0, 2.5, 0).rotation.z = Math.PI / 2;
  add(g, Cy(0.18, 0.15, 0.25, 8), M(0x8a6a4a), 0, 1.8, 0);
  g.position.copy(wellPos);
  world.add(g);
  col(13, 8, 1.6);
}

/* throne, platform & crown cushion */
const crown = new T.Group(),
  crownHome = V(3.6, 1.08, 3.4);
{
  const g = new T.Group(),
    st = M(STONE);
  add(g, Cy(2.6, 2.8, 0.3, 20), st, 0, 0.15, 2.5);
  add(g, Cy(2.9, 3, 0.15, 20), M(0xffd1e3), 0, 0.07, 2.5);
  const t = new T.Group(),
    gd = goldM(),
    pk = M(0xff8fbd);
  add(t, Bx(1.5, 0.5, 1.2), gd, 0, 0.25, 0);
  add(t, Bx(1.2, 0.16, 0.95), pk, 0, 0.57, 0);
  add(t, Bx(1.5, 2.2, 0.22), gd, 0, 1.4, -0.55);
  add(t, Bx(1.1, 1.5, 0.1), pk, 0, 1.2, -0.42);
  add(t, Sp(0.75, 14), gd, 0, 2.5, -0.55).scale.set(1, 0.55, 0.3);
  add(t, Sp(0.15), M(0xff4d88), 0, 2.75, -0.5);
  [-1, 1].forEach((k) => {
    add(t, Bx(0.18, 0.5, 1), gd, k * 0.72, 0.75, 0);
    add(t, Sp(0.14), gd, k * 0.72, 1.05, 0.45);
  });
  t.position.set(0, 0.3, 2.2);
  g.add(t);
  boxes.push({ x: 0, z: 2.2, hx: 0.8, hz: 0.65 });
  add(g, Cy(0.5, 0.6, 0.8, 10), st, 3.6, 0.4, 3.4);
  add(g, Cy(0.55, 0.55, 0.14, 12), M(0xff8fbd), 3.6, 0.88, 3.4);
  world.add(g);
  const gm = goldM();
  add(crown, new T.TorusGeometry(0.24, 0.04, 6, 18).rotateX(Math.PI / 2), gm);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 6.283;
    add(crown, Co(0.06, 0.2, 4), gm, Math.cos(a) * 0.24, 0.12, Math.sin(a) * 0.24);
    add(
      crown,
      Sp(0.045, 6),
      new T.MeshStandardMaterial({ color: 0xff5c93, emissive: 0xff3070, emissiveIntensity: 0.6 }),
      Math.cos(a) * 0.24,
      0.25,
      Math.sin(a) * 0.24,
    );
  }
  crown.position.copy(crownHome);
  scene.add(crown);
}

/* dragon rock */
const dragon = new T.Group();
dragon.awake = false;
dragon.t = 0;
dragon.hb = 0;
{
  add(world, Cy(2, 2.4, 0.9, 7), M(0xbdb7c7), -18, 0.45, -10);
  col(-18, -10, 2.6);
  const b = M(0xa9b8ff),
    l = M(0xc9a8ff),
    pk = M(0xff9ec4),
    dk = new T.MeshBasicMaterial({ color: 0x3a2a4a });
  add(dragon, Sp(0.8), b, 0, 0.7, 0).scale.set(1, 0.85, 1.2);
  add(dragon, Sp(0.6), M(0xe6eaff), 0, 0.55, 0.35).scale.set(1, 0.9, 1);
  add(dragon, Sp(0.55), b, 0, 1.25, 0.85);
  add(dragon, Sp(0.24), b, 0, 1.12, 1.3).scale.set(1.2, 0.8, 1);
  [-1, 1].forEach((s) => {
    add(dragon, Sp(0.1, 6), pk, s * 0.34, 1.15, 1.2);
    add(dragon, Co(0.12, 0.38, 6), l, s * 0.26, 1.78, 0.75);
    add(dragon, Sp(0.22), b, s * 0.5, 0.12, 0.6);
  });
  const eo = new T.Group(),
    ec = new T.Group();
  [-1, 1].forEach((s) => {
    add(eo, Sp(0.09, 8), dk, s * 0.25, 1.35, 1.3);
    add(eo, Sp(0.03, 6), new T.MeshBasicMaterial({ color: 0xffffff }), s * 0.27, 1.39, 1.37);
    add(ec, Bx(0.16, 0.025, 0.03), dk, s * 0.25, 1.33, 1.32);
  });
  dragon.add(eo, ec);
  dragon.eo = eo;
  dragon.ec = ec;
  add(dragon, Co(0.38, 1.5, 6), b, 0, 0.45, -1.1).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 4; i++) add(dragon, Co(0.1, 0.28, 4), l, 0, 1.35 - i * 0.13, 0.5 - i * 0.4);
  dragon.wings = [-1, 1].map((s) => {
    const p = new T.Group();
    p.position.set(s * 0.55, 1.05, -0.1);
    add(p, Sp(0.6), l, s * 0.65, 0, 0).scale.set(1.3, 0.1, 0.9);
    dragon.add(p);
    p.s = s;
    return p;
  });
  const zc = document.createElement('canvas');
  zc.width = 128;
  zc.height = 64;
  const zx = zc.getContext('2d');
  zx.font = 'bold 46px Georgia';
  zx.fillStyle = '#fff';
  zx.shadowColor = '#c06';
  zx.shadowBlur = 6;
  zx.fillText('z Z', 20, 48);
  const z = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(zc), transparent: true }));
  z.scale.set(1.6, 0.8, 1);
  z.position.set(0.3, 2.4, 0.8);
  dragon.add(z);
  dragon.z = z;
  dragon.position.set(-18, 0.9, -10);
  dragon.rotation.y = 0.8;
  dragon.scale.setScalar(0.9);
  world.add(dragon);
}
/* romantic garden swing */
const swingG = new T.Group(),
  swingSeat = new T.Group();
let riding = false,
  seated = false,
  swAmp = 0.2,
  swPh = 0,
  swTarget = 0.2;
{
  const w = M(WHITE),
    wd = M(0xf3d9c4);
  add(swingG, Cy(3.2, 3.2, 0.05, 24), M(0xffc2dc), 0, 0.03, 0);
  add(swingG, Cy(2.3, 2.3, 0.06, 24), M(0xfff0f6), 0, 0.05, 0);
  [-1.5, 1.5].forEach((sx) =>
    [-1, 1].forEach((sz) => {
      add(swingG, Cy(0.07, 0.09, 3.67, 6), w, sx, 1.75, sz * 0.55).rotation.x =
        -sz * Math.atan(1.1 / 3.5);
    }),
  );
  add(swingG, Cy(0.09, 0.09, 3.4, 8), goldM(), 0, 3.5, 0).rotation.z = Math.PI / 2;
  for (let i = 0; i < 10; i++) {
    add(swingG, Sp(0.11, 6), M(i % 2 ? 0xff6fa8 : 0xffb3d1), -1.5 + i * 0.333, 3.62, 0.02);
    add(swingG, Sp(0.08, 6), M(0x5fbf72), -1.5 + i * 0.333 + 0.1, 3.58, -0.08);
  }
  swingSeat.position.set(0, 3.5, 0);
  swingG.add(swingSeat);
  [
    ['aB', 0.45],
    ['aG', -0.45],
  ].forEach(([k, x]) => {
    const a = new T.Object3D();
    a.position.set(x, -2.85, 0.02);
    swingSeat.add(a);
    swingSeat[k] = a;
  });
  [-0.8, 0.8].forEach((x) => add(swingSeat, Cy(0.025, 0.025, 2.5, 5), M(0xffe9a8), x, -1.25, 0));
  add(swingSeat, Bx(2, 0.14, 0.8), wd, 0, -2.5, 0);
  add(swingSeat, Bx(1.85, 0.1, 0.6), M(0xff8fbd), 0, -2.4, 0);
  add(swingSeat, Bx(2, 0.7, 0.1), wd, 0, -2.05, -0.4);
  add(swingSeat, Bx(1.8, 0.5, 0.06), M(0xff8fbd), 0, -2.05, -0.34);
  [-1, 1].forEach((k) => add(swingSeat, Bx(0.12, 0.35, 0.7), wd, k * 0.95, -2.3, 0));
  [-0.6, 0, 0.6].forEach((x) => add(swingSeat, Sp(0.1, 6), M(0xe0243c), x, -1.66, -0.4));
  swingG.position.set(20, 0, 3);
  swingG.rotation.y = -Math.PI / 2;
  world.add(swingG);
  col(20, 3, 1.8);
  lamp(20, 6.8);
  lamp(20, -0.8);
}
[
  [0, 3.2, 3.5, 0xff9fcf, 1.3, 16],
  [13, 2.6, 8, 0xffd27a, 1.3, 11],
  [0, 7, -1.5, 0xffc6e8, 1, 28],
  [20, 3, 3, 0xff8fbd, 1.1, 11],
].forEach(([x, y, z, c, i, d]) => {
  const l = new T.PointLight(c, i, d);
  l.position.set(x, y, z);
  scene.add(l);
});
shadowify(world);

/* ---------- characters ---------- */
function chibi(girl) {
  const g = new T.Group(),
    skin = M(0xffdcc4),
    hair = M(0x2a1d24),
    c = { g, girl, pose: 'walk', ov: null, legs: {}, arms: {}, hands: {}, tp: V(), tr: 0 };
  c.inner = girl ? 1 : -1;
  c.outer = -c.inner;
  [-1, 1].forEach((s) => {
    const p = new T.Group();
    p.position.set(s * 0.14, 0.5, 0);
    add(p, Cy(0.09, 0.09, 0.5, 6), girl ? skin : M(0x35364a), 0, -0.25, 0);
    add(p, Sp(0.11, 6), M(girl ? 0xffffff : 0x222222), 0, -0.5, 0.04);
    g.add(p);
    c.legs[s] = p;
    const a = new T.Group();
    a.position.set(s * 0.32, 1.0, 0);
    add(a, Cy(0.07, 0.07, 0.5, 6), M(girl ? 0xff9cc6 : WHITE), 0, -0.22, 0);
    add(a, Sp(0.09, 8), skin, 0, -0.5, 0);
    const h = new T.Object3D();
    h.position.set(0, -0.55, 0);
    a.add(h);
    g.add(a);
    c.arms[s] = a;
    c.hands[s] = h;
  });
  if (girl) {
    add(g, Co(0.46, 0.8, 14), M(0xff9cc6), 0, 0.7, 0);
    add(g, Cy(0.48, 0.48, 0.08, 14), M(WHITE), 0, 0.33, 0);
    add(g, Cy(0.24, 0.28, 0.3, 10), M(0xffb6d6), 0, 1.0, 0);
    add(g, Sp(0.1, 6), M(0xff4d88), 0, 1.08, 0.25);
    add(g, Sp(0.46, 14), hair, 0, 1.0, -0.3).scale.set(0.95, 1.5, 0.6);
  } else {
    add(g, Cy(0.25, 0.3, 0.55, 10), M(WHITE), 0, 0.78, 0);
    add(g, Cy(0.26, 0.26, 0.08, 10), M(0x35364a), 0, 0.52, 0);
    add(g, Sp(0.42, 12), hair, 0, 1.45, -0.1).scale.set(1, 0.95, 0.9);
  }
  add(g, Sp(0.4, 18), skin, 0, 1.45, 0);
  const cap = add(
    g,
    new T.SphereGeometry(0.44, 16, 12, 0, 6.283, 0, Math.PI * 0.52),
    hair,
    0,
    1.47,
    -0.03,
  );
  cap.rotation.x = -0.5;
  [-1, 1].forEach((s) => {
    add(
      g,
      Sp(0.06, 8),
      new T.MeshBasicMaterial({ color: 0x2a1d24 }),
      s * 0.15,
      1.42,
      0.36,
    ).scale.set(1, 1.3, 0.5);
    add(g, Sp(0.02, 6), new T.MeshBasicMaterial({ color: 0xffffff }), s * 0.16, 1.45, 0.39);
    add(
      g,
      Sp(0.065, 8),
      new T.MeshBasicMaterial({ color: 0xffa0bf }),
      s * 0.25,
      1.32,
      0.31,
    ).scale.z = 0.4;
  });
  add(
    g,
    new T.TorusGeometry(0.05, 0.012, 6, 10, Math.PI).rotateZ(Math.PI),
    new T.MeshBasicMaterial({ color: 0xc2405f }),
    0,
    1.34,
    0.385,
  );
  scene.add(g);
  shadowify(g);
  return c;
}
const boy = chibi(false),
  girl = chibi(true);
const P = { pos: V(0, 0, 31), heading: Math.PI };
let busy = false,
  custom = false,
  moving = false,
  dest = null,
  time = 0;

/* cat */
const cat = new T.Group();
{
  const o = M(0xf0923a),
    d = M(0xc9651c),
    cr = M(0xfff0dc);
  add(cat, Sp(0.3), o, 0, 0.38, 0).scale.set(0.8, 0.7, 1.3);
  add(cat, Sp(0.25), o, 0, 0.6, 0.42);
  [-1, 1].forEach((s) => {
    add(cat, Co(0.09, 0.2, 4), o, s * 0.14, 0.84, 0.4);
    add(cat, Co(0.04, 0.12, 4), M(0xffa0b4), s * 0.14, 0.82, 0.43);
    add(cat, Sp(0.035, 6), new T.MeshBasicMaterial({ color: 0x222222 }), s * 0.09, 0.63, 0.64);
    [-1, 1].forEach((f) => {
      add(cat, Cy(0.055, 0.06, 0.26, 6), o, s * 0.13, 0.13, f * 0.24);
      add(cat, Sp(0.065, 6), cr, s * 0.13, 0.02, f * 0.25);
    });
  });
  add(cat, Sp(0.04, 6), M(0xff8fa8), 0, 0.57, 0.66);
  for (let i = -1; i <= 1; i++)
    add(cat, Bx(0.34, 0.02, 0.07), d, 0, 0.66 - Math.abs(i) * 0.03, i * 0.22);
  const tail = new T.Group();
  tail.position.set(0, 0.5, -0.4);
  add(tail, Cy(0.045, 0.06, 0.6, 6), o, 0, 0.3, 0);
  add(tail, Sp(0.06, 6), cr, 0, 0.62, 0);
  tail.rotation.x = -0.5;
  cat.add(tail);
  cat.tail = tail;
  cat.scale.setScalar(1.15);
  cat.position.set(0, 0, 33.5);
  scene.add(cat);
  shadowify(cat);
}

/* ---------- particles ---------- */
const parts = [];
function spawn(t, pos, n, o = {}) {
  for (let i = 0; i < n && parts.length < 320; i++) {
    const s = new T.Sprite(
        new T.SpriteMaterial({
          map: t,
          transparent: true,
          depthWrite: false,
          color: o.color || 0xffffff,
          blending: o.add ? T.AdditiveBlending : T.NormalBlending,
        }),
      ),
      sz = (o.size || 0.4) * (0.7 + Math.random() * 0.6),
      sp = o.spread || 1;
    s.scale.set(sz, sz, 1);
    s.position.set(
      pos.x + (Math.random() - 0.5) * sp,
      pos.y + (Math.random() - 0.5) * sp,
      pos.z + (Math.random() - 0.5) * sp,
    );
    scene.add(s);
    parts.push({
      s,
      v: V(
        (Math.random() - 0.5) * (o.vx || 0.6),
        (o.vy || 1.2) * (0.6 + Math.random() * 0.8),
        (Math.random() - 0.5) * (o.vx || 0.6),
      ),
      life: 0,
      max: o.life || 2.2,
    });
  }
}
const hearts = (p, n, o = {}) => spawn(heartT, p, n, { size: 0.45, spread: 1.6, ...o });
const sparks = (p, n, o = {}) =>
  spawn(glowT, p, n, { color: 0xffd45e, add: true, size: 0.5, ...o });
const conf = [];
const cgeo = new T.PlaneGeometry(0.14, 0.09);
function confetti(p, n = 150) {
  const cols = [0xff6fa8, 0xffb3d1, 0xffffff, 0xf6c453, 0xff9ec4];
  for (let i = 0; i < n; i++) {
    const m = new T.Mesh(cgeo, new T.MeshBasicMaterial({ color: cols[i % 5], side: T.DoubleSide }));
    m.position.copy(p);
    scene.add(m);
    conf.push({
      m,
      v: V((Math.random() - 0.5) * 6, 3 + Math.random() * 5, (Math.random() - 0.5) * 6),
      r: V(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      t: 0,
    });
  }
}
function every(ms, total, fn) {
  const iv = setInterval(fn, ms);
  setTimeout(() => clearInterval(iv), total);
}
/* fireflies */
const FN = 220,
  fpos = new Float32Array(FN * 3),
  fph = [];
for (let i = 0; i < FN; i++) {
  const a = Math.random() * 6.28,
    r = Math.sqrt(Math.random()) * 36;
  fpos.set([Math.cos(a) * r, 1 + Math.random() * 8, Math.sin(a) * r], i * 3);
  fph.push(Math.random() * 6.28);
}
const fg = new T.BufferGeometry();
fg.setAttribute('position', new T.BufferAttribute(fpos, 3));
scene.add(
  new T.Points(
    fg,
    new T.PointsMaterial({
      map: glowT,
      color: 0xfff2a0,
      size: 1.1,
      transparent: true,
      depthWrite: false,
      blending: T.AdditiveBlending,
    }),
  ),
);

/* birds */
const birds = [],
  bcols = [0xffffff, 0xffd1e3, 0xcfe3ff, 0xfff1b8, 0xe4d4ff];
function makeBird(col) {
  const g = new T.Group(),
    b = M(col),
    o = M(0xffb347);
  add(g, Sp(0.2, 8), b).scale.set(0.8, 0.75, 1.5);
  add(g, Sp(0.12, 8), b, 0, 0.07, 0.3);
  add(g, Co(0.04, 0.12, 4), o, 0, 0.06, 0.44).rotation.x = Math.PI / 2;
  add(g, Co(0.07, 0.3, 4), b, 0, 0, -0.35).rotation.x = -Math.PI / 2;
  g.w = [-1, 1].map((s) => {
    const p = new T.Group();
    p.s = s;
    p.position.set(s * 0.1, 0.05, 0);
    add(p, Sp(0.3, 6), b, s * 0.3, 0, 0).scale.set(1.2, 0.12, 0.6);
    g.add(p);
    return p;
  });
  g.scale.setScalar(1.7);
  scene.add(g);
  return g;
}
for (let i = 0; i < 11; i++) {
  const g = makeBird(bcols[i % 5]);
  g.u = {
    a: Math.random() * 6.28,
    R: 10 + Math.random() * 24,
    h: 7 + Math.random() * 8,
    sp: (0.12 + Math.random() * 0.12) * (i % 3 ? 1 : -1),
    ph: Math.random() * 6,
    ox: (Math.random() - 0.5) * 10,
    oz: (Math.random() - 0.5) * 10,
  };
  birds.push(g);
}
[-0.5, 0.5].forEach((x) => {
  const b = makeBird(x < 0 ? 0xffd1e3 : 0xcfe3ff);
  b.w.forEach((w) => (w.rotation.z = w.s * -0.5));
  b.scale.setScalar(1.3);
  b.position.set(x, 3.78, 0);
  b.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
  swingG.add(b);
});

/* ---------- tweens ---------- */
const tweens = [];
const tween = (d, f, done) => tweens.push({ t: 0, d, f, done });
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/* ---------- actions ---------- */
let girlRose = null,
  roseGiven = false;
function makeRose() {
  const r = new T.Group();
  add(r, Cy(0.02, 0.02, 0.5, 5), M(0x3f9f55), 0, 0.15, 0);
  add(r, new T.IcosahedronGeometry(0.11, 0), M(0xe0243c), 0, 0.45, 0);
  add(r, Sp(0.07, 6), M(0xb81530), 0, 0.5, 0);
  add(r, Sp(0.06, 6), M(0x3f9f55), 0.08, 0.22, 0).scale.y = 0.4;
  return r;
}
function faceTo(x, z) {
  P.heading = Math.atan2(x - P.pos.x, z - P.pos.z);
}
function pickRose(b) {
  busy = true;
  roseGiven = false;
  faceTo(b.x, b.z);
  if (girlRose) {
    girlRose.parent.remove(girlRose);
    girlRose = null;
  }
  const r = makeRose();
  r.position.set(b.x, 1.2, b.z);
  scene.add(r);
  boy.ov = { i: [0, -0.55], o: [-1.3, -0.2] };
  const s = r.position.clone(),
    hb = V(),
    hg = V();
  setTimeout(
    () =>
      tween(
        0.8,
        (k) => {
          boy.hands[boy.outer].getWorldPosition(hb);
          r.position.lerpVectors(s, hb, ease(k));
          r.position.y += Math.sin(k * Math.PI) * 0.8;
        },
        () => {
          const s2 = r.position.clone();
          girl.ov = { i: [0, girl.inner * 0.55], o: [-1.2, girl.outer * 0.25] };
          tween(
            1,
            (k) => {
              girl.hands[girl.outer].getWorldPosition(hg);
              r.position.lerpVectors(s2, hg, ease(k));
              r.position.y += Math.sin(k * Math.PI) * 0.5;
            },
            () => {
              girl.hands[girl.outer].attach(r);
              r.position.set(0, 0.02, 0);
              r.rotation.set(0, 0, 0);
              girlRose = r;
              roseGiven = true;
              boy.ov = null;
              every(160, 2600, () =>
                hearts(V(girl.g.position.x, 1.6, girl.g.position.z), 2, { spread: 2.2, vy: 1.4 }),
              );
              hearts(V(girl.g.position.x, 1.6, girl.g.position.z), 10, { spread: 2 });
              setTimeout(() => {
                girl.ov = null;
                busy = false;
              }, 4800);
            },
          );
        },
      ),
    500,
  );
}
function crownHer() {
  busy = true;
  custom = true;
  if (crown.parent !== scene) {
    scene.add(crown);
    crown.rotation.set(0, 0, 0);
    crown.scale.setScalar(1);
  }
  crown.position.copy(crownHome);
  girl.tp.set(0, 0.5, 2.25);
  girl.tr = 0;
  boy.tp.set(0, 0, 4.2);
  boy.tr = Math.PI;
  setTimeout(() => {
    girl.pose = 'sit';
    girl.tp.y = 0.5;
  }, 1400);
  setTimeout(() => {
    boy.pose = 'kneel';
    boy.tp.set(0, -0.3, 3.7);
    boy.ov = { i: [-1.6, -0.1], o: [-1.6, 0.1] };
  }, 2200);
  setTimeout(() => {
    const s = crown.position.clone(),
      a = V(),
      b = V();
    tween(
      1,
      (k) => {
        boy.hands[-1].getWorldPosition(a);
        boy.hands[1].getWorldPosition(b);
        a.add(b).multiplyScalar(0.5);
        a.y += 0.2;
        crown.position.lerpVectors(s, a, ease(k));
        crown.position.y += Math.sin(k * Math.PI) * 0.4;
      },
      () => {
        const s2 = crown.position.clone(),
          e = V(0, 2.38, 2.27);
        tween(
          1.1,
          (k) => {
            crown.position.lerpVectors(s2, e, ease(k));
            crown.position.y += Math.sin(k * Math.PI) * 0.25;
            crown.rotation.y = k * 6.28;
          },
          () => {
            girl.g.attach(crown);
            crown.position.set(0, 1.9, 0.02);
            crown.rotation.set(0, 0, 0);
            confetti(V(0, 3.5, 2.6));
            sparks(V(0, 2.4, 2.3), 24, { spread: 1.2, vy: 2 });
            every(120, 3000, () => {
              hearts(V(0, 2.2, 2.5), 2, { spread: 2.5 });
              confetti(V(0, 4, 3), 10);
            });
            setTimeout(() => {
              boy.ov = null;
              boy.pose = 'walk';
              girl.pose = 'walk';
              custom = false;
              busy = false;
            }, 3800);
          },
        );
      },
    );
  }, 3300);
}
function wakeDragon() {
  if (dragon.awake) return;
  dragon.awake = true;
  dragon.t = 0;
}
function wish() {
  busy = true;
  faceTo(13, 8);
  hearts(V(P.pos.x, 1.8, P.pos.z), 8);
  every(70, 3800, () =>
    sparks(V(13, 1.2, 8), 3, { spread: 0.8, vy: 3.5, vx: 0.5, life: 3, size: 0.55 }),
  );
  setTimeout(() => $('modal').classList.add('show'), 1400);
}
function swingRide() {
  busy = true;
  custom = true;
  riding = true;
  const sx = 18.2,
    z0 = 3;
  boy.tp.set(sx, 0, z0 + 0.45);
  girl.tp.set(sx, 0, z0 - 0.45);
  boy.tr = girl.tr = -Math.PI / 2;
  setTimeout(() => {
    boy.pose = girl.pose = 'sit';
    seated = true;
    swTarget = 0.55;
  }, 1400);
  every(350, 10800, () => hearts(V(20, 2.4, 3), 1, { spread: 2.2, vy: 1.2 }));
  setTimeout(() => {
    swTarget = 0.2;
  }, 10000);
  setTimeout(() => {
    seated = false;
    boy.pose = girl.pose = 'walk';
    boy.tp.set(sx, 0, z0 + 0.45);
    girl.tp.set(sx, 0, z0 - 0.45);
  }, 11500);
  setTimeout(() => {
    custom = false;
    riding = false;
    busy = false;
  }, 12600);
}
$('close').onclick = () => {
  $('modal').classList.remove('show');
  busy = false;
};

const stations = [
  ...bushes.map((b) => ({
    x: b.x,
    z: b.z,
    r: 3.6,
    label: '🌹 Pick a rose for her',
    fn: () => pickRose(b),
  })),
  { x: -18, z: -10, r: 6.5, label: '🐉 Wake the dragon', fn: wakeDragon, ok: () => !dragon.awake },
  { x: 0, z: 4.8, r: 3.2, label: '👑 Crown your Princess', fn: crownHer },
  { x: 13, z: 8, r: 3.8, label: '✨ Make a wish together', fn: wish },
  { x: 20, z: 3, r: 5.2, label: '💕 Swing together', fn: swingRide, ok: () => !riding },
];
let cur = null;
const pr = $('prompt');
pr.onclick = () => {
  if (cur && !busy) {
    pr.classList.remove('show');
    cur.fn();
  }
};

/* ---------- input ---------- */
const keys = {};
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup', (e) => (keys[e.code] = false));
const joy = { x: 0, y: 0 };
let jd = false;
const jEl = $('joy'),
  kn = $('knob');
const jmove = (e) => {
  const r = jEl.getBoundingClientRect();
  let dx = e.clientX - r.left - 55,
    dy = e.clientY - r.top - 55;
  const l = Math.hypot(dx, dy),
    m = 40;
  if (l > m) {
    dx *= m / l;
    dy *= m / l;
  }
  kn.style.transform = `translate(${dx}px,${dy}px)`;
  joy.x = dx / m;
  joy.y = dy / m;
};
jEl.addEventListener('pointerdown', (e) => {
  jd = true;
  jEl.setPointerCapture(e.pointerId);
  jmove(e);
  dest = null;
});
jEl.addEventListener('pointermove', (e) => jd && jmove(e));
const jend = () => {
  jd = false;
  joy.x = joy.y = 0;
  kn.style.transform = '';
};
jEl.addEventListener('pointerup', jend);
jEl.addEventListener('pointercancel', jend);
let yaw = 0,
  pitch = 0.4,
  dist = 9,
  mode = 'intro',
  droneA = 0.6,
  drag = null;
const cv = renderer.domElement,
  ray = new T.Raycaster(),
  plane = new T.Plane(V(0, 1, 0), 0);
cv.addEventListener('pointerdown', (e) => (drag = { x: e.clientX, y: e.clientY, moved: 0 }));
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  drag.x = e.clientX;
  drag.y = e.clientY;
  if (mode !== 'intro') {
    yaw -= dx * 0.006;
    pitch = Math.min(1.25, Math.max(0.08, pitch + dy * 0.004));
  }
});
addEventListener('pointerup', (e) => {
  if (drag && drag.moved < 8 && mode !== 'intro' && mode !== 'tour' && !busy && e.target === cv) {
    ray.setFromCamera(
      new T.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1),
      camera,
    );
    const p = V();
    if (ray.ray.intersectPlane(plane, p) && p.length() < 33) {
      dest = p;
      sparks(p.clone().setY(0.3), 6, { vy: 1, spread: 0.6 });
    }
  }
  drag = null;
});
cv.addEventListener(
  'wheel',
  (e) => {
    dist = Math.min(18, Math.max(4, dist + e.deltaY * 0.01));
  },
  { passive: true },
);
function toFollow() {
  yaw = Math.atan2(camera.position.x - P.pos.x, camera.position.z - P.pos.z);
  mode = 'follow';
  $('bDrone').textContent = '🚁 Drone view';
}
$('go').onclick = () => {
  $('intro').classList.remove('show');
  toFollow();
  setTimeout(() => ($('hint').style.opacity = 0), 9000);
};
$('bDrone').onclick = () => {
  if (mode === 'intro') return;
  if (mode === 'tour') {
    stopTour();
    return;
  }
  if (mode === 'follow') {
    mode = 'drone';
    $('bDrone').textContent = '🎮 Follow view';
  } else toFollow();
};

/* ---------- auto tour (cinematic) ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tourId = 0,
  tourA = 0,
  shot = { type: 'wide', r: 50, h: 24, speed: 0.1 };
const capEl = $('cap'),
  fadeEl = $('fade');
function cap(t) {
  capEl.textContent = t;
  capEl.classList.remove('on');
  void capEl.offsetWidth;
  capEl.classList.add('on');
}
function stopTour() {
  tourId++;
  dest = null;
  document.body.classList.remove('tour');
  capEl.classList.remove('on');
  $('bAuto').textContent = '🎬 Auto tour';
  if ($('modal').classList.contains('show')) $('close').onclick();
  toFollow();
}
async function startTour() {
  if (busy || mode === 'tour') return;
  const id = ++tourId,
    ok = () => tourId === id;
  fadeEl.style.opacity = 1;
  await sleep(780);
  if (!ok()) return;
  $('intro').classList.remove('show');
  document.body.classList.add('tour');
  $('bAuto').textContent = '⏹ Stop tour';
  mode = 'tour';
  tourA = 0;
  shot = { type: 'wide', r: 50, h: 24, speed: 0.1 };
  dest = null;
  custom = false;
  P.pos.set(0, 0, 30.5);
  P.heading = Math.PI;
  [
    [boy, -0.6],
    [girl, 0.6],
  ].forEach(([c, o]) => {
    c.pose = 'walk';
    c.ov = null;
    c.tp.set(o, 0, 30.5);
    c.g.position.copy(c.tp);
    c.tr = Math.PI;
    c.g.rotation.y = Math.PI;
  });
  cat.position.set(0, 0, 33.4);
  camera.position.set(0, 28, 50);
  look.set(0, 4, 0);
  fadeEl.style.opacity = 0;
  const idle = async () => {
    await sleep(200);
    while (ok() && busy) await sleep(120);
  };
  const walk = async (x, z) => {
    dest = V(x, 0, z);
    const t0 = Date.now();
    while (ok() && Date.now() - t0 < 18000 && Math.hypot(P.pos.x - x, P.pos.z - z) > 0.7)
      await sleep(100);
    dest = null;
  };
  const chase = { type: 'chase', r: 7.5, h: 3.4 },
    orb = (at, r, h, a0, speed = 0.45) => ({ type: 'orbit', at, r, h, a0, speed }),
    behind = () => P.heading + Math.PI + 0.6;
  cap('Welcome to your kingdom');
  await sleep(6500);
  if (!ok()) return;
  shot = chase;
  cap('Through the golden gate…');
  await walk(0, 22.5);
  if (!ok()) return;
  await walk(-6.2, 18);
  if (!ok()) return;
  cap('A rose for my rose 🌹');
  pickRose(bushes[0]);
  shot = orb(null, 6, 2.8, behind());
  while (ok() && !roseGiven) await sleep(100);
  if (!ok()) return;
  cap('Together 💕');
  shot = orb(null, 5.2, 2.2, P.heading, 0.35);
  await idle();
  if (!ok()) return;
  await sleep(2200);
  if (!ok()) return;
  shot = chase;
  cap('A cozy little gazebo for two');
  await walk(-8, 8.5);
  if (!ok()) return;
  shot = orb(() => V(-11, 2, 7.2), 9, 3.6, 0.3);
  await sleep(4500);
  if (!ok()) return;
  shot = chase;
  cap('Shh… a sleepy baby dragon 🐉');
  await walk(-14.5, -6.5);
  if (!ok()) return;
  faceTo(-18, -10);
  shot = orb(
    () => V((P.pos.x + dragon.position.x) / 2, 1.8, (P.pos.z + dragon.position.z) / 2),
    8,
    3.4,
    behind(),
  );
  await sleep(1800);
  if (!ok()) return;
  cap('…and she wakes up! 💖');
  wakeDragon();
  await sleep(8500);
  if (!ok()) return;
  shot = chase;
  cap('A throne for my princess 👑');
  await walk(-10, 2);
  if (!ok()) return;
  await walk(0, 6.5);
  if (!ok()) return;
  faceTo(0, 2.2);
  shot = orb(() => V(0, 1.6, 3), 8.5, 3.2, 0, 0.4);
  crownHer();
  await idle();
  if (!ok()) return;
  await sleep(1200);
  shot = chase;
  cap('Make a wish together ✨');
  await walk(10.5, 10.5);
  if (!ok()) return;
  faceTo(13, 8);
  shot = orb(null, 6, 2.8, behind());
  wish();
  await sleep(9000);
  if (!ok()) return;
  $('close').onclick();
  await sleep(700);
  if (!ok()) return;
  shot = chase;
  cap('A swing for two 💕');
  await walk(16, 3);
  if (!ok()) return;
  shot = orb(() => V(20, 1.4, 3), 6.5, 2.4, -Math.PI / 2, 0.4);
  swingRide();
  await idle();
  if (!ok()) return;
  await sleep(600);
  if (!ok()) return;
  cap('Happy Princess Day 👑');
  shot = { type: 'wide', r: 46, h: 20, speed: 0.08 };
  confetti(V(0, 10, 6), 220);
  every(220, 5500, () =>
    hearts(V((Math.random() - 0.5) * 14, 4, Math.random() * 12), 3, {
      size: 1.3,
      spread: 8,
      vy: 2,
      life: 3,
    }),
  );
  await sleep(8500);
  if (!ok()) return;
  stopTour();
}
$('goTour').onclick = startTour;
$('bAuto').onclick = () => (mode === 'tour' ? stopTour() : startTour());

/* ---------- music (Web Audio) ---------- */
let ac,
  master,
  mIv,
  step = 0;
const chords = [
  [261.63, 329.63, 392],
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 246.94, 293.66],
];
function note(f, t, d, v, type = 'triangle') {
  const o = ac.createOscillator(),
    g = ac.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + d + 0.05);
}
function tick() {
  const t = ac.currentTime + 0.05,
    ch = chords[(step >> 3) % 4],
    i = step % 8;
  note(ch[[0, 1, 2, 1, 2, 1, 2, 1][i]] * 2, t, 1.2, 0.5);
  if (i === 0) ch.forEach((f) => note(f / 2, t, 3.4, 0.35, 'sine'));
  if (i === 4) note(ch[2] * (step % 16 < 8 ? 2 : 2.5), t, 1.6, 0.35, 'sine');
  step++;
}
$('bMusic').onclick = () => {
  if (mIv) {
    clearInterval(mIv);
    mIv = 0;
    $('bMusic').textContent = '🎵 Music: off';
    return;
  }
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain();
    master.gain.value = 0.14;
    const d = ac.createDelay();
    d.delayTime.value = 0.34;
    const fb = ac.createGain();
    fb.gain.value = 0.42;
    master.connect(ac.destination);
    master.connect(d);
    d.connect(fb);
    fb.connect(d);
    d.connect(ac.destination);
  }
  ac.resume();
  mIv = setInterval(tick, 430);
  tick();
  $('bMusic').textContent = '🎵 Music: on';
};

/* ---------- update ---------- */
const angd = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
function movePlayer(dt) {
  moving = false;
  if (busy || mode === 'intro') return;
  const ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x,
    iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
  let mx = 0,
    mz = 0;
  if (mode !== 'tour' && Math.abs(ix) + Math.abs(iy) > 0.1) {
    dest = null;
    let fx = P.pos.x - camera.position.x,
      fz = P.pos.z - camera.position.z;
    const l = Math.hypot(fx, fz) || 1;
    fx /= l;
    fz /= l;
    mx = fx * iy - fz * ix;
    mz = fz * iy + fx * ix;
  } else if (dest) {
    const dx = dest.x - P.pos.x,
      dz = dest.z - P.pos.z,
      d = Math.hypot(dx, dz);
    if (d < 0.3) dest = null;
    else {
      mx = dx / d;
      mz = dz / d;
    }
  }
  const m = Math.hypot(mx, mz);
  if (m < 0.05) return;
  moving = true;
  const k = Math.min(1, m);
  mx /= m;
  mz /= m;
  P.pos.x += mx * 5.2 * k * dt;
  P.pos.z += mz * 5.2 * k * dt;
  P.heading += angd(P.heading, Math.atan2(mx, mz)) * Math.min(1, dt * 8);
  circles.forEach((c) => {
    const dx = P.pos.x - c.x,
      dz = P.pos.z - c.z,
      d = Math.hypot(dx, dz),
      r = c.r + 0.8;
    if (d < r && d > 0) {
      P.pos.x = c.x + (dx / d) * r;
      P.pos.z = c.z + (dz / d) * r;
    }
  });
  boxes.forEach((b) => {
    const dx = P.pos.x - b.x,
      dz = P.pos.z - b.z,
      ox = b.hx + 0.8 - Math.abs(dx),
      oz = b.hz + 0.8 - Math.abs(dz);
    if (ox > 0 && oz > 0) {
      if (ox < oz) P.pos.x += Math.sign(dx) * ox;
      else P.pos.z += Math.sign(dz) * oz;
    }
  });
  const l = Math.hypot(P.pos.x, P.pos.z);
  if (l > 33 && P.pos.z < 33) {
    P.pos.x *= 33 / l;
    P.pos.z *= 33 / l;
  }
}
function updChar(c, dt) {
  const g = c.g,
    sw = moving && !custom ? Math.sin(time * 11) * 0.7 : 0,
    k = Math.min(1, dt * 9);
  g.position.lerp(c.tp, k);
  g.rotation.y += angd(g.rotation.y, c.tr) * k;
  const lt = c.pose === 'sit' ? -1.45 : c.pose === 'kneel' ? 1.3 : sw;
  c.legs[-1].rotation.x += (lt - c.legs[-1].rotation.x) * k;
  c.legs[1].rotation.x += ((c.pose === 'walk' ? -sw : lt) - c.legs[1].rotation.x) * k;
  const tg = {
    [c.inner]: c.ov ? c.ov.i : [0, c.inner * 0.55],
    [c.outer]: c.ov ? c.ov.o : [-sw * 0.8 * c.outer * -1, c.outer * 0.12],
  };
  [-1, 1].forEach((s) => {
    const a = c.arms[s];
    a.rotation.x += (tg[s][0] - a.rotation.x) * k;
    a.rotation.z += (tg[s][1] - a.rotation.z) * k;
  });
}
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  time += dt;
  for (let i = 0; i < oPos.count; i++) {
    const x = oPos.getX(i),
      z = oPos.getZ(i);
    oPos.setY(i, Math.sin(x * 0.09 + time * 0.9) * 0.28 + Math.cos(z * 0.11 + time * 0.7) * 0.28);
  }
  oPos.needsUpdate = true;
  foam.scale.setScalar(1 + Math.sin(time * 1.3) * 0.015);
  foam.material.opacity = 0.35 + Math.sin(time * 1.3) * 0.15;
  clouds.forEach((c) => {
    c.userData.a += dt * 0.01;
    c.position.x = Math.cos(c.userData.a) * c.userData.r;
    c.position.z = Math.sin(c.userData.a) * c.userData.r;
  });
  for (let i = 0; i < FN; i++) {
    const j = i * 3;
    fpos[j + 1] += Math.sin(time * 0.8 + fph[i]) * 0.01;
    fpos[j] += Math.cos(time * 0.5 + fph[i]) * 0.01;
    fpos[j + 2] += Math.sin(time * 0.6 + fph[i] * 2) * 0.01;
  }
  fg.attributes.position.needsUpdate = true;
  flags.forEach((f, i) => (f.rotation.y = Math.sin(time * 3 + i) * 0.35));
  birds.forEach((g) => {
    const u = g.u;
    u.a += u.sp * dt;
    const f = (a) =>
        V(u.ox + Math.cos(a) * u.R, u.h + Math.sin(a * 3 + u.ph) * 1.2, u.oz + Math.sin(a) * u.R),
      p = f(u.a),
      n = f(u.a + 0.05 * Math.sign(u.sp));
    g.position.copy(p);
    g.rotation.y = Math.atan2(n.x - p.x, n.z - p.z);
    g.rotation.z = -Math.sign(u.sp) * 0.25;
    g.w.forEach((w) => (w.rotation.z = w.s * (Math.sin(time * 9 + u.ph) * 0.6 + 0.1)));
  });
  swAmp += (swTarget - swAmp) * Math.min(1, dt * 1.5);
  swPh += dt * (1.1 + (swAmp - 0.2) * 2.3);
  swingSeat.rotation.x = Math.sin(swPh) * swAmp;
  if (Math.random() < dt * 1.3)
    hearts(V(20, 2.6, 3), 1, { size: 0.35, spread: 2, vy: 0.8, life: 3 });
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i];
    t.t += dt;
    const k = Math.min(1, t.t / t.d);
    t.f(k);
    if (k >= 1) {
      tweens.splice(i, 1);
      t.done && t.done();
    }
  }
  movePlayer(dt);
  if (!custom) {
    const rx = Math.cos(P.heading),
      rz = -Math.sin(P.heading),
      by = moving ? Math.abs(Math.sin(time * 11)) * 0.07 : 0;
    boy.tp.set(P.pos.x + rx * 0.6, by, P.pos.z + rz * 0.6);
    girl.tp.set(P.pos.x - rx * 0.6, by, P.pos.z - rz * 0.6);
    boy.tr = girl.tr = P.heading;
  }
  if (seated) {
    swingSeat.aB.getWorldPosition(boy.tp);
    swingSeat.aG.getWorldPosition(girl.tp);
  }
  updChar(boy, dt);
  updChar(girl, dt);
  if (seated) {
    boy.g.position.copy(boy.tp);
    girl.g.position.copy(girl.tp);
  }
  /* cat */
  {
    const bx = -Math.sin(P.heading),
      bz = -Math.cos(P.heading),
      tx = P.pos.x + bx * 1.7 + Math.cos(P.heading) * 0.9,
      tz = P.pos.z + bz * 1.7 - Math.sin(P.heading) * 0.9,
      dx = tx - cat.position.x,
      dz = tz - cat.position.z,
      d = Math.hypot(dx, dz);
    if (d > 0.5) {
      const sp = Math.min(6, d * 2.2);
      cat.position.x += (dx / d) * sp * dt;
      cat.position.z += (dz / d) * sp * dt;
      cat.rotation.y += angd(cat.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 10);
      cat.position.y = Math.abs(Math.sin(time * 13)) * 0.1;
    } else cat.position.y *= 0.8;
    cat.tail.rotation.z = Math.sin(time * 3) * 0.4;
  }
  /* dragon */
  {
    const d = dragon;
    if (d.awake) {
      d.t += dt;
      if (d.t > 9) d.awake = false;
    }
    const up = d.awake ? 1 : 0;
    d.hb += (up - d.hb) * Math.min(1, dt * 3);
    d.position.y = 0.9 + d.hb * (1.5 + Math.sin(time * 2.5) * 0.25);
    d.eo.visible = d.awake;
    d.ec.visible = !d.awake;
    d.z.visible = !d.awake;
    d.z.position.y = 2.4 + Math.sin(time * 1.5) * 0.2;
    d.wings.forEach(
      (w) => (w.rotation.z = w.s * (d.awake ? Math.sin(time * 14) * 0.7 + 0.3 : -0.15)),
    );
    d.scale.setScalar(0.9 * (1 + (d.awake ? 0 : Math.sin(time * 1.6) * 0.025)));
    if (d.awake) {
      d.rotation.y +=
        angd(d.rotation.y, Math.atan2(P.pos.x - d.position.x, P.pos.z - d.position.z)) * dt * 3;
      if (Math.random() < dt * 7)
        hearts(V(d.position.x, d.position.y + 1.8, d.position.z), 1, { spread: 1 });
      if (Math.random() < dt * 10)
        sparks(V(d.position.x, d.position.y + 1, d.position.z), 1, { spread: 2.5, vy: 0.6 });
    }
  }
  if (Math.random() < dt * 7)
    sparks(V(13, 1.1, 8), 1, { spread: 0.9, vy: 0.7, size: 0.3, life: 2.4 });
  /* particles */
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life += dt;
    p.s.position.addScaledVector(p.v, dt);
    const k = p.life / p.max;
    p.s.material.opacity = Math.max(0, 1 - k * k);
    if (k >= 1) {
      scene.remove(p.s);
      p.s.material.dispose();
      parts.splice(i, 1);
    }
  }
  for (let i = conf.length - 1; i >= 0; i--) {
    const c = conf[i];
    c.t += dt;
    c.v.y -= 7 * dt;
    c.v.x *= 0.99;
    c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += c.r.x * dt;
    c.m.rotation.y += c.r.y * dt;
    if (c.m.position.y < 0.05 || c.t > 5) {
      scene.remove(c.m);
      c.m.material.dispose();
      conf.splice(i, 1);
    }
  }
  /* camera */
  let dp, dl;
  if (mode === 'follow') {
    const cp = Math.cos(pitch);
    dp = V(
      P.pos.x + Math.sin(yaw) * cp * dist,
      1.4 + Math.sin(pitch) * dist,
      P.pos.z + Math.cos(yaw) * cp * dist,
    );
    dl = V(P.pos.x, 1.3, P.pos.z);
  } else if (mode === 'tour') {
    const q = shot;
    if (q.type === 'chase') tourA += angd(tourA, P.heading + Math.PI + 0.7) * Math.min(1, dt * 1.6);
    else if (q.type === 'orbit') tourA = q.a0 + Math.sin(time * q.speed) * 0.8;
    else tourA += dt * q.speed;
    const c = q.type === 'wide' ? V(0, 4, 0) : q.at ? q.at() : V(P.pos.x, 1.4, P.pos.z);
    dp = V(c.x + Math.sin(tourA) * q.r, q.h, c.z + Math.cos(tourA) * q.r);
    dl = c;
  } else {
    droneA += dt * 0.11;
    dp = V(Math.sin(droneA) * 54, 27, Math.cos(droneA) * 54);
    dl = V(0, 3, 0);
  }
  camera.position.lerp(dp, 1 - Math.exp(-dt * (mode === 'follow' ? 7 : mode === 'tour' ? 2.5 : 2)));
  look.lerp(dl, 1 - Math.exp(-dt * 5));
  camera.lookAt(look);
  /* prompt */
  let best = null,
    bd = 1e9;
  if (!busy && mode !== 'intro' && mode !== 'tour')
    stations.forEach((s) => {
      const d = Math.hypot(P.pos.x - s.x, P.pos.z - s.z);
      if (d < s.r && d < bd && (!s.ok || s.ok())) {
        best = s;
        bd = d;
      }
    });
  if (best !== cur) {
    cur = best;
    if (cur) {
      pr.textContent = cur.label;
      pr.classList.add('show');
    } else pr.classList.remove('show');
  }
  renderer.render(scene, camera);
}
const clock = new T.Clock(),
  look = V(0, 3, 0);
camera.position.set(Math.sin(0.6) * 54, 27, Math.cos(0.6) * 54);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
girl.g.position.copy(P.pos);
boy.g.position.copy(P.pos);
loop();
