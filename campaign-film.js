(function () {
  const canvas = document.getElementById("campaignFilm");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const modelFilm = new Image();
  modelFilm.decoding = "async";
  modelFilm.src = "gaisen-real-model-film-01.png";

  let width = 1;
  let height = 1;
  let dpr = 1;
  let start = performance.now();
  let lastDraw = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = 1;
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawImageFit(image, mode, progress) {
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    if (!imageWidth || !imageHeight) return;

    const coverScale = Math.max(width / imageWidth, height / imageHeight);
    const containScale = Math.min(width / imageWidth, height / imageHeight);
    const scale = mode === "cover" ? coverScale : containScale;
    const cameraX = Math.sin(progress * Math.PI * 2) * 14 * dpr;
    const cameraY = Math.cos(progress * Math.PI * 2) * 8 * dpr;
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const x = (width - drawWidth) / 2 + cameraX;
    const y = (height - drawHeight) / 2 + cameraY;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function drawLightSweep(progress) {
    const sweepX = -width * 0.18 + progress * width * 1.36;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.globalCompositeOperation = "screen";
    ctx.translate(sweepX, height * 0.48);
    ctx.rotate(-0.16);
    const gradient = ctx.createLinearGradient(-width * 0.18, 0, width * 0.28, 0);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.42, "rgba(255,61,154,0.44)");
    gradient.addColorStop(0.62, "rgba(245,242,236,0.34)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-width * 0.2, -height, width * 0.48, height * 2);
    ctx.restore();
  }

  function drawMovingBall(progress) {
    const t = (progress * 2.8) % 1;
    const arc = Math.sin(t * Math.PI);
    const x = width * (0.55 + t * 0.34);
    const y = height * (0.25 - arc * 0.12);
    const radius = clamp(width * 0.018, 10 * dpr, 24 * dpr);

    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.fillStyle = "rgba(10,10,10,0.84)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,242,236,0.34)";
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.72, -0.8, 0.8);
    ctx.stroke();
    ctx.restore();
  }

  function drawFilmText(progress) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(245,242,236,0.72)";
    ctx.font = `${10 * dpr}px Montserrat, Arial, sans-serif`;
    ctx.fillText("GAISEN REAL MODEL CAMPAIGN", 3 * 16 * dpr, height * 0.86);

    ctx.globalAlpha = 0.58;
    ctx.fillStyle = "#ff3d9a";
    ctx.fillRect(3 * 16 * dpr, height * 0.885, (180 + Math.sin(progress * Math.PI) * 110) * dpr, 2 * dpr);
    ctx.restore();
  }

  function drawLoader() {
    ctx.fillStyle = "#17120f";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(245,242,236,0.72)";
    ctx.font = `${12 * dpr}px Montserrat, Arial, sans-serif`;
    ctx.fillText("LOADING GAISEN MODEL FILM", 3 * 16 * dpr, height - 3 * 16 * dpr);
  }

  function render(now) {
    resize();
    if (!reducedMotion.matches && now - lastDraw < 33) {
      requestAnimationFrame(render);
      return;
    }
    lastDraw = now;

    if (!modelFilm.complete || !modelFilm.naturalWidth) {
      drawLoader();
      requestAnimationFrame(render);
      return;
    }

    const duration = 60000;
    const progress = reducedMotion.matches ? 0.28 : ((now - start) % duration) / duration;

    ctx.fillStyle = "#b5aa9d";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.filter = "blur(28px) saturate(1.02) brightness(0.78)";
    drawImageFit(modelFilm, "cover", progress);
    ctx.restore();

    ctx.save();
    drawImageFit(modelFilm, "contain", progress * 0.7);
    ctx.restore();

    ctx.save();
    const shade = ctx.createLinearGradient(0, 0, width, height);
    shade.addColorStop(0, "rgba(14,14,14,0.62)");
    shade.addColorStop(0.34, "rgba(14,14,14,0.2)");
    shade.addColorStop(0.72, "rgba(14,14,14,0.06)");
    shade.addColorStop(1, "rgba(14,14,14,0.32)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    drawLightSweep(progress);
    drawMovingBall(progress);
    drawFilmText(progress);

    if (!reducedMotion.matches) requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize, { passive: true });
  modelFilm.addEventListener("load", () => render(performance.now()), { once: true });
  resize();
  requestAnimationFrame(render);
})();
