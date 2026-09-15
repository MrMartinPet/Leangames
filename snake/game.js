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
  const languageButton = document.getElementById("languageButton");
  const themeButton = document.getElementById("themeButton");
  const pauseButton = document.getElementById("pauseButton");
  const descriptionMeta = document.querySelector('meta[name="description"]');

  const copy = {
    en: {
      pageTitle: "MArtin vs. the Machines",
      description: "MArtin vs. the Machines – a Dometic-inspired Snake game about flow, kaizen and completely unnecessary downtime.",
      title: "MArtin vs. the machines",
      highScore: "HIGH SCORE",
      takt: "TAKT TIME",
      shiftStart: "SHIFT START 06:00",
      keyHelp: "Arrow keys / WASD · Space pauses",
      shiftReport: "SHIFT REPORT",
      factoryFloor: "On the factory floor",
      snakeDesc: "Lean expert, apparently a snake.",
      boltName: "Kaizen bolt",
      boltDesc: "+1 improvement and worse ergonomics.",
      machineCell: "Machine cell",
      machineDesc: "Forming, gluing or milling.",
      footnote: "*The OEE value was scientifically calculated by the game's marketing department.",
      startTitle: "Is MArtin flow-ready?",
      startText: "Collect Kaizen bolts. Avoid machines, walls and your own process map.",
      startButton: "START THE LINE",
      pauseTitle: "Planned downtime",
      pauseText: "MArtin is documenting why this definitely does not affect OEE.",
      resumeButton: "RESUME PRODUCTION",
      gameoverGood: "Lean, but not immortal",
      gameoverBad: "Red on Andon",
      restartButton: "RESTART THE LINE",
      waiting: "The line is waiting. Someone is looking for the forklift key.",
      running: "The line is running. MArtin has already moved three pieces of floor tape.",
      paused: "Planned downtime. Therefore, it does not count. Clever.",
      resumed: "The line is running again. The meeting has been postponed.",
      calm: "Calm",
      taktSpeed: "Takt",
      panic: "Panic",
      soundOn: "SOUND: ON",
      soundOff: "SOUND: OFF",
      turnSoundOff: "Turn sound off",
      turnSoundOn: "Turn sound on",
      light: "LIGHT",
      dark: "DARK",
      switchLight: "Switch to light theme",
      switchDark: "Switch to dark theme",
      switchLanguage: "Switch to Swedish",
      directionControls: "Direction controls",
      canvasLabel: "Game board. Guide MArtin, collect improvements and avoid the machines.",
      pause: "Pause",
      resume: "Resume",
      directions: { up: "Up", down: "Down", left: "Left", right: "Right" },
      machineLabels: ["FORM 43", "GLUE 1", "MILL 2", "FV13", "EPOT"],
      quips: [
        "One improvement found. Three meetings were booked to investigate it.",
        "MArtin shortened the lead time. Finance wants a PowerPoint.",
        "FIFO works! Nobody is entirely sure why.",
        "5S completed: the bolt now has its own taped square.",
        "Gemba says yes. Excel says #N/A!",
        "Flow improved. The forklift is offended.",
        "Standard Work updated. The old version is still on the wall.",
        "Kaizen! Cost: €0. Approval process: 14 weeks.",
        "MArtin spotted waste. The waste looked nervous."
      ],
      crashes: [
        "DOWNTIME: MArtin went on a Gemba walk without a safety distance.",
        "MACHINE CONTACT: Apparently, the risk assessment was decorative.",
        "FLOW ERROR: The process became so lean it ate itself.",
        "DEVIATION: Someone parked a machine in the spaghetti diagram.",
        "STOP TIME: 120 seconds? No, now it is a coffee break."
      ],
      result: (crash, score) => `${crash} MArtin completed ${score} improvement${score === 1 ? "" : "s"}.`
    },
    sv: {
      pageTitle: "MArtin mot maskinerna",
      description: "MArtin mot maskinerna – ett Dometic-inspirerat Snake-spel om flöde, kaizen och totalt onödiga driftstopp.",
      title: "MArtin mot maskinerna",
      highScore: "REKORD",
      takt: "TAKT",
      shiftStart: "SKIFTSTART 06:00",
      keyHelp: "Piltangenter / WASD · Mellanslag pausar",
      shiftReport: "SKIFTRAPPORT",
      factoryFloor: "På fabriksgolvet",
      snakeDesc: "Lean-expert, tydligen orm.",
      boltName: "Kaizen-skruv",
      boltDesc: "+1 förbättring och sämre ergonomi.",
      machineCell: "Maskincell",
      machineDesc: "Formning, limning eller fräsning.",
      footnote: "*OEE-värdet är vetenskapligt framtaget av spelets marknadsavdelning.",
      startTitle: "Är MArtin flödesredo?",
      startText: "Samla Kaizen-skruvar. Undvik maskiner, väggar och den egna processkartan.",
      startButton: "STARTA LINAN",
      pauseTitle: "Planerat stopp",
      pauseText: "MArtin dokumenterar att det här absolut inte påverkar OEE.",
      resumeButton: "FORTSÄTT PRODUCERA",
      gameoverGood: "Lean, men inte odödlig",
      gameoverBad: "Rött på Andon",
      restartButton: "ÅTERSTARTA LINAN",
      waiting: "Linjen väntar. Någon letar efter trucknyckeln.",
      running: "Linan går. MArtin har redan flyttat tre tejpbitar.",
      paused: "Planerat stopp. Därför räknas det inte. Smart.",
      resumed: "Linan går igen. Mötet är uppskjutet.",
      calm: "Lugn",
      taktSpeed: "Takt",
      panic: "Panik",
      soundOn: "LJUD: PÅ",
      soundOff: "LJUD: AV",
      turnSoundOff: "Slå av ljud",
      turnSoundOn: "Slå på ljud",
      light: "LJUST",
      dark: "MÖRKT",
      switchLight: "Byt till ljust tema",
      switchDark: "Byt till mörkt tema",
      switchLanguage: "Byt till engelska",
      directionControls: "Styrknappar",
      canvasLabel: "Spelplan. Styr MArtin, samla förbättringar och undvik maskinerna.",
      pause: "Pausa",
      resume: "Fortsätt",
      directions: { up: "Upp", down: "Ner", left: "Vänster", right: "Höger" },
      machineLabels: ["FORM 43", "LIM 1", "FRÄS 2", "FV13", "EPOT"],
      quips: [
        "En förbättring hittad. Tre möten bokades för att utreda den.",
        "MArtin kortade ledtiden. Ekonomiavdelningen vill ha en PowerPoint.",
        "FIFO fungerar! Ingen vet riktigt varför.",
        "5S genomförd: skruven har nu en tejpad ruta.",
        "Gemba säger ja. Excel säger #SAKNAS!",
        "Flödet förbättrat. Trucken är kränkt.",
        "Standard Work uppdaterad. Den gamla versionen sitter kvar på väggen.",
        "Kaizen! Kostnad: 0 kr. Godkännandeprocess: 14 veckor.",
        "MArtin såg ett slöseri. Slöseriet såg nervöst ut."
      ],
      crashes: [
        "DRIFTSTOPP: MArtin gick på Gemba utan skyddsavstånd.",
        "MASKINKONTAKT: Riskanalysen var tydligen bara dekorativ.",
        "FLÖDESFEL: Processen blev så lean att den åt upp sig själv.",
        "AVVIKELSE: Någon parkerade en maskin mitt i spagettidiagrammet.",
        "STOPPTID: 120 sekunder? Nej, nu blev det fika."
      ],
      result: (crash, score) => `${crash} MArtin hann med ${score} förbättring${score === 1 ? "" : "ar"}.`
    }
  };

  const GRID = 24;
  const CELL = canvas.width / GRID;
  let lang = localStorage.getItem("martinMachineSnakeLanguage") || "en";
  let theme = localStorage.getItem("martinMachineSnakeTheme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
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
  let screenState = "start";
  let lastCrashIndex = 0;

  const t = () => copy[lang];
  highScoreEl.textContent = highScore;

  function makeMachines() {
    return [
      { x: 5, y: 4, w: 4, h: 2, label: 0 },
      { x: 15, y: 5, w: 3, h: 3, label: 1 },
      { x: 7, y: 15, w: 3, h: 3, label: 2 },
      { x: 16, y: 17, w: 4, h: 2, label: 3 }
    ];
  }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.title = t().pageTitle;
    descriptionMeta.content = t().description;
    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t()[element.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
      element.setAttribute("aria-label", t()[element.dataset.i18nAria]);
    });
    document.querySelectorAll("[data-dir]").forEach(button => button.setAttribute("aria-label", t().directions[button.dataset.dir]));
    languageButton.textContent = lang === "en" ? "SV" : "EN";
    languageButton.setAttribute("aria-label", t().switchLanguage);
    updateToolbar();
    updateStats();
    updateStateCopy();
    draw();
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    updateToolbar();
  }

  function updateToolbar() {
    soundButton.textContent = soundOn ? t().soundOn : t().soundOff;
    soundButton.setAttribute("aria-label", soundOn ? t().turnSoundOff : t().turnSoundOn);
    const nextIsLight = theme === "dark";
    themeButton.textContent = nextIsLight ? `☀ ${t().light}` : `☾ ${t().dark}`;
    themeButton.setAttribute("aria-label", nextIsLight ? t().switchLight : t().switchDark);
    pauseButton.setAttribute("aria-label", paused ? t().resume : t().pause);
  }

  function updateStateCopy() {
    if (screenState === "start") {
      statusEl.textContent = t().waiting;
      overlayTitle.textContent = t().startTitle;
      overlayText.textContent = t().startText;
      startButton.textContent = t().startButton;
    } else if (screenState === "paused") {
      statusEl.textContent = t().paused;
      overlayTitle.textContent = t().pauseTitle;
      overlayText.textContent = t().pauseText;
      startButton.textContent = t().resumeButton;
    } else if (screenState === "gameover") {
      const crash = t().crashes[lastCrashIndex];
      statusEl.textContent = crash;
      overlayTitle.textContent = score >= 10 ? t().gameoverGood : t().gameoverBad;
      overlayText.textContent = t().result(crash, score);
      startButton.textContent = t().restartButton;
    } else {
      statusEl.textContent = t().running;
    }
  }

  function resetGame() {
    snake = [{ x: 12, y: 11 }, { x: 11, y: 11 }, { x: 10, y: 11 }, { x: 9, y: 11 }];
    direction = { x: 1, y: 0 };
    queuedDirection = { ...direction };
    machines = makeMachines();
    score = 0;
    stepMs = 150;
    paused = false;
    pauseButton.textContent = "Ⅱ";
    updateStats();
    placeTarget();
    draw();
  }

  function startGame() {
    cancelAnimationFrame(loopId);
    resetGame();
    running = true;
    screenState = "playing";
    overlay.classList.add("hidden");
    statusEl.textContent = t().running;
    updateToolbar();
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
      statusEl.textContent = t().quips[(score - 1) % t().quips.length];
      updateStats();
      placeTarget();
      beep(520 + score * 18, .06);
    } else {
      snake.pop();
    }
  }

  function gameOver() {
    running = false;
    screenState = "gameover";
    highScore = Math.max(highScore, score);
    localStorage.setItem("martinMachineSnakeHighScore", String(highScore));
    highScoreEl.textContent = highScore;
    lastCrashIndex = Math.floor(Math.random() * t().crashes.length);
    updateStateCopy();
    overlay.classList.remove("hidden");
    beep(115, .22);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseButton.textContent = paused ? "▶" : "Ⅱ";
    screenState = paused ? "paused" : "playing";
    updateToolbar();
    if (paused) {
      updateStateCopy();
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      statusEl.textContent = t().resumed;
      lastTime = performance.now();
    }
  }

  function setDirection(x, y) {
    if (x === -direction.x && y === -direction.y) return;
    queuedDirection = { x, y };
  }

  function isMachineCell(x, y) {
    return machines.some(machine => x >= machine.x && x < machine.x + machine.w && y >= machine.y && y < machine.y + machine.h);
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
    speedEl.textContent = score < 4 ? t().calm : score < 9 ? t().taktSpeed : t().panic;
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
    ctx.fillText(t().machineLabels[machine.label], x + w / 2, y + h / 2, w - 22);
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
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, isHead ? 8 : 6);
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
    } catch (_) { /* Sound is bonus. Production is the priority. */ }
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
    updateToolbar();
    beep(360, .05);
  });
  languageButton.addEventListener("click", () => {
    lang = lang === "en" ? "sv" : "en";
    localStorage.setItem("martinMachineSnakeLanguage", lang);
    applyLanguage();
  });
  themeButton.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("martinMachineSnakeTheme", theme);
    applyTheme();
  });

  resetGame();
  applyTheme();
  applyLanguage();
})();
