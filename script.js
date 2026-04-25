/* Swap this for your own public Spotify playlist (ID from share link). */
const SPOTIFY_PLAYLIST_ID = "37i9dQZEVXdgbogmVOHk6L";

(function initVibe() {
  const panel = document.getElementById("vibe-panel");
  const btn = document.getElementById("vibe-toggle");
  const frame = document.getElementById("spotify-frame");
  if (!panel || !btn || !frame) return;

  const src = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`;
  let loaded = false;

  btn.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && !loaded) {
      frame.src = src;
      loaded = true;
    }
  });
})();

(function initHeroHolePopup() {
  const holeBtn = document.getElementById("hero-hole-btn");
  const pop = document.getElementById("hero-hole-pop");
  if (!holeBtn || !pop) return;

  let hideTimer = null;
  holeBtn.addEventListener("click", () => {
    pop.classList.add("is-open");
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      pop.classList.remove("is-open");
      hideTimer = null;
    }, 2500);
  });
})();

(function initMiniGolf() {
  const canvas = document.getElementById("mini-golf-canvas");
  const angleInput = document.getElementById("mini-golf-angle");
  const powerInput = document.getElementById("mini-golf-power");
  const shootBtn = document.getElementById("mini-golf-shoot");
  const resetBtn = document.getElementById("mini-golf-reset");
  const statusEl = document.getElementById("mini-golf-status");
  if (!canvas || !angleInput || !powerInput || !shootBtn || !resetBtn || !statusEl) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const state = {
    hole: 1,
    strokes: 0,
    ball: { x: 58, y: H - 56, vx: 0, vy: 0, r: 8 },
    cup: { x: W - 74, y: 70, r: 12 },
    obstacles: [],
    moving: false,
    completed: false,
    autoNextTimer: null,
    lastFrame: performance.now(),
  };

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeObstacle() {
    const w = randomBetween(56, 112);
    const h = randomBetween(30, 72);
    const x = randomBetween(122, W - w - 38);
    const y = randomBetween(26, H - h - 26);
    return { x, y, w, h };
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function obstacleTooClose(obstacle) {
    const cx = obstacle.x + obstacle.w * 0.5;
    const cy = obstacle.y + obstacle.h * 0.5;
    const startNear = distance(cx, cy, 58, H - 56) < 86;
    const cupNear = distance(cx, cy, state.cup.x, state.cup.y) < 78;
    return startNear || cupNear;
  }

  function createHole(nextHole) {
    if (state.autoNextTimer) {
      clearTimeout(state.autoNextTimer);
      state.autoNextTimer = null;
    }
    if (nextHole) state.hole += 1;
    state.strokes = 0;
    state.completed = false;
    state.moving = false;
    state.ball.x = 58;
    state.ball.y = H - 56;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.cup.x = randomBetween(W * 0.58, W - 56);
    state.cup.y = randomBetween(54, H - 54);

    const obstacles = [];
    let guard = 0;
    while (obstacles.length < 3 && guard < 120) {
      guard += 1;
      const obstacle = makeObstacle();
      if (obstacleTooClose(obstacle)) continue;
      obstacles.push(obstacle);
    }
    state.obstacles = obstacles;
    setStatus(`Hole ${state.hole} - Strokes: 0`);
  }

  function drawRoundedRect(x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawCourse() {
    const field = ctx.createLinearGradient(0, 0, 0, H);
    field.addColorStop(0, "#9be27f");
    field.addColorStop(1, "#67b758");
    ctx.fillStyle = field;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    for (let y = 14; y < H; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    for (const o of state.obstacles) {
      drawRoundedRect(o.x, o.y, o.w, o.h, 12);
      const sand = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      sand.addColorStop(0, "#f3d79e");
      sand.addColorStop(1, "#d6b06c");
      ctx.fillStyle = sand;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(105, 82, 42, 0.4)";
      ctx.stroke();
    }

    ctx.fillStyle = "#182032";
    ctx.beginPath();
    ctx.arc(state.cup.x, state.cup.y, state.cup.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(state.cup.x, state.cup.y + state.cup.r + 2, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f3f6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.cup.x, state.cup.y - 2);
    ctx.lineTo(state.cup.x, state.cup.y - 30);
    ctx.stroke();
    ctx.fillStyle = "#ff5b97";
    ctx.beginPath();
    ctx.moveTo(state.cup.x + 1, state.cup.y - 30);
    ctx.lineTo(state.cup.x + 17, state.cup.y - 24);
    ctx.lineTo(state.cup.x + 1, state.cup.y - 18);
    ctx.closePath();
    ctx.fill();
  }

  function drawAimGuide() {
    if (state.moving || state.completed) return;
    const angle = (Number(angleInput.value) * Math.PI) / 180;
    const power = Number(powerInput.value);
    const len = 20 + power * 0.85;
    const x2 = state.ball.x + Math.cos(angle) * len;
    const y2 = state.ball.y + Math.sin(angle) * len;
    ctx.strokeStyle = "rgba(12, 35, 62, 0.58)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.ball.x, state.ball.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = "rgba(12, 35, 62, 0.75)";
    ctx.beginPath();
    ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBall() {
    ctx.fillStyle = "rgba(14, 26, 42, 0.28)";
    ctx.beginPath();
    ctx.ellipse(state.ball.x, state.ball.y + state.ball.r + 3, state.ball.r * 1.05, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const ballGrad = ctx.createRadialGradient(
      state.ball.x - 2,
      state.ball.y - 3,
      1,
      state.ball.x,
      state.ball.y,
      state.ball.r
    );
    ballGrad.addColorStop(0, "#ffffff");
    ballGrad.addColorStop(1, "#d7e2f4");
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(40, 60, 95, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function resolveObstacleBounce(o) {
    const nearestX = Math.max(o.x, Math.min(state.ball.x, o.x + o.w));
    const nearestY = Math.max(o.y, Math.min(state.ball.y, o.y + o.h));
    const dx = state.ball.x - nearestX;
    const dy = state.ball.y - nearestY;
    const distSq = dx * dx + dy * dy;
    if (distSq >= state.ball.r * state.ball.r) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      state.ball.vx *= -0.78;
      state.ball.x = dx > 0 ? nearestX + state.ball.r : nearestX - state.ball.r;
    } else {
      state.ball.vy *= -0.78;
      state.ball.y = dy > 0 ? nearestY + state.ball.r : nearestY - state.ball.r;
    }
  }

  function physicsStep(dt) {
    if (!state.moving) return;
    const timeScale = Math.min(2, dt * 60);
    state.ball.x += state.ball.vx * timeScale;
    state.ball.y += state.ball.vy * timeScale;

    const r = state.ball.r;
    if (state.ball.x < r) {
      state.ball.x = r;
      state.ball.vx *= -0.8;
    } else if (state.ball.x > W - r) {
      state.ball.x = W - r;
      state.ball.vx *= -0.8;
    }
    if (state.ball.y < r) {
      state.ball.y = r;
      state.ball.vy *= -0.8;
    } else if (state.ball.y > H - r) {
      state.ball.y = H - r;
      state.ball.vy *= -0.8;
    }

    for (const o of state.obstacles) resolveObstacleBounce(o);

    const drag = Math.pow(0.985, timeScale);
    state.ball.vx *= drag;
    state.ball.vy *= drag;

    const speed = Math.hypot(state.ball.vx, state.ball.vy);
    const cupDist = distance(state.ball.x, state.ball.y, state.cup.x, state.cup.y);
    if (cupDist < state.cup.r - 2 && speed < 1.8) {
      state.moving = false;
      state.completed = true;
      state.ball.vx = 0;
      state.ball.vy = 0;
      state.ball.x = state.cup.x;
      state.ball.y = state.cup.y;
      setStatus(`Hole in ${state.strokes}! Loading next hole...`);
      state.autoNextTimer = window.setTimeout(() => createHole(true), 1100);
      return;
    }

    if (speed < 0.06) {
      state.moving = false;
      state.ball.vx = 0;
      state.ball.vy = 0;
      setStatus(`Hole ${state.hole} - Strokes: ${state.strokes}`);
    }
  }

  function shoot() {
    if (state.moving || state.completed) return;
    const angle = (Number(angleInput.value) * Math.PI) / 180;
    const power = Number(powerInput.value);
    const speed = 0.12 * power + 1.2;
    state.ball.vx = Math.cos(angle) * speed;
    state.ball.vy = Math.sin(angle) * speed;
    state.moving = true;
    state.strokes += 1;
    setStatus(`Hole ${state.hole} - Strokes: ${state.strokes}`);
  }

  function tick(now) {
    const dt = Math.min(0.034, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    physicsStep(dt);
    drawCourse();
    drawAimGuide();
    drawBall();
    requestAnimationFrame(tick);
  }

  shootBtn.addEventListener("click", shoot);
  resetBtn.addEventListener("click", () => createHole(false));
  window.addEventListener("keydown", (e) => {
    if (e.key === " " && document.activeElement !== angleInput && document.activeElement !== powerInput) {
      e.preventDefault();
      shoot();
    }
  });

  createHole(false);
  requestAnimationFrame((now) => {
    state.lastFrame = now;
    tick(now);
  });
})();

(function initPhotoReplace() {
  const photos = Array.from(
    document.querySelectorAll(".place .slot img, .place-photos--gallery img")
  );
  if (!photos.length) return;
  const LEGACY_STORAGE_KEY = "birthdayPhotoReplacementsV1";
  const FALLBACK_STORAGE_KEY = "birthdayPhotoReplacementsV2";
  const DB_NAME = "birthday-photo-replacements";
  const STORE_NAME = "photos";

  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/*";
  picker.style.position = "fixed";
  picker.style.left = "-9999px";
  picker.style.width = "1px";
  picker.style.height = "1px";
  picker.setAttribute("aria-hidden", "true");
  document.body.appendChild(picker);

  let activePhoto = null;
  const objectUrls = new WeakMap();
  let fallbackMap = {};

  try {
    fallbackMap = JSON.parse(localStorage.getItem(FALLBACK_STORAGE_KEY) || "{}");
  } catch {
    fallbackMap = {};
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function toDataUrl(fileOrBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });
  }

  function saveFallbackMap() {
    try {
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(fallbackMap));
    } catch {
      // Ignore storage quota/security issues.
    }
  }

  async function getStoredBlob(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  async function setStoredBlob(id, blob) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  }

  async function migrateLegacyLocalStorage() {
    let legacyMap = {};
    try {
      legacyMap = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "{}");
    } catch {
      legacyMap = {};
    }

    const ids = Object.keys(legacyMap);
    if (!ids.length) return;

    for (const id of ids) {
      const dataUrl = legacyMap[id];
      if (!dataUrl || typeof dataUrl !== "string") continue;
      if (!dataUrl.startsWith("data:")) continue;
      fallbackMap[id] = dataUrl;
      try {
        const blob = await fetch(dataUrl).then((r) => r.blob());
        await setStoredBlob(id, blob);
      } catch {
        // Ignore per-item migration failures.
      }
    }
    saveFallbackMap();

    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup errors.
    }
  }

  function applyFallbackReplacement(photo, id) {
    const dataUrl = fallbackMap[id];
    if (!dataUrl || typeof dataUrl !== "string") return false;
    photo.src = dataUrl;
    return true;
  }

  async function applyIndexedDbReplacement(photo, id) {
    try {
      const blob = await getStoredBlob(id);
      if (!blob) return false;
      const prevUrl = objectUrls.get(photo);
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      const nextUrl = URL.createObjectURL(blob);
      photo.src = nextUrl;
      objectUrls.set(photo, nextUrl);
      return true;
    } catch {
      // Ignore missing/inaccessible storage and keep default photo.
      return false;
    }
  }

  function openPicker(photo) {
    activePhoto = photo;
    picker.value = "";
    picker.click();
  }

  photos.forEach((photo, idx) => {
    const id = `photo-${idx + 1}`;
    photo.dataset.photoId = id;
    photo.classList.add("is-replaceable-photo");
    photo.tabIndex = 0;
    photo.setAttribute("role", "button");
    photo.setAttribute(
      "aria-label",
      `Replace photo ${idx + 1}. Press Enter or Space to choose a new image.`
    );

    photo.addEventListener("click", () => openPicker(photo));
    photo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker(photo);
      }
    });

    // Apply local fallback immediately.
    applyFallbackReplacement(photo, id);
  });

  migrateLegacyLocalStorage().finally(() => {
    photos.forEach((photo, idx) => {
      const id = `photo-${idx + 1}`;
      applyIndexedDbReplacement(photo, id);
    });
  });

  picker.addEventListener("change", async () => {
    const file = picker.files && picker.files[0];
    if (!activePhoto || !file) return;
    const id = activePhoto.dataset.photoId;
    if (!id) return;

    try {
      const dataUrl = await toDataUrl(file);
      fallbackMap[id] = dataUrl;
      saveFallbackMap();

      await setStoredBlob(id, file);
      const prevUrl = objectUrls.get(activePhoto);
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      const nextUrl = URL.createObjectURL(file);
      activePhoto.src = nextUrl;
      objectUrls.set(activePhoto, nextUrl);
    } catch {
      // If IndexedDB fails, keep using localStorage fallback only.
      const dataUrl = fallbackMap[id];
      if (dataUrl) activePhoto.src = dataUrl;
    }
  });
})();

(function initNycPriceGuessGame() {
  const progressEl = document.getElementById("nyc-game-progress");
  const linkEl = document.getElementById("nyc-game-link");
  const metaEl = document.getElementById("nyc-game-meta");
  const imageEl = document.getElementById("nyc-game-image");
  const imageCountEl = document.getElementById("nyc-game-image-count");
  const mediaWrap = document.getElementById("nyc-game-media");
  const prevMediaBtn = document.getElementById("nyc-media-prev");
  const nextMediaBtn = document.getElementById("nyc-media-next");
  const guessInput = document.getElementById("nyc-game-guess");
  const submitBtn = document.getElementById("nyc-game-submit");
  const nextBtn = document.getElementById("nyc-game-next");
  const restartBtn = document.getElementById("nyc-game-restart");
  const feedbackEl = document.getElementById("nyc-game-feedback");
  if (
    !progressEl ||
    !linkEl ||
    !metaEl ||
    !imageEl ||
    !imageCountEl ||
    !mediaWrap ||
    !prevMediaBtn ||
    !nextMediaBtn ||
    !guessInput ||
    !submitBtn ||
    !nextBtn ||
    !restartBtn ||
    !feedbackEl
  ) {
    return;
  }

  const NYC_LISTINGS = [
    {
      title: "301 W 115th Street #PH-4A, Manhattan",
      price: 2200000,
      details: "2 beds • 2 baths • 1,382 sqft",
      url: "https://www.coldwellbanker.com/ny/new-york/301-w-115th-st-ph-ph4a/lid-P00800000H8LRh4AI0uzMyHpqISMktk5QQ2ZQhj4",
      images: [
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/79/33/7/_P/RLS20079337_P00.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/79/33/7/_P/RLS20079337_P01.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/79/33/7/_P/RLS20079337_P02.jpg?width=1400",
      ],
    },
    {
      title: "411-421 Manhattan Avenue #4, Manhattan",
      price: 799000,
      details: "2 beds • 2 baths • 887 sqft",
      url: "https://www.coldwellbanker.com/ny/new-york/411-manhattan-ave-apt-4/lid-P00800000GtVYNi1ZQpNKIwpk261VxQg1fM1HFio",
      images: [
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/30/40/7/_P/RLS20030407_P00.png?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/30/40/7/_P/RLS20030407_P01.png?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/30/40/7/_P/RLS20030407_P02.png?width=1400",
      ],
    },
    {
      title: "161 E 110th Street #6H, Manhattan",
      price: 433000,
      details: "1 bed • 1 bath • 664 sqft",
      url: "https://www.coldwellbanker.com/ny/new-york/161-e-110th-st-apt-6h/lid-P00800000H9cqq3UjydniiOQ7VwWg2bBp3e7Vp0R",
      images: [
        "https://images-listings.coldwellbanker.com/PA_PWAR/PW/26/10/00/_P/PW261000_P00.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/PA_PWAR/PW/26/10/00/_P/PW261000_P01.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/PA_PWAR/PW/26/10/00/_P/PW261000_P02.jpg?width=1400",
      ],
    },
    {
      title: "111 Central Park N #10B, Manhattan",
      price: 2495000,
      details: "3 beds • 3 baths • 1,936 sqft",
      url: "https://www.coldwellbanker.com/ny/new-york/111-central-park-n-apt-10b/lid-P00800000GyWdQsksGnftqOkxtxp18yTHTNTXg0A",
      images: [
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/49/08/0/_P/RLS20049080_P00.png?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/49/08/0/_P/RLS20049080_P01.png?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/49/08/0/_P/RLS20049080_P02.png?width=1400",
      ],
    },
    {
      title: "608 Ocean Avenue #904, Brooklyn",
      price: 550000,
      details: "1 bed • 2 baths • 454 sqft",
      url: "https://www.coldwellbanker.com/ny/brooklyn/608-ocean-ave--904/lid-P00800000Gws96pEiH27DgTL20JH2usyGaZ48bMu",
      images: [
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/43/29/4/_P/RLS20043294_P00.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/43/29/4/_P/RLS20043294_P01.jpg?width=1400",
        "https://images-listings.coldwellbanker.com/NY_REBNY/RL/S2/00/43/29/4/_P/RLS20043294_P02.jpg?width=1400",
      ],
    },
  ];

  let index = 0;
  let score = 0;
  let locked = false;
  let mediaIndex = 0;

  const fmt = new Intl.NumberFormat("en-US");
  function dollars(n) {
    return `$${fmt.format(Math.round(n))}`;
  }

  function renderMedia() {
    const listing = NYC_LISTINGS[index];
    const images = listing.images || [];
    if (!images.length) {
      mediaWrap.hidden = true;
      imageCountEl.textContent = "";
      return;
    }
    mediaWrap.hidden = false;
    mediaIndex = Math.min(images.length - 1, Math.max(0, mediaIndex));
    imageEl.src = images[mediaIndex];
    imageCountEl.textContent = images.length > 1 ? `Photo ${mediaIndex + 1} of ${images.length}` : "Photo 1 of 1";
    prevMediaBtn.hidden = images.length <= 1;
    nextMediaBtn.hidden = images.length <= 1;
    prevMediaBtn.disabled = mediaIndex === 0;
    nextMediaBtn.disabled = mediaIndex === images.length - 1;
  }

  function render() {
    const item = NYC_LISTINGS[index];
    progressEl.textContent = `Listing ${index + 1} of ${NYC_LISTINGS.length} — Score ${score}`;
    linkEl.textContent = item.title;
    linkEl.href = item.url;
    metaEl.textContent = item.details;
    mediaIndex = 0;
    renderMedia();
    guessInput.value = "";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    nextBtn.hidden = true;
    restartBtn.hidden = true;
    feedbackEl.textContent = "";
    feedbackEl.className = "trivia-feedback";
    locked = false;
  }

  function checkGuess() {
    if (locked) return;
    const raw = Number(guessInput.value);
    if (!Number.isFinite(raw) || raw <= 0) {
      feedbackEl.textContent = "Enter a valid dollar amount first.";
      feedbackEl.className = "trivia-feedback bad";
      return;
    }

    locked = true;
    guessInput.disabled = true;
    submitBtn.disabled = true;

    const actual = NYC_LISTINGS[index].price;
    const diff = Math.abs(raw - actual);
    const pct = (diff / actual) * 100;
    const within10 = pct <= 10;
    const within5 = pct <= 5;
    const points = within5 ? 2 : within10 ? 1 : 0;
    score += points;

    feedbackEl.textContent = `${within5 ? "Excellent" : within10 ? "Close!" : "Nice try."} You guessed ${dollars(
      raw
    )}. Asking price is ${dollars(actual)} (${pct.toFixed(1)}% off). +${points} point${
      points === 1 ? "" : "s"
    }.`;
    feedbackEl.className = `trivia-feedback ${points > 0 ? "good" : "bad"}`;

    const isLast = index === NYC_LISTINGS.length - 1;
    if (isLast) {
      restartBtn.hidden = false;
      feedbackEl.textContent += ` Final score: ${score}/${NYC_LISTINGS.length * 2}.`;
    } else {
      nextBtn.hidden = false;
    }
  }

  submitBtn.addEventListener("click", checkGuess);
  guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkGuess();
    }
  });
  nextBtn.addEventListener("click", () => {
    index += 1;
    render();
  });
  restartBtn.addEventListener("click", () => {
    index = 0;
    score = 0;
    render();
  });
  prevMediaBtn.addEventListener("click", () => {
    mediaIndex -= 1;
    renderMedia();
  });
  nextMediaBtn.addEventListener("click", () => {
    mediaIndex += 1;
    renderMedia();
  });

  render();
})();

(function initReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    nodes.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  nodes.forEach((el) => observer.observe(el));
})();

(function initInkSpread() {
  const canvas = document.getElementById("ink-canvas");
  if (!canvas) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const palette = [
    { r: 200, g: 60, b: 170 },
    { r: 40, g: 150, b: 220 },
    { r: 255, g: 200, b: 90 },
    { r: 140, g: 80, b: 200 },
  ];
  const blobs = [];
  let rafId = null;
  let pointerX = window.innerWidth * 0.5;
  let pointerY = window.innerHeight * 0.5;
  let activePointer = false;
  let spawnAccumulator = 0;
  let lastFrame = performance.now();

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addBlob(x, y) {
    blobs.push({
      x,
      y,
      r: 22 + Math.random() * 40,
      grow: 40 + Math.random() * 55,
      life: 0,
      ttl: 900 + Math.random() * 700,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.08,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
    if (blobs.length > 90) blobs.splice(0, blobs.length - 90);
  }

  function tick(now) {
    const dt = Math.min(32, now - lastFrame);
    lastFrame = now;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (activePointer) {
      spawnAccumulator += dt;
      while (spawnAccumulator > 38) {
        addBlob(pointerX + (Math.random() - 0.5) * 28, pointerY + (Math.random() - 0.5) * 28);
        spawnAccumulator -= 38;
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.filter = "blur(22px)";
    for (let i = blobs.length - 1; i >= 0; i -= 1) {
      const b = blobs[i];
      b.life += dt;
      if (b.life >= b.ttl) {
        blobs.splice(i, 1);
        continue;
      }

      const t = b.life / b.ttl;
      const eased = 1 - t;
      const radius = b.r + b.grow * t;
      b.x += b.driftX * dt;
      b.y += b.driftY * dt;

      const alpha = Math.min(0.22, 0.04 + 0.18 * eased);
      const c = b.color;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
      ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("pointermove", (event) => {
    activePointer = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
  });
  window.addEventListener("pointerleave", () => {
    activePointer = false;
  });
  window.addEventListener("blur", () => {
    activePointer = false;
  });
  window.addEventListener("resize", resize);

  resize();
  addBlob(pointerX, pointerY);
  rafId = requestAnimationFrame(tick);

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
})();

const TRIVIA_QUESTIONS = {
  easy: [
    {
      q: "Which NFL team does Philly support?",
      options: ["Eagles", "Giants", "Patriots", "Steelers"],
      correct: 0,
    },
    {
      q: "What color is most associated with the Philadelphia Eagles?",
      options: ["Orange", "Midnight green", "Purple", "Red"],
      correct: 1,
    },
    {
      q: "Which Philadelphia arena is home to the 76ers?",
      options: ["Madison Square Garden", "Wells Fargo Center", "Barclays Center", "TD Garden"],
      correct: 1,
    },
    {
      q: "The Phillies play in which baseball stadium?",
      options: ["Citizen Bank Field", "Citizens Bank Park", "Veterans Park", "Liberty Field"],
      correct: 1,
    },
    {
      q: "Which WNBA team plays in New York and uses seafoam green branding?",
      options: ["Nets", "Knicks", "Liberty", "Aces"],
      correct: 2,
    },
    {
      q: "How many points is a touchdown worth (before extra point)?",
      options: ["3", "6", "7", "8"],
      correct: 1,
    },
    {
      q: "In golf, what score is one under par on a hole?",
      options: ["Birdie", "Bogey", "Eagle", "Par save"],
      correct: 0,
    },
    {
      q: "Which sport uses a puck?",
      options: ["Lacrosse", "Hockey", "Rugby", "Handball"],
      correct: 1,
    },
    {
      q: "How many sets are usually played in a standard best-of-three tennis match?",
      options: ["1", "2", "3", "5"],
      correct: 2,
    },
    {
      q: "Which city hosts the Boston Marathon?",
      options: ["Philadelphia", "Chicago", "New York", "Boston"],
      correct: 3,
    },
  ],
  medium: [
    {
      q: "Who won Super Bowl LII over the Patriots?",
      options: ["Chiefs", "Eagles", "Rams", "Seahawks"],
      correct: 1,
    },
    {
      q: "What is the distance of a marathon?",
      options: ["24.2 miles", "25 miles", "26.2 miles", "27.2 miles"],
      correct: 2,
    },
    {
      q: "In basketball, how many personal fouls in the NBA cause disqualification?",
      options: ["5", "6", "7", "8"],
      correct: 1,
    },
    {
      q: "In baseball scoring, what does RBI stand for?",
      options: ["Run Batted In", "Runner Base Impact", "Run Base Infield", "Return Batting Index"],
      correct: 0,
    },
    {
      q: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Argentina", "Italy", "Brazil"],
      correct: 3,
    },
    {
      q: "What does PGA stand for?",
      options: [
        "Professional Golf Association",
        "Players Golf Alliance",
        "Pro Game Athletes",
        "Public Golf Administration",
      ],
      correct: 0,
    },
    {
      q: "How many players are on the field per team in soccer?",
      options: ["9", "10", "11", "12"],
      correct: 2,
    },
    {
      q: "In ice hockey, what is a hat trick?",
      options: [
        "Three goals by one player in one game",
        "Three assists in one period",
        "A shutout win",
        "Scoring in OT",
      ],
      correct: 0,
    },
    {
      q: "What is the maximum break in snooker?",
      options: ["147", "155", "180", "99"],
      correct: 0,
    },
    {
      q: "Which Grand Slam is played on red clay?",
      options: ["US Open", "Wimbledon", "Australian Open", "French Open"],
      correct: 3,
    },
  ],
  hard: [
    {
      q: "Which golfer is nicknamed 'The Golden Bear'?",
      options: ["Tom Watson", "Arnold Palmer", "Jack Nicklaus", "Gary Player"],
      correct: 2,
    },
    {
      q: "In Formula 1, how many points does the race winner currently get?",
      options: ["20", "25", "30", "18"],
      correct: 1,
    },
    {
      q: "Which nation won the first ever FIFA World Cup in 1930?",
      options: ["Brazil", "Uruguay", "Italy", "Argentina"],
      correct: 1,
    },
    {
      q: "In baseball, how many seams are on a regulation MLB baseball?",
      options: ["88", "108", "216", "72"],
      correct: 1,
    },
    {
      q: "What is the regulation height of a basketball hoop?",
      options: ["9 ft", "10 ft", "11 ft", "12 ft"],
      correct: 1,
    },
    {
      q: "In tennis tiebreaks (except deciding set variants), you generally win at:",
      options: ["5 points by 1", "7 points by 2", "10 points by 1", "6 points by 2"],
      correct: 1,
    },
    {
      q: "Which country has won the most men's Olympic basketball gold medals?",
      options: ["Spain", "USA", "Soviet Union", "France"],
      correct: 1,
    },
    {
      q: "What does a decathlon consist of?",
      options: ["8 events", "9 events", "10 events", "12 events"],
      correct: 2,
    },
    {
      q: "Which city hosted the 1992 Summer Olympics?",
      options: ["Seoul", "Barcelona", "Atlanta", "Sydney"],
      correct: 1,
    },
    {
      q: "In golf stroke play, if two players tie after 72 holes in many PGA events, it is resolved by:",
      options: ["Match play", "Aggregate 18-hole replay", "Sudden-death playoff", "Coin flip"],
      correct: 2,
    },
  ],
};

(function initTrivia() {
  const questionEl = document.getElementById("trivia-question");
  const progressEl = document.getElementById("trivia-progress");
  const optionsEl = document.getElementById("trivia-options");
  const feedbackEl = document.getElementById("trivia-feedback");
  const nextBtn = document.getElementById("trivia-next");
  const restartBtn = document.getElementById("trivia-restart");
  const modeBtns = Array.from(document.querySelectorAll(".trivia-mode-btn"));
  if (!questionEl || !progressEl || !optionsEl || !feedbackEl || !nextBtn || !modeBtns.length) return;

  let mode = "easy";
  let index = 0;
  let score = 0;
  let locked = false;

  function setMode(nextMode) {
    mode = nextMode;
    index = 0;
    score = 0;
    locked = false;
    modeBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.mode === mode));
    renderQuestion();
  }

  function renderQuestion() {
    const list = TRIVIA_QUESTIONS[mode];
    const item = list[index];
    feedbackEl.textContent = "";
    feedbackEl.className = "trivia-feedback";
    nextBtn.hidden = true;
    if (restartBtn) restartBtn.hidden = true;
    optionsEl.innerHTML = "";
    locked = false;

    progressEl.textContent = `${mode[0].toUpperCase()}${mode.slice(1)} — Question ${index + 1} of ${list.length}`;
    questionEl.textContent = item.q;

    item.options.forEach((option, optIdx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "trivia-option-btn";
      btn.textContent = option;
      btn.addEventListener("click", () => handleAnswer(optIdx));
      optionsEl.appendChild(btn);
    });
  }

  function handleAnswer(selected) {
    if (locked) return;
    const list = TRIVIA_QUESTIONS[mode];
    const item = list[index];
    const buttons = Array.from(optionsEl.querySelectorAll(".trivia-option-btn"));
    locked = true;

    buttons.forEach((btn, btnIdx) => {
      btn.disabled = true;
      if (btnIdx === item.correct) btn.classList.add("is-correct");
      if (btnIdx === selected && btnIdx !== item.correct) btn.classList.add("is-wrong");
    });

    if (selected === item.correct) {
      score += 1;
      feedbackEl.textContent = `Correct! Score: ${score}/${index + 1}`;
      feedbackEl.classList.add("good");
    } else {
      feedbackEl.textContent = `Not quite. Correct answer: ${item.options[item.correct]}`;
      feedbackEl.classList.add("bad");
    }

    const isLast = index === list.length - 1;
    if (isLast) {
      feedbackEl.textContent += ` — Final score: ${score}/${list.length}`;
      if (restartBtn) restartBtn.hidden = false;
    } else {
      nextBtn.hidden = false;
    }
  }

  nextBtn.addEventListener("click", () => {
    index += 1;
    renderQuestion();
  });

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      index = 0;
      score = 0;
      renderQuestion();
    });
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextMode = btn.dataset.mode;
      if (!nextMode || nextMode === mode) return;
      setMode(nextMode);
    });
  });

  renderQuestion();
})();
