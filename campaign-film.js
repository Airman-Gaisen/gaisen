(function () {
  const canvas = document.getElementById("campaignFilm");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 1;
  let height = 1;
  let dpr = 1;
  let start = performance.now();
  let lastDraw = 0;

  const looks = [
    { id: "blanc", name: "JERSEY BLANC", top: "#f2eee6", trim: "#0d0d0d", pants: "#151515", accent: "#ff3d9a", number: "82", hair: "#1a120d", skin: "#c4906f" },
    { id: "noir", name: "FOOTBALL NOIR", top: "#080808", trim: "#ff9fbd", pants: "#0f0f0f", accent: "#ff78aa", number: "23", hair: "#24140e", skin: "#9f654c" },
    { id: "rugby", name: "RUGBY CODE", top: "#111111", trim: "#e8ded0", pants: "#efe8dc", accent: "#f46a22", number: "", hair: "#0d0d0d", skin: "#d1a17b" },
    { id: "crop", name: "CROPPED FORM", top: "#f9f3ee", trim: "#1a1a1a", pants: "#ff4fa3", accent: "#c9ff35", number: "07", hair: "#332014", skin: "#b87858" }
  ];

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

  function roundRect(x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawLimb(x1, y1, x2, y2, x3, y3, widthPx, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
  }

  function drawBackground(scene, progress) {
    const warm = ctx.createLinearGradient(0, 0, width, height);
    warm.addColorStop(0, "#a99b8c");
    warm.addColorStop(0.45, "#ddd3c7");
    warm.addColorStop(1, "#6f675f");
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, width, height);

    const wash = ctx.createRadialGradient(width * 0.62, height * 0.48, 0, width * 0.62, height * 0.48, width * 0.72);
    wash.addColorStop(0, "rgba(255,255,255,0.28)");
    wash.addColorStop(0.38, "rgba(245,242,236,0.08)");
    wash.addColorStop(1, "rgba(14,14,14,0.2)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#f5f2ec";
    ctx.lineWidth = 1 * dpr;
    const offset = (progress * width * 0.18) % (96 * dpr);
    for (let x = -120 * dpr - offset; x < width + 160 * dpr; x += 96 * dpr) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.08);
      ctx.lineTo(x + width * 0.18, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#0e0e0e";
    ctx.font = `${clamp(width * 0.12, 120 * dpr, 230 * dpr)}px Georgia, serif`;
    ctx.fillText("GAISEN", width * 0.53, height * 0.28);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#0e0e0e";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.78);
    ctx.lineTo(width, height * 0.69);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "rgba(14,14,14,0.36)";
    ctx.fillRect(0, 0, width * 0.18, height);
    ctx.restore();
  }

  function drawJersey(look, x, y, s, lean, breath) {
    const torsoW = 88 * s;
    const torsoH = look.id === "crop" ? 102 * s : 138 * s;
    const topY = y - 315 * s + breath;

    ctx.save();
    ctx.translate(x, topY);
    ctx.rotate(lean * 0.06);

    ctx.fillStyle = look.top;
    ctx.beginPath();
    ctx.moveTo(-torsoW * 0.5, 0);
    ctx.lineTo(torsoW * 0.5, 0);
    ctx.lineTo(torsoW * 0.62, torsoH * 0.92);
    ctx.quadraticCurveTo(0, torsoH * 1.05, -torsoW * 0.62, torsoH * 0.92);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = look.trim;
    if (look.id === "rugby") {
      ctx.fillRect(-torsoW * 0.58, torsoH * 0.42, torsoW * 1.16, 18 * s);
      ctx.fillStyle = look.accent;
      ctx.fillRect(-torsoW * 0.58, torsoH * 0.53, torsoW * 1.16, 16 * s);
    } else {
      ctx.fillRect(-torsoW * 0.5, torsoH * 0.34, torsoW, 5 * s);
      ctx.fillRect(-torsoW * 0.5, torsoH * 0.45, torsoW, 5 * s);
    }

    ctx.fillStyle = look.trim;
    if (look.id !== "noir") {
      ctx.fillRect(-torsoW * 0.67, 20 * s, 28 * s, 6 * s);
      ctx.fillRect(torsoW * 0.37, 20 * s, 28 * s, 6 * s);
      ctx.fillRect(-torsoW * 0.67, 34 * s, 28 * s, 6 * s);
      ctx.fillRect(torsoW * 0.37, 34 * s, 28 * s, 6 * s);
    } else {
      ctx.fillStyle = look.accent;
      ctx.fillRect(-torsoW * 0.65, 22 * s, 28 * s, 5 * s);
      ctx.fillRect(torsoW * 0.37, 22 * s, 28 * s, 5 * s);
      ctx.fillRect(-torsoW * 0.65, 36 * s, 28 * s, 5 * s);
      ctx.fillRect(torsoW * 0.37, 36 * s, 28 * s, 5 * s);
    }

    if (look.id === "rugby") {
      ctx.fillStyle = look.trim;
      ctx.beginPath();
      ctx.moveTo(-24 * s, 0);
      ctx.lineTo(0, 32 * s);
      ctx.lineTo(24 * s, 0);
      ctx.lineTo(12 * s, -8 * s);
      ctx.lineTo(0, 8 * s);
      ctx.lineTo(-12 * s, -8 * s);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = look.id === "blanc" || look.id === "crop" ? "#111" : "#f1e8dc";
    ctx.textAlign = "center";
    ctx.font = `700 ${14 * s}px Montserrat, Arial, sans-serif`;
    ctx.fillText("GAISEN", 0, 34 * s);
    if (look.number) {
      ctx.font = `700 ${42 * s}px Georgia, serif`;
      ctx.fillText(look.number, 0, torsoH * 0.78);
    }

    ctx.restore();
  }

  function drawHead(look, x, y, s, tilt, sunglasses) {
    const headY = y - 372 * s;
    ctx.save();
    ctx.translate(x, headY);
    ctx.rotate(tilt * 0.08);
    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 * s, 27 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.ellipse(-1 * s, -15 * s, 24 * s, 14 * s, -0.15, Math.PI, Math.PI * 2);
    ctx.fill();
    if (sunglasses) {
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.moveTo(-17 * s, -1 * s);
      ctx.lineTo(-3 * s, -1 * s);
      ctx.moveTo(3 * s, -1 * s);
      ctx.lineTo(17 * s, -1 * s);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.72)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(-14 * s, -3 * s);
      ctx.lineTo(-5 * s, -3 * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawModel(options) {
    const { look, x, y, scale, phase, action, alpha = 1, facing = 1 } = options;
    const s = scale * dpr;
    const walk = Math.sin(phase * Math.PI * 2);
    const stride = action === "run" ? 1.45 : action === "jump" ? 1.2 : 1;
    const jump = action === "jump" ? Math.abs(Math.sin(phase * Math.PI * 2)) * 44 * s : 0;
    const baseY = y - jump;
    const lean = action === "run" ? 0.95 * facing : 0.25 * walk;
    const breath = Math.sin(phase * Math.PI * 4) * 2 * s;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, baseY);
    ctx.scale(facing, 1);
    ctx.translate(-x, -baseY);

    ctx.save();
    ctx.globalAlpha = alpha * 0.24;
    ctx.fillStyle = "#0e0e0e";
    ctx.beginPath();
    ctx.ellipse(x, y + 9 * s, 82 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const skin = look.skin;
    const hipY = baseY - 172 * s;
    const shoulderY = baseY - 296 * s;
    const kneeY = baseY - 82 * s;
    const leftStep = walk * 32 * s * stride;
    const rightStep = -walk * 32 * s * stride;

    ctx.strokeStyle = look.pants;
    drawLimb(x - 22 * s, hipY, x - 18 * s - leftStep * 0.25, kneeY, x - 28 * s + leftStep, baseY - 14 * s, 17 * s, look.pants);
    drawLimb(x + 22 * s, hipY, x + 18 * s - rightStep * 0.25, kneeY, x + 28 * s + rightStep, baseY - 14 * s, 17 * s, look.pants);

    ctx.strokeStyle = "#090909";
    ctx.lineWidth = 8 * s;
    ctx.beginPath();
    ctx.moveTo(x - 34 * s + leftStep, baseY - 10 * s);
    ctx.lineTo(x - 6 * s + leftStep, baseY - 10 * s);
    ctx.moveTo(x + 16 * s + rightStep, baseY - 10 * s);
    ctx.lineTo(x + 48 * s + rightStep, baseY - 10 * s);
    ctx.stroke();

    drawLimb(x - 58 * s, shoulderY, x - 84 * s + rightStep * 0.35, baseY - 250 * s, x - 76 * s + rightStep * 0.55, baseY - 185 * s, 12 * s, skin);
    drawLimb(x + 58 * s, shoulderY, x + 84 * s + leftStep * 0.35, baseY - 250 * s, x + 76 * s + leftStep * 0.55, baseY - 185 * s, 12 * s, skin);

    drawJersey(look, x, baseY, s / dpr, lean, breath);
    drawHead(look, x + lean * 8 * s, baseY, s / dpr, lean, look.id === "rugby" || look.id === "crop");

    if (action === "play") {
      const ballX = x + Math.sin(phase * Math.PI * 2) * 72 * s;
      const ballY = baseY - 270 * s - Math.abs(Math.cos(phase * Math.PI * 2)) * 62 * s;
      ctx.fillStyle = look.accent;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 13 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(14,14,14,0.42)";
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 13 * s, -0.8, 0.8);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCampaignType(scene, sceneProgress, title) {
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = "rgba(245,242,236,0.5)";
    ctx.font = `${11 * dpr}px Montserrat, Arial, sans-serif`;
    ctx.fillText(`GAISEN MODEL FILM / 0${scene + 1}`, width * 0.035, height * 0.86);

    if (width > 850 * dpr) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#f5f2ec";
      ctx.font = `${clamp(width * 0.06, 58 * dpr, 120 * dpr)}px Georgia, serif`;
      ctx.fillText(title, width * 0.55, height * 0.84);
    }

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = ["#ff3d9a", "#f46a22", "#c9ff35", "#27d9ff"][scene];
    ctx.fillRect(width * 0.035, height * 0.885, (180 + sceneProgress * 180) * dpr, 2 * dpr);
    ctx.restore();
  }

  function render(now) {
    resize();
    if (!reducedMotion.matches && now - lastDraw < 33) {
      requestAnimationFrame(render);
      return;
    }
    lastDraw = now;

    const total = 60000;
    const elapsed = reducedMotion.matches ? 12000 : (now - start) % total;
    const sceneLength = total / 4;
    const scene = Math.floor(elapsed / sceneLength);
    const p = (elapsed % sceneLength) / sceneLength;
    const ep = ease(p);

    drawBackground(scene, p);

    const compact = width < 850 * dpr;
    const floor = compact ? height * 0.84 : height * 0.88;
    const modelScale = compact ? clamp(height / 850, 0.56, 0.78) : clamp(height / 720, 0.72, 1.25);
    const textGuard = compact ? width * 0.48 : width * 0.34;
    const center = compact ? width * 0.76 : width * 0.62;
    const spacing = compact ? clamp(width * 0.11, 54 * dpr, 92 * dpr) : clamp(width * 0.13, 130 * dpr, 250 * dpr);

    if (scene === 0) {
      drawModel({ look: looks[0], x: center - spacing + Math.sin(p * Math.PI * 2) * 18 * dpr, y: floor, scale: modelScale * 1.03, phase: p * 2.1, action: "walk" });
      drawModel({ look: looks[1], x: center + Math.cos(p * Math.PI * 2) * 14 * dpr, y: floor, scale: modelScale * 1.07, phase: p * 2.1 + 0.25, action: "walk" });
      drawModel({ look: looks[2], x: center + spacing + Math.sin(p * Math.PI * 2 + 1) * 20 * dpr, y: floor, scale: modelScale, phase: p * 2.1 + 0.5, action: "walk", facing: -1 });
      drawCampaignType(scene, p, "RUNWAY WALK");
    } else if (scene === 1) {
      drawModel({ look: looks[3], x: Math.max(textGuard + spacing * 0.55, width * 0.48), y: floor, scale: modelScale * 0.98, phase: p * 2.4, action: "play" });
      drawModel({ look: looks[1], x: width * 0.68 + Math.sin(p * Math.PI * 2) * 30 * dpr, y: floor, scale: modelScale * 1.08, phase: p * 2.4 + 0.33, action: "jump" });
      drawModel({ look: looks[0], x: width * 0.84, y: floor, scale: modelScale * 0.95, phase: p * 2.4 + 0.66, action: "play", facing: -1 });
      drawCampaignType(scene, p, "PLAY UNIFORM");
    } else if (scene === 2) {
      const slide = (ep - 0.5) * width * 0.12;
      drawModel({ look: looks[2], x: center - spacing * 0.9 - slide, y: floor, scale: modelScale * 1.08, phase: p * 1.7, action: "walk" });
      drawModel({ look: looks[0], x: center + slide * 0.4, y: floor, scale: modelScale * 1.12, phase: p * 1.7 + 0.2, action: "walk" });
      drawModel({ look: looks[3], x: center + spacing * 0.95 + slide, y: floor, scale: modelScale * 1.02, phase: p * 1.7 + 0.55, action: "walk", facing: -1 });
      drawCampaignType(scene, p, "TURNING LINE");
    } else {
      drawModel({ look: looks[1], x: width * (0.52 + p * 0.2), y: floor, scale: modelScale * 1.05, phase: p * 3.2, action: "run" });
      drawModel({ look: looks[0], x: width * (0.78 - p * 0.14), y: floor, scale: modelScale, phase: p * 3.2 + 0.3, action: "run", facing: -1 });
      drawModel({ look: looks[2], x: width * 0.9, y: floor, scale: modelScale * 0.96, phase: p * 2.2, action: "play", facing: -1, alpha: 0.92 });
      drawCampaignType(scene, p, "AFTER PRACTICE");
    }

    ctx.save();
    const vignette = ctx.createRadialGradient(width * 0.62, height * 0.45, width * 0.2, width * 0.62, height * 0.45, width * 0.7);
    vignette.addColorStop(0, "rgba(14,14,14,0)");
    vignette.addColorStop(1, "rgba(14,14,14,0.42)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    if (!reducedMotion.matches) requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(render);
})();
