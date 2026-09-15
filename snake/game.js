(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const startButton = document.getElementById("startButton");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("highScore");
  const oeeEl = document.getElementById("oee");
  const speedEl = document.getElementById("speed");
  const statusEl = document.getElementById("statusMessage");
  const soundButton = document.getElementById("soundButton");
  const pauseButton = document.getElementById("pauseButton");

  const GRID = 24;
  const CELL = canvas.width / GRID;
  const machineLabels = ["FORM 43", "LIM 1", "FRÄS 2", "FV13", "EPOT"];
  const quips = [
    "En förbättring hittad. Tre möten bokades för att utreda den.",
    "MArtin kortade ledtiden. Ekonomiavdelningen vill ha en PowerPoint.",
    "FIFO fungerar! Ingen vet riktigt varför.",
    "5S genomförd: skruven har nu en tejpad ruta.",
    "Gemba säger ja. Excel säger #SAKNAS!",
    "Flödet förbättrat. Trucken är kränkt.",
    "Standard Work uppdaterad. Den gamla versionen sitter kvar på väggen.",
    "Kaizen! Kostnad: 0 kr. Godkännandeprocess: 14 veckor.",
    "MArtin såg ett slöseri. Slöseriet såg nervöst ut."
  ];
  const crashQuips = [
    "DRIFTSTOPP: MArtin gick på Gemba utan skyddsavstånd.",
    "MASKINKONTAKT: Riskanalysen var tydligen bara dekorativ.",
    "FLÖDESFEL: Processen blev så lean att den åt upp sig själv.",
    "AVVIKELSE: Någon parkerade en maskin mitt i spagettidiagrammet.",
    "STOPPTID: 120 sekunder? Nej, nu blev det fika."
  ];

  let snake = [];
  let direction = { x: 1, y: 0 };
  let queuedDirection = { x: 1, y: 0 };
  let target = { x: 18, y: 12 };
  let machines = [];
  let score = 0;
  let highScore = Number(localStorage.getItem("martinMachineSnakeHighScore") || 0);
  let loopId = null;
  let running = false;
  let paused = false;
  let soundOn = true;
  let audioContext = null;
  let lastTime = 0;
  let stepMs = 150;
  let swipeStart = null;

  highScoreEl.textContent = highScore;

  function makeMachines() {
    return [
      { x: 5, y: 4, w: 4, h: 2, label: machineLabels[0] },
      { x: 15, y: 5, w: 3, h: 3, label: machineLabels[1] },
      { x: 7, y: 15, w: 3, h: 3, label: machineLabels[2] },
      { x: 16, y: 17, w: 4, h: 2, label: machineLabels[3] }
    ];
  }

  function resetGame() {
    snake = [{ x: 12, y: 11 }, { x: 11, y: 11 }, { x: 10, y: 11 }, { x: 9, y: 11 }];
    direction = { x: 1, y: 0 };
    queuedDirection = { ...direction };
    machines = makeMachines();
    score = 0;
    stepMs = 150;
    paused = false;
    updateStats();
    placeTarget();
    statusEl.textContent = "Linan går. MArtin har redan flyttat tre tejpbitar.";
    draw();
  }

  function startGame() {
    cancelAnimationFrame(loopId);
    resetGame();
    running = true;
    overlay.classList.add("hidden");
    lastTime = performance.now();
    loopId = requestAnimationFrame(loop);
    beep(260, .05);
  }

  function loop(now) {
    if (!running) return;
    if (!paused && now - lastTime >= stepMs) {
      update();
      lastTime = now;
    }
    draw();
    loopId = requestAnimationFrame(loop);
  }

  function update() {
    direction = queuedDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
    const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);
    const hitMachine = isMachineCell(head.x, head.y);

    if (hitWall || hitSelf || hitMachine) {
      gameOver();
      return;
    }

    snake.unshift(head);
    if (head.x === target.x && head.y === target.y) {
      score += 1;
      stepMs = Math.max(72, 150 - score * 4);
      statusEl.textContent = quips[(score - 1) % quips.length];
      updateStats();
      placeTarget();
      beep(520 + score * 18, .06);
    } else {
      snake.pop();
    }
  }

  function gameOver() {
    running = false;
    highScore = Math.max(highScore, score);
    localStorage.setItem("martinMachineSnakeHighScore", String(highScore));
    highScoreEl.textContent = highScore;
    const message = crashQuips[Math.floor(Math.random() * crashQuips.length)];
    statusEl.textContent = message;
    overlayTitle.textContent = score >= 10 ? "Lean, men inte odödlig" : "Rött på Andon";
    overlayText.textContent = `${message} MArtin hann med ${score} förbättring${score === 1 ? "" : "ar"}.`;
    startButton.textContent = "ÅTERSTARTA LINAN";
    overlay.classList.remove("hidden");
    beep(115, .22);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseButton.textContent = paused ? "▶" : "Ⅱ";
    statusEl.textContent = paused ? "Planerat stopp. Därför räknas det inte. Smart." : "Linan går igen. Mötet är uppskjutet.";
    if (paused) {
      overlayTitle.textContent = "Planerat stopp";
      overlayText.textContent = "MArtin dokumenterar att det här absolut inte påverkar OEE.";
      startButton.textContent = "FORTSÄTT PRODUCERA";
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      lastTime = performance.now();
    }
  }

  function setDirection(x, y) {
    if (x === -direction.x && y === -direction.y) return;
    queuedDirection = { x, y };
  }

  function isMachineCell(x, y) {
    return machines.some(m => x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h);
  }

  function occupied(x, y) {
    return isMachineCell(x, y) || snake.some(part => part.x === x && part.y === y);
  }

  function placeTarget() {
    let tries = 0;
    do {
      target = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
      tries += 1;
    } while (occupied(target.x, target.y) && tries < 1000);
  }

  function updateStats() {
    scoreEl.textContent = score;
    oeeEl.textContent = `${Math.min(99, 12 + score * 7)}%`;
    speedEl.textContent = score < 4 ? "Lugn" : score < 9 ? "Takt" : "Panik";
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#07151e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    machines.forEach(drawMachine);
    drawTarget();
    snake.slice().reverse().forEach((part, reverseIndex) => {
      const actualIndex = snake.length - reverseIndex - 1;
      drawSnakePart(part, actualIndex === 0, actualIndex);
    });
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(99, 152, 175, .10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0, 194, 255, .22)";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
  }

  function drawMachine(machine) {
    const x = machine.x * CELL + 3;
    const y = machine.y * CELL + 3;
    const w = machine.w * CELL - 6;
    const h = machine.h * CELL - 6;
    ctx.fillStyle = "#18313e";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#607b88";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#0a1921";
    ctx.fillRect(x + 9, y + 9, w - 18, h - 18);
    ctx.fillStyle = "#ffd84b";
    ctx.fillRect(x + w - 16, y + 8, 7, 7);
    ctx.fillStyle = "#d6e7ee";
    ctx.font = `700 ${Math.max(10, CELL * .42)}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(machine.label, x + w / 2, y + h / 2, w - 22);
  }

  function drawTarget() {
    const cx = target.x * CELL + CELL / 2;
    const cy = target.y * CELL + CELL / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(performance.now() / 650);
    ctx.fillStyle = "#ffd84b";
    ctx.shadowColor = "#ffd84b";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      const radius = i % 2 === 0 ? CELL * .40 : CELL * .17;
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSnakePart(part, isHead, index) {
    const inset = isHead ? 2 : 3;
    const x = part.x * CELL + inset;
    const y = part.y * CELL + inset;
    const size = CELL - inset * 2;
    ctx.fillStyle = isHead ? "#00c2ff" : index % 2 ? "#008fc2" : "#00aada";
    ctx.shadowColor = isHead ? "rgba(0,194,255,.8)" : "transparent";
    ctx.shadowBlur = isHead ? 10 : 0;
    roundedRect(x, y, size, size, isHead ? 8 : 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isHead) {
      const eyeOffsetX = direction.x * 5;
      const eyeOffsetY = direction.y * 5;
      const crossX = Math.abs(direction.y) * 6;
      const crossY = Math.abs(direction.x) * 6;
      ctx.fillStyle = "#061119";
      ctx.beginPath(); ctx.arc(x + size / 2 + eyeOffsetX + crossX, y + size / 2 + eyeOffsetY + crossY, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + size / 2 + eyeOffsetX - crossX, y + size / 2 + eyeOffsetY - crossY, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#eef7fb";
      ctx.font = "900 8px Segoe UI";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("M", x + size / 2, y + 2);
    }
  }

  function roundedRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
  }

  function beep(frequency, duration) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Ljud är bonus, produktion är viktigare. */ }
  }

  const directionByKey = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
    ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
    ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
  };

  document.addEventListener("keydown", event => {
    if (directionByKey[event.key]) {
      event.preventDefault();
      setDirection(...directionByKey[event.key]);
    } else if (event.code === "Space") {
      event.preventDefault();
      togglePause();
    } else if (event.key === "Enter" && !running) {
      startGame();
    }
  });

  document.querySelectorAll("[data-dir]").forEach(button => {
    button.addEventListener("click", () => {
      const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      setDirection(...map[button.dataset.dir]);
    });
  });

  canvas.addEventListener("pointerdown", event => { swipeStart = { x: event.clientX, y: event.clientY }; });
  canvas.addEventListener("pointerup", event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
      Math.abs(dx) > Math.abs(dy) ? setDirection(Math.sign(dx), 0) : setDirection(0, Math.sign(dy));
    }
    swipeStart = null;
  });

  startButton.addEventListener("click", () => {
    if (running && paused) togglePause(); else startGame();
  });
  pauseButton.addEventListener("click", togglePause);
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.textContent = `LJUD: ${soundOn ? "PÅ" : "AV"}`;
    soundButton.setAttribute("aria-label", soundOn ? "Slå av ljud" : "Slå på ljud");
    beep(360, .05);
  });

  resetGame();
})();
