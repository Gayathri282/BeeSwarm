/* Cute Bee Swarm Adventure - Game Engine & Audio Synthesizer */

(function () {
  'use strict';

  // --- Audio Synthesizer System (Web Audio API) ---
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.bgmTimer = null;
      this.bgmStep = 0;
      this.isMuted = false;

      // Engaging, bouncy 32-step lead melody (C major pentatonic / cheerful scale)
      this.melody = [
        523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25,
        523.25, 587.33, 659.25, 783.99, 659.25,  587.33, 523.25, 0,
        659.25, 783.99, 880.00, 1046.50, 1174.66, 1046.50, 880.00, 783.99,
        880.00, 783.99, 659.25, 587.33, 523.25,  659.25, 523.25, 0
      ];

      // Rhythmic bass line for background music
      this.bassLine = [
        261.63, 0, 261.63, 0, 220.00, 0, 220.00, 0,
        174.61, 0, 174.61, 0, 196.00, 0, 196.00, 0,
        261.63, 0, 261.63, 0, 220.00, 0, 220.00, 0,
        174.61, 0, 196.00, 0, 261.63, 0, 261.63, 0
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playNote(freq, type = 'sine', duration = 0.15, vol = 0.12) {
      if (!this.ctx || this.isMuted || freq === 0) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio note error:', e);
      }
    }

    startBGM() {
      if (this.bgmTimer) return;
      this.init();
      this.bgmStep = 0;
      this.bgmTimer = setInterval(() => {
        if (!this.ctx || this.isMuted) return;
        
        const step = this.bgmStep % this.melody.length;
        const leadFreq = this.melody[step];
        const bassFreq = this.bassLine[step];

        // Play Lead Melody (Soft marimba/bell tone)
        if (leadFreq > 0) {
          this.playNote(leadFreq, 'triangle', 0.18, 0.07);
        }

        // Play Rhythmic Bass
        if (bassFreq > 0) {
          this.playNote(bassFreq, 'sine', 0.22, 0.05);
        }

        this.bgmStep++;
      }, 160); // Upbeat tempo (160ms per 8th step)
    }

    stopBGM() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }

    playCollectSFX() {
      this.init();
      this.playNote(659.25, 'sine', 0.1, 0.18); // E5
      setTimeout(() => this.playNote(987.77, 'sine', 0.15, 0.22), 60); // B5
    }

    playHoneySFX() {
      this.init();
      const arpeggio = [523.25, 659.25, 783.99, 1046.50];
      arpeggio.forEach((freq, idx) => {
        setTimeout(() => this.playNote(freq, 'sine', 0.14, 0.18), idx * 50);
      });
    }

    playLevelUpSFX() {
      this.init();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playNote(freq, 'triangle', 0.18, 0.2), idx * 70);
      });
    }

    playGameOverSFX() {
      this.init();
      if (!this.ctx || this.isMuted) return;
      try {
        // Silly, subtle cartoon "oopsie-boing!" sound
        const now = this.ctx.currentTime;
        
        // Note 1: E4 -> Eb4 soft funny slide
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(329.63, now);
        osc1.frequency.exponentialRampToValueAtTime(311.13, now + 0.12);
        gain1.gain.setValueAtTime(0.1, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.14);

        // Note 2: Gentle C4 pop
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(261.63, now + 0.12);
        gain2.gain.setValueAtTime(0.08, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.26);

        // Note 3: Silly low boing (G3 pitch bend up & down)
        const osc3 = this.ctx.createOscillator();
        const gain3 = this.ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(196.00, now + 0.24);
        osc3.frequency.linearRampToValueAtTime(220.00, now + 0.32);
        osc3.frequency.linearRampToValueAtTime(164.81, now + 0.44);
        gain3.gain.setValueAtTime(0.1, now + 0.24);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc3.connect(gain3);
        gain3.connect(this.ctx.destination);
        osc3.start(now + 0.24);
        osc3.stop(now + 0.48);
      } catch (e) {}
    }
  }

  const audio = new AudioEngine();

  // --- Game State Variables ---
  const DOM = {
    world: document.getElementById('world'),
    bee: document.getElementById('bee'),
    score: document.getElementById('score'),
    highScore: document.getElementById('high-score'),
    time: document.getElementById('time'),
    speed: document.getElementById('speed'),
    holdBtn: document.getElementById('hold-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    startModal: document.getElementById('start-modal'),
    startBtn: document.getElementById('start-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    finalScore: document.getElementById('final-score'),
    finalTime: document.getElementById('final-time'),
    restartBtn: document.getElementById('restart-btn'),
    pauseModal: document.getElementById('pause-modal'),
    resumeBtn: document.getElementById('resume-btn')
  };

  let y = 0;
  let vy = 0;
  let score = 0;
  let time = 0;
  let speed = 1.0;
  let currentLevel = 1;
  let highScore = parseInt(localStorage.getItem('bee_swarm_highscore') || '0', 10);

  let isHolding = false;
  let isRunning = false;
  let isPaused = false;
  let rafId = null;
  let lastTime = 0;
  let spawnTimer = 0;
  let hazards = [];
  let flowers = [];

  const getH = () => DOM.world.clientHeight;
  const getW = () => DOM.world.clientWidth;

  // Render High Score initially
  DOM.highScore.textContent = highScore;

  function initFlowers() {
    // Clean up previous flowers
    document.querySelectorAll('.flower').forEach(el => el.remove());
    flowers = [];

    const flowerEmojis = ['🌸', '🌼', '🌻', '🌺', '🍯'];
    for (let i = 0; i < 4; i++) {
      const el = document.createElement('div');
      const isHoney = i === 3;
      el.className = isHoney ? 'flower honey' : 'flower';
      el.textContent = isHoney ? '🍯' : flowerEmojis[i % (flowerEmojis.length - 1)];

      const initialX = getW() + i * 220 + Math.random() * 80;
      const initialY = 80 + Math.random() * (getH() * 0.55);

      el.style.left = initialX + 'px';
      el.style.top = initialY + 'px';

      DOM.world.appendChild(el);
      flowers.push({ el, x: initialX, y: initialY, isHoney });
    }
  }

  function addHazard() {
    const types = ['bird', 'spider', 'branch', 'cloud-storm'];
    const type = types[Math.floor(Math.random() * types.length)];
    const el = document.createElement('div');

    el.className = type === 'branch' ? 'branch' : `hazard ${type}`;
    if (type === 'bird') el.textContent = '🐦';
    if (type === 'spider') el.textContent = '🕷️';
    if (type === 'cloud-storm') el.textContent = '🌩️';

    const yPos = type === 'branch'
      ? getH() * 0.72 - 30
      : 70 + Math.random() * (getH() * 0.55);

    const xPos = getW() + 80;
    el.style.left = xPos + 'px';
    if (type !== 'branch') el.style.top = yPos + 'px';

    if (type === 'branch') {
      el.style.width = (100 + Math.random() * 80) + 'px';
    }

    DOM.world.appendChild(el);
    hazards.push({ el, type, x: xPos, y: yPos });
  }

  function createPopText(text, x, y) {
    const pop = document.createElement('div');
    pop.className = 'pop';
    pop.textContent = text;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    DOM.world.appendChild(pop);
    setTimeout(() => pop.remove(), 750);
  }

  function checkCollisions() {
    const beeRect = DOM.bee.getBoundingClientRect();

    // Flowers collection
    flowers.forEach(f => {
      const fRect = f.el.getBoundingClientRect();
      if (
        beeRect.right > fRect.left + 5 &&
        beeRect.left < fRect.right - 5 &&
        beeRect.bottom > fRect.top + 5 &&
        beeRect.top < fRect.bottom - 5
      ) {
        const points = f.isHoney ? 3 : 1;
        score += points;
        DOM.score.textContent = score;

        if (score > highScore) {
          highScore = score;
          DOM.highScore.textContent = highScore;
          localStorage.setItem('bee_swarm_highscore', highScore.toString());
        }

        if (f.isHoney) {
          audio.playHoneySFX();
          createPopText('+3 🍯', fRect.left - DOM.world.getBoundingClientRect().left, fRect.top - DOM.world.getBoundingClientRect().top);
        } else {
          audio.playCollectSFX();
          createPopText('+1 🌸', fRect.left - DOM.world.getBoundingClientRect().left, fRect.top - DOM.world.getBoundingClientRect().top);
        }

        // Reposition flower off-screen right
        f.x = getW() + 100 + Math.random() * 200;
        f.y = 80 + Math.random() * (getH() * 0.55);
      }
    });

    // Hazards collisions
    for (let h of hazards) {
      const hRect = h.el.getBoundingClientRect();
      if (
        beeRect.right > hRect.left + 12 &&
        beeRect.left < hRect.right - 12 &&
        beeRect.bottom > hRect.top + 10 &&
        beeRect.top < hRect.bottom - 10
      ) {
        triggerGameOver();
        return;
      }
    }
  }

  function startGame() {
    cancelAnimationFrame(rafId);
    document.querySelectorAll('.hazard, .branch').forEach(e => e.remove());
    hazards = [];

    y = getH() * 0.45;
    vy = 0;
    score = 0;
    time = 0;
    speed = 1.0;
    currentLevel = 1;
    isHolding = false;
    isRunning = true;
    isPaused = false;
    spawnTimer = 0;

    DOM.score.textContent = '0';
    DOM.time.textContent = '0';
    DOM.speed.textContent = '1.0×';

    DOM.startModal.classList.add('hidden');
    DOM.gameOverModal.classList.add('hidden');
    DOM.pauseModal.classList.add('hidden');

    initFlowers();
    audio.startBGM();

    lastTime = performance.now();
    rafId = requestAnimationFrame(gameLoop);
  }

  function pauseGame() {
    if (!isRunning || isPaused) return;
    isPaused = true;
    audio.stopBGM();
    DOM.pauseModal.classList.remove('hidden');
  }

  function resumeGame() {
    if (!isRunning || !isPaused) return;
    isPaused = false;
    DOM.pauseModal.classList.add('hidden');
    audio.startBGM();
    lastTime = performance.now();
    rafId = requestAnimationFrame(gameLoop);
  }

  function triggerGameOver() {
    isRunning = false;
    audio.stopBGM();
    audio.playGameOverSFX();
    cancelAnimationFrame(rafId);

    DOM.finalScore.textContent = score;
    DOM.finalTime.textContent = Math.floor(time);
    DOM.gameOverModal.classList.remove('hidden');
  }

  function gameLoop(now) {
    if (!isRunning || isPaused) return;

    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;

    time += dt;
    const newSpeed = Math.min(2.8, 1.0 + time / 22);
    speed = newSpeed;

    // Level up check
    const levelCheck = Math.floor(time / 15) + 1;
    if (levelCheck > currentLevel) {
      currentLevel = levelCheck;
      audio.playLevelUpSFX();
      createPopText(`LEVEL ${currentLevel}! ⚡`, getW() * 0.4, getH() * 0.3);
    }

    DOM.time.textContent = Math.floor(time);
    DOM.speed.textContent = speed.toFixed(1) + '×';

    // Smooth, gentle physics for child-friendly flight
    vy += (isHolding ? -650 : 500) * dt;
    vy *= 0.985; // Damping for smooth float control
    y += vy * dt;

    const ceiling = 15;
    const ground = getH() * 0.75 - 45;

    // Soft-clamp boundaries so top sky and bottom grass don't cause Game Over
    if (y <= ceiling) {
      y = ceiling;
      vy = Math.max(0, vy);
    } else if (y >= ground) {
      y = ground;
      vy = Math.min(0, vy);
    }

    // Bee Rotation dynamic visual effect based on velocity
    const tilt = Math.max(-25, Math.min(25, vy * 0.05));
    DOM.bee.style.transform = `translateY(${y}px) rotate(${tilt}deg)`;

    // Spawn Hazards
    spawnTimer += dt;
    const spawnThreshold = Math.max(0.7, 1.4 - time / 30);
    if (spawnTimer > spawnThreshold) {
      spawnTimer = 0;
      addHazard();
    }

    // Move Hazards
    hazards.forEach(h => {
      h.x -= 210 * speed * dt;
      h.el.style.left = h.x + 'px';
    });

    hazards = hazards.filter(h => {
      if (h.x < -160) {
        h.el.remove();
        return false;
      }
      return true;
    });

    // Move Flowers
    flowers.forEach(f => {
      f.x -= 140 * speed * dt;
      if (f.x < -80) {
        f.x = getW() + 80 + Math.random() * 150;
        f.y = 80 + Math.random() * (getH() * 0.55);
        f.el.style.top = f.y + 'px';
      }
      f.el.style.left = f.x + 'px';
    });

    checkCollisions();

    rafId = requestAnimationFrame(gameLoop);
  }

  // --- Input Event Listeners ---
  function setHolding(val) {
    if (isRunning && !isPaused) {
      isHolding = val;
      if (val) {
        DOM.holdBtn.classList.add('active');
      } else {
        DOM.holdBtn.classList.remove('active');
      }
    }
  }

  // World Pointer Controls
  DOM.world.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    audio.init();
    setHolding(true);
  });
  window.addEventListener('pointerup', () => setHolding(false));
  window.addEventListener('pointercancel', () => setHolding(false));

  // Button Controls
  DOM.holdBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    audio.init();
    setHolding(true);
  });

  // Keyboard Spacebar / Arrow Up Controls
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      audio.init();
      setHolding(true);
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      setHolding(false);
    }
  });

  // Modal Buttons
  DOM.startBtn.addEventListener('click', startGame);
  DOM.restartBtn.addEventListener('click', startGame);
  DOM.pauseBtn.addEventListener('click', pauseGame);
  DOM.resumeBtn.addEventListener('click', resumeGame);

  // Auto-pause on tab switch / window blur / page hide
  window.addEventListener('blur', pauseGame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseGame();
    }
  });

})();
