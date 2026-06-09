(function () {
  const canvas = document.getElementById("campaignFilm");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clips = [
    { src: "film-jersey-blanc.png", code: "01", title: "JERSEY BLANC", accent: "#ff3d9a", focusX: 0.5, focusY: 0.48, zoom: 1.04, panX: 0.08, panY: -0.03 },
    { src: "gaisen-football-jersey-noir.png", code: "02", title: "FOOTBALL NOIR", accent: "#f45a1f", focusX: 0.5, focusY: 0.5, zoom: 1.08, panX: -0.08, panY: 0.02 },
    { src: "film-cropped-jersey.png", code: "03", title: "CROPPED FORM", accent: "#c9ff35", focusX: 0.48, focusY: 0.48, zoom: 1.05, panX: 0.06, panY: -0.04 },
    { src: "gaisen-rugby-polo-noir.png", code: "04", title: "RUGBY CODE", accent: "#b464ff", focusX: 0.5, focusY: 0.45, zoom: 1.1, panX: -0.06, panY: 0.05 },
    { src: "gaisen-track-pant-noir.png", code: "05", title: "TRACK LINE", accent: "#27d9ff", focusX: 0.5, focusY: 0.55, zoom: 1.08, panX: 0.05, panY: -0.02 },
    { src: "gaisen-eclipse-generated.png", code: "06", title: "ECLIPSE OPTIC", accent: "#ffffff", focusX: 0.5, focusY: 0.5, zoom: 1.07, panX: -0.05, panY: 0.03 }
  ];

  let width = 1;
  let height = 1;
  let dpr = 1;
  let start = performance.now();
  let lastDraw = 0;

  const loadedClips = clips.map(clip => {
    const img = new Image();
    img.decoding = "async";
    img.src = clip.src;
    return { ...clip, img };
  });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function ease(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawCover(image, focusX, focusY, zoom) {
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    if (!imageWidth || !imageHeight) return;

    const scale = Math.max(width / imageWidth, height / imageHeight) * zoom;
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const maxX = Math.max(0, imageWidth - sourceWidth);
    const maxY = Math.max(0, imageHeight - sourceHeight);
    const sx = clamp(maxX * focusX, 0, maxX);
    const sy = clamp(maxY * focusY, 0, maxY);
    ctx.drawImage(image, sx, sy, sourceWidth, sourceHeight, 0, 0, width, height);
  }

  function drawText(clip, progress, alpha) {
    const left = 3 * 16 * dpr;
    const bottom = height - 2.3 * 16 * dpr;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(245,242,236,0.78)";
    ctx.font = `${10 * dpr}px Montserrat, Arial, sans-serif`;
    ctx.letterSpacing = `${2.8 * dpr}px`;
    ctx.fillText(`GAISEN CAMPAIGN / ${clip.code}`, left, bottom - 82 * dpr);

    ctx.fillStyle = "rgba(245,242,236,0.96)";
    ctx.font = `${clamp(width * 0.055, 46 * dpr, 98 * dpr)}px Georgia, serif`;
    ctx.letterSpacing = "0px";
    ctx.fillText(clip.title, left, bottom);

    ctx.fillStyle = clip.accent;
    ctx.fillRect(left, bottom + 22 * dpr, (220 + 120 * progress) * dpr, 2 * dpr);
    ctx.restore();
  }

  function drawSweep(clip, progress, alpha) {
    const sweep = -width * 0.35 + progress * width * 1.7;
    ctx.save();
    ctx.globalAlpha = alpha * 0.42;
    ctx.globalCompositeOperation = "screen";
    ctx.translate(sweep, height * 0.52);
    ctx.rotate(-0.22);
    const gradient = ctx.createLinearGradient(-width * 0.2, 0, width * 0.35, 0);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.45, clip.accent);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-width * 0.25, -height, width * 0.48, height * 2);
    ctx.restore();
  }

  function drawClip(clip, progress, alpha) {
    if (!clip.img.complete || !clip.img.naturalWidth) return;

    const camera = ease(progress);
    const pulse = Math.sin(progress * Math.PI * 2);
    const focusX = clamp(clip.focusX + (camera - 0.5) * clip.panX, 0.08, 0.92);
    const focusY = clamp(clip.focusY + pulse * clip.panY, 0.08, 0.92);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = "blur(24px) saturate(1.2) brightness(0.78)";
    drawCover(clip.img, focusX, focusY, clip.zoom + 0.32 + camera * 0.08);
    ctx.filter = "none";

    ctx.globalAlpha = alpha * 0.92;
    drawCover(clip.img, focusX, focusY, clip.zoom + camera * 0.12);

    ctx.globalAlpha = alpha;
    const shade = ctx.createLinearGradient(0, 0, width, height);
    shade.addColorStop(0, "rgba(14,14,14,0.48)");
    shade.addColorStop(0.44, "rgba(14,14,14,0.04)");
    shade.addColorStop(1, "rgba(14,14,14,0.38)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);

    drawSweep(clip, progress, alpha);
    drawText(clip, progress, alpha);
    ctx.restore();
  }

  function drawLoader() {
    ctx.fillStyle = "#17120f";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(245,242,236,0.72)";
    ctx.font = `${11 * dpr}px Montserrat, Arial, sans-serif`;
    ctx.fillText("GAISEN CAMPAIGN FILM", 3 * 16 * dpr, height - 3 * 16 * dpr);
  }

  function render(now) {
    resize();

    if (!reducedMotion.matches && now - lastDraw < 32) {
      requestAnimationFrame(render);
      return;
    }
    lastDraw = now;

    const ready = loadedClips.some(clip => clip.img.complete && clip.img.naturalWidth);
    if (!ready) {
      drawLoader();
      requestAnimationFrame(render);
      return;
    }

    const totalDuration = 60000;
    const clipDuration = totalDuration / loadedClips.length;
    const elapsed = reducedMotion.matches ? 1800 : (now - start) % totalDuration;
    const index = Math.floor(elapsed / clipDuration);
    const local = (elapsed % clipDuration) / clipDuration;
    const current = loadedClips[index];
    const next = loadedClips[(index + 1) % loadedClips.length];

    ctx.fillStyle = "#17120f";
    ctx.fillRect(0, 0, width, height);
    drawClip(current, local, 1);

    if (local > 0.82) {
      const fade = ease((local - 0.82) / 0.18);
      drawClip(next, 0.08, fade);
    }

    if (!reducedMotion.matches) {
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  loadedClips.forEach(clip => {
    clip.img.addEventListener("load", () => {
      if (reducedMotion.matches) render(performance.now());
    }, { once: true });
  });

  resize();
  requestAnimationFrame(render);
})();
