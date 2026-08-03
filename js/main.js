
const STORAGE_KEY = "galaxyMadeOfYou_state";

function defaultState(){
  return {
    unlocked:false,
    lettersRead:{},
    starsFound:{},
    hiddenStarFound:false,
    secretUnlocked:{ stars100:false, time1111:false, allLetters:false, everything:false, diary:true},
    planetsVisited:{ mercury:false, neptune:false, venus:false },
    bouquetOpened:false,
    venusSongPlayed:false,
    babyActivated:false,
    blackholeEntered:false
    diaryEntries: []
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // merge with defaults in case new fields were added since last visit
    return Object.assign(defaultState(), parsed, {
      secretUnlocked: Object.assign(defaultState().secretUnlocked, parsed.secretUnlocked || {}),
      planetsVisited: Object.assign(defaultState().planetsVisited, parsed.planetsVisited || {})
    });
  }catch(e){
    return defaultState();
  }
}

let state = loadState();
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ /* storage unavailable — continue in-memory */ }
}

/* background loop */
(function initGlobalBackground(){
  const video = document.getElementById("global-bg-video");
  const fallback = document.querySelector(".global-bg-fallback");
  if(!video) return;
  const showFallback = ()=>{ if(fallback) fallback.style.display = "block"; };
  video.addEventListener("error", showFallback);
  const p = video.play();
  if(p && p.catch) p.catch(showFallback);
})();

/* ---- Screen navigation ---------------------------------------------------- */
const SCREEN_TRACK = {
  lock:"lock", home:"homepage",
  neptune:"neptune", venus:"venus", final:"singularity"
};

function showScreen(name, opts={}){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const el = document.getElementById(`screen-${name}`);
  if(el) el.classList.add("active");

  if(name !== "venus"){
    const venusAudio = document.getElementById("audio-venus");
    if(venusAudio && !venusAudio.paused){ venusAudio.pause(); venusAudio.currentTime = 0; }
    pauseVenusVideo();
  }

  if(!opts.skipAudio){
    if (name !== "venus") {
      AudioManager.playTrack(SCREEN_TRACK[name] || null);
    } else {
      AudioManager.playTrack(null);
    }
  }

  const customAudioPlayer = document.getElementById("sp-audio-player");
  const playPauseBtn = document.getElementById("sp-play-pause");
  
  if (customAudioPlayer && playPauseBtn) {
    if (name === "mercury") {
      if (customAudioPlayer.paused) {
        playPauseBtn.click();
      }
    } else {
      if (!customAudioPlayer.paused) {
        playPauseBtn.click();
      }
    }
  }

  if(name === "mercury") state.planetsVisited.mercury = true;
  if(name === "neptune") state.planetsVisited.neptune = true;
  if(name === "venus") state.planetsVisited.venus = true;
  if(name === "home") drawHomeConstellation();
  saveState();
  updateConstellation();
  checkSecretUnlocks();
  window.scrollTo(0,0);

  const homeBtn = document.getElementById("home-btn");
  const hideOn = ["lock","supernova","home"];
  homeBtn.classList.toggle("visible", !hideOn.includes(name));
}

/* ==========================================================================
   LOCK SCREEN
   ========================================================================== */
(function initLockScreen(){
  const CODE = "0719";
  const pinBoxes = Array.from(document.querySelectorAll(".pin-box"));
  const pinDisplay = document.getElementById("pin-display");
  const keypad = document.getElementById("keypad");
  const hintEl = document.getElementById("lock-hint");
  const heartsEl = document.getElementById("lock-hearts");
  let entered = "";
  let locked = false; // true once correct code is confirmed, ignore further input

  const HINTS = [
    "align the constellation",
    "set the stars correctly",
    "find our constellation",
    "the answer is written in the stars",
    "the universe remembers"
  ];
  let hintIndex = 0;
  setInterval(()=>{
    hintIndex = (hintIndex+1) % HINTS.length;
    hintEl.style.opacity = 0;
    setTimeout(()=>{ hintEl.textContent = HINTS[hintIndex]; hintEl.style.opacity = 1; }, 300);
  }, 3200);

  function renderPin(){
    pinBoxes.forEach((box, i)=>{
      const digit = entered[i];
      box.dataset.digit = digit ? "•" : "";
      box.classList.toggle("filled", !!digit);
    });
  }

  function wrongAttempt(){
    pinDisplay.classList.add("shake","flash-red");
    heartsEl.querySelectorAll(".lock-heart").forEach(h=> h.textContent = "💔");
    AudioManager.playSfx("wrong");
    setTimeout(()=>{
      pinDisplay.classList.remove("shake","flash-red");
      heartsEl.querySelectorAll(".lock-heart").forEach(h=> h.textContent = "💖");
      entered = "";
      renderPin();
    }, 550);
  }

  function correctAttempt(){
    locked = true;
    heartsEl.querySelectorAll(".lock-heart").forEach(h=> h.textContent = "💖");
    AudioManager.playSfx("unlock");
    state.unlocked = true;
    saveState();
    runSupernovaTransition();
  }

  keypad.addEventListener("click", (e)=>{
    const btn = e.target.closest(".key");
    if(!btn || locked) return;
    const key = btn.dataset.key;

    if(key === "clear"){
      entered = "";
      renderPin();
      return;
    }
    if(key === "enter"){
      if(entered.length < 4) return; // not enough digits yet, do nothing
      if(entered === CODE){ correctAttempt(); } else { wrongAttempt(); }
      return;
    }
    // numeric key
    if(entered.length < 4){
      entered += key;
      renderPin();
    }
  });

 // Laging hihingin ang password every time i-open ang website
  showScreen("lock", { skipAudio:true });
  AudioManager.playTrack("lock");
})();

/* transition*/
function runSupernovaTransition(){
  showScreen("supernova", { skipAudio:true });
  const video = document.getElementById("video-supernova");
  const flash = document.getElementById("supernova-flash");

  const proceed = ()=>{
    flash.classList.add("flash-in");
    setTimeout(()=>{
      showScreen("home");
    }, 900);
  };

  video.currentTime = 0;
  const p = video.play();
  if(p && p.catch) p.catch(()=>{ /* video missing — flash still carries the transition */ });
  video.addEventListener("ended", proceed, { once:true });
  // Fallback in case the video asset is missing or very short.
  setTimeout(proceed, 2200);
}

/* ==========================================================================
   HOMEPAGE — planets & constellation lines
   ========================================================================== */
(function initHomepage(){
  document.querySelectorAll(".planet").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const target = btn.dataset.target;
      btn.classList.add("visited");
      showScreen(target);
    });
  });

  document.getElementById("blackhole-trigger").addEventListener("click", enterBlackHole);

  drawHomeConstellation();
})();

function drawHomeConstellation(){
  const svg = document.getElementById("home-constellation-lines");
  const field = document.getElementById("planet-field");
  if(!svg || !field) return;

  const fieldBox = field.getBoundingClientRect();
  if(fieldBox.width === 0 || fieldBox.height === 0) return; // field not visible/laid out yet

  const centers = {};
  field.querySelectorAll(".planet-orb").forEach(orb=>{
    const planetKey = orb.closest(".planet").dataset.planet;
    const box = orb.getBoundingClientRect();
    // Position as a percentage of the field's own box, matching the SVG's
    // viewBox="0 0 100 100" so the lines always land exactly on the orbs.
    centers[planetKey] = {
      x: ((box.left + box.width / 2) - fieldBox.left) / fieldBox.width * 100,
      y: ((box.top + box.height / 2) - fieldBox.top) / fieldBox.height * 100
    };
  });

  const order = ["mercury", "neptune", "venus"];
  const points = order.map(key => centers[key]).filter(Boolean);
  if(points.length < 3) return;

  svg.innerHTML = `
    <path d="M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}" />
    <path d="M ${points[1].x} ${points[1].y} L ${points[2].x} ${points[2].y}" />
    <path d="M ${points[2].x} ${points[2].y} L ${points[0].x} ${points[0].y}" />
  `;
}

// Recompute whenever the layout could have shifted (resize, orientation change).
window.addEventListener("resize", ()=>{
  if(document.getElementById("screen-home").classList.contains("active")) drawHomeConstellation();
});

/* ==========================================================================
   MERCURY — letters shelf
   ========================================================================== */
function renderMercuryShelf(){
  const shelf = document.getElementById("mercury-shelf");
  shelf.innerHTML = "";

  LETTER_CATEGORY_META.forEach(cat=>{
    const letters = REGULAR_LETTERS.filter(l=> l.categoryKey === cat.key);
    const readCount = letters.filter(l=> state.lettersRead[l.id]).length;

    const wrap = document.createElement("div");
    wrap.className = "shelf-category";
    wrap.innerHTML = `
      <button class="shelf-header">
        <span>${cat.icon} ${cat.name}</span>
        <span class="cat-count">${readCount}/${cat.count} &nbsp; <span class="shelf-caret">▾</span></span>
      </button>
      <div class="shelf-envelopes"></div>
    `;
    const header = wrap.querySelector(".shelf-header");
    const grid = wrap.querySelector(".shelf-envelopes");

    letters.forEach(letter=>{
      const env = document.createElement("button");
      env.className = "envelope" + (state.lettersRead[letter.id] ? " read" : "");
      env.innerHTML = `
        <span class="envelope-icon">${state.lettersRead[letter.id] ? "💌" : "✉️"}</span>
        <span class="envelope-tooltip">${letter.hint}</span>
      `;
      env.addEventListener("click", ()=>{
        // On touch devices (no real hover), the first tap just previews the
        // hint bubble; tapping again opens the letter. On desktop, hovering
        // already reveals the hint, so a click always opens right away.
        const isTouch = window.matchMedia && window.matchMedia("(hover: none)").matches;
        if(isTouch && !env.classList.contains("show-tooltip")){
          env.classList.add("show-tooltip");
          clearTimeout(env._tooltipTimer);
          env._tooltipTimer = setTimeout(()=> env.classList.remove("show-tooltip"), 2200);
          return;
        }
        env.classList.remove("show-tooltip");
        openLetter(letter);
      });
      grid.appendChild(env);
    });

    header.addEventListener("click", ()=> wrap.classList.toggle("open"));
    shelf.appendChild(wrap);
  });

  // Secret letters category (always last)
  const secretWrap = document.createElement("div");
  secretWrap.className = "shelf-category";
  secretWrap.innerHTML = `
    <button class="shelf-header">
      <span>🔒 Secret Letters</span>
      <span class="cat-count"><span class="shelf-caret">▾</span></span>
    </button>
    <div class="shelf-envelopes" id="secret-shelf-grid"></div>
  `;
  secretWrap.querySelector(".shelf-header").addEventListener("click", ()=> secretWrap.classList.toggle("open"));
  shelf.appendChild(secretWrap);
  renderSecretLetters();

  updateMercuryProgress();
}

function renderSecretLetters(){
  const grid = document.getElementById("secret-shelf-grid");
  if(!grid) return;
  grid.innerHTML = "";
  SECRET_LETTERS.forEach(sl=>{
    const unlocked = state.secretUnlocked[sl.unlockKey];
    const env = document.createElement("button");
    env.className = "envelope secret-envelope" + (unlocked ? " unlocked" : "");
    env.title = unlocked ? sl.title : "????";
    env.innerHTML = `<span class="envelope-icon">${unlocked ? "💌" : "🔒"}</span>`;
    env.addEventListener("click", ()=>{
      if(!unlocked) return;
      openSecretLetter(sl);
    });
    grid.appendChild(env);
  });
}

function updateMercuryProgress(){
  const total = REGULAR_LETTERS.length;
  const read = Object.keys(state.lettersRead).filter(id=> state.lettersRead[id]).length;
  document.getElementById("mercury-progress").textContent = `${read} / ${total} letters read`;
}

function renderLetterBody(text){
  const textEl = document.getElementById("letter-modal-text");
  const blankEl = document.getElementById("letter-modal-blank");
  if(text && text.trim()){
    textEl.textContent = text;
    textEl.hidden = false;
    blankEl.hidden = true;
  } else {
    textEl.hidden = true;
    blankEl.hidden = false;
  }
}

function openLetter(letter){
  document.getElementById("letter-modal-category").textContent = `${letter.icon} ${letter.categoryName}`;
  renderLetterBody(letter.text);
  openModal("letter-modal");

  if(!state.lettersRead[letter.id]){
    state.lettersRead[letter.id] = true;
    saveState();
    renderMercuryShelf();
    checkSecretUnlocks();
  }
}

function openSecretLetter(sl){
  if(sl.isDiary) {
    document.getElementById("diary-modal-category").textContent = `💌 ${sl.title}`;
    renderDiaryBoard();
    openModal("diary-modal");
  } else {
    document.getElementById("letter-modal-category").textContent = `🔒 ${sl.title}`;
    renderLetterBody(sl.text);
    openModal("letter-modal");
  }
}

// Neptune
function getStarOrder(){
  if(!state.starOrder || state.starOrder.length !== STARS.length){
    const order = STARS.map((_, i)=> i);
    for(let i = order.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    state.starOrder = order;
    saveState();
  }
  return state.starOrder;
}

function shuffledIndices(n){
  const arr = Array.from({length:n}, (_, i)=> i);
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderStarfield(){
  const field = document.getElementById("starfield");
  field.innerHTML = "";
  const order = getStarOrder();

  const GRID_COLS = 10;
  const GRID_ROWS = 10;
  const cellOrder = shuffledIndices(GRID_COLS * GRID_ROWS);

  STARS.forEach((_, position)=>{
    const star = STARS[order[position]];
    const size = 9 + Math.random()*14;

    const cell = cellOrder[position];
    const cellX = cell % GRID_COLS;
    const cellY = Math.floor(cell / GRID_COLS);
    const cellWidth = 100 / GRID_COLS;
    const cellHeight = 100 / GRID_ROWS;
    const jitterX = (Math.random() - 0.5) * (cellWidth * 0.5);
    const jitterY = (Math.random() - 0.5) * (cellHeight * 0.5);
    const left = (cellX + 0.5) * cellWidth + jitterX;
    const top = (cellY + 0.5) * cellHeight + jitterY;

    const rot = Math.random()*360;
    const found = !!state.starsFound[star.id];

    const btn = document.createElement("button");
    btn.className = "star-point" + (found ? " found" : "");
    btn.style.width = `${size}px`;
    btn.style.height = `${size}px`;
    btn.style.left = `${left}%`;
    btn.style.top = `${top}%`;
    btn.style.setProperty("--rot", `${rot}deg`);
    btn.style.setProperty("--base-opacity", (0.55 + Math.random()*0.45).toFixed(2));
    btn.style.setProperty("--twinkle-dur", `${(2 + Math.random()*2.5).toFixed(2)}s`);
    btn.style.setProperty("--drift-dur", `${(4 + Math.random()*4).toFixed(2)}s`);
   
    btn.style.setProperty("--dx", `${(Math.random()*4 - 2).toFixed(1)}px`);
    btn.style.setProperty("--dy", `${(Math.random()*4 - 2).toFixed(1)}px`);
    btn.innerHTML = `<img src="assets/images/${star.img}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="star-fallback" style="display:none;">⭐</span>`;
    btn.addEventListener("click", ()=> openStar(star, btn));
    field.appendChild(btn);
  });

  const special = document.createElement("button");
  special.className = "star-point special" + (state.hiddenStarFound ? " found" : "");
  special.style.width = "22px";
  special.style.height = "22px";
  special.style.left = "50%";
  special.style.top = "4%";
  special.style.setProperty("--base-opacity", "0.85");
  special.style.setProperty("--twinkle-dur", "2.4s");
  special.style.setProperty("--drift-dur", "5s");
  special.innerHTML = `<img src="assets/images/star3.png" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="star-fallback" style="display:none;">✨</span>`;
  special.addEventListener("click", ()=> openHiddenStar(special));
  field.appendChild(special);

  updateStarCounter();
}

function updateStarCounter(){
  const found = Object.keys(state.starsFound).filter(id=> state.starsFound[id]).length;
  document.getElementById("star-counter").textContent = `Stars Found: ${found} / 100`;
}

function openStar(star, btn){
  document.getElementById("star-modal-number").textContent = "one of a hundred reasons";
  document.getElementById("star-modal-text").textContent = star.text;
  openModal("star-modal");

  if(!state.starsFound[star.id]){
    state.starsFound[star.id] = true;
    saveState();
    btn.classList.add("found");
    updateStarCounter();
    checkSecretUnlocks();

    const foundCount = Object.keys(state.starsFound).filter(id=> state.starsFound[id]).length;
    if(foundCount >= 100){
      setTimeout(() => {
        state.starsFound = {};
        saveState();
        renderStarfield();
      }, 1500);
    }
  }
}

function openHiddenStar(btn){
  document.getElementById("star-modal-number").textContent = HIDDEN_STAR.title;
  document.getElementById("star-modal-text").textContent = HIDDEN_STAR.text;
  openModal("star-modal");
  if(!state.hiddenStarFound){
    state.hiddenStarFound = true;
    saveState();
    btn.classList.add("found");
    checkSecretUnlocks();
  }
}

// VENUS
function initVenus(){
  const wrap = document.getElementById("bouquet-wrap");
  const artWrap = document.getElementById("venus-art-wrap");
  const lyricsWrap = document.getElementById("venus-lyrics-wrap");
  const hint = document.getElementById("tap-hint");
  const audio = document.getElementById("venus-lyric-audio");
  const lyricEl = document.getElementById("venus-lyric-line");

  wrap.classList.remove("opened");
  if(artWrap) artWrap.classList.remove("visible");
  if(lyricsWrap) lyricsWrap.classList.remove("visible");
  hint.style.display = "";
  if(audio){ audio.pause(); audio.currentTime = 0; }
  if(lyricEl) lyricEl.textContent = "";

  const LYRICS = [
    { time: 0, text: "" },
    { time: 0.16, text: "You're the moon that glows in the sky" },
    { time: 3.82, text: "Lighting up the world when it's blue" },
    { time: 8.37, text: "Stars they dance, though late in the night" },
    { time: 11.82, text: "Don't you know they dance just for you?" },
    { time: 15.70, text: "" },
    { time: 34.96, text: "There you are, above darkened clouds" },
    { time: 38.60, text: "Smiling at the world from afar" },
    { time: 42.77, text: "With the stars, you wander around" },
    { time: 46.13, text: "May they follow you wherever you are" },
    { time: 51.46, text: "Here I am, just another boy" },
    { time: 54.16, text: "Singing songs that others have sung" },
    { time: 59.61, text: "Tryin' to find the words to employ" },
    { time: 62.39, text: "To adore the goddess of love" },
    { time: 67.33, text: "Ohh, you've got me in a daze, yeah" },
    { time: 71.62, text: "No, it's not another phase" },
    { time: 75.37, text: "You gave me one look and now I can't get my mind off of you" },
    { time: 81.92, text: "And it's all because" },
    { time: 83.83, text: "I see the galaxies when I look in your eyes" },
    { time: 87.14, text: "And I, can't speak, no, I, can't speak at all" },
    { time: 91.83, text: "I swear to Zeus, you're Aphrodite in disguise" },
    { time: 95.59, text: "Don't think that you could hide it from me" },
    { time: 99.39, text: "Oh, no, I never thought I'd get this close to someone so divine" },
    { time: 103.69, text: "Oh, I, can't breathe, no, I, can't breathe at all" },
    { time: 108.46, text: "Aphrodite, could you, could you please be mine?" },
    { time: 111.76, text: "Oh..." },
    { time: 114.43, text: "Could you please be mine?" },
    { time: 115.74, text: "Oh, mine" },
    { time: 118.82, text: "" },
    { time: 133.34, text: "Here you are, I've waited so long" },
    { time: 136.63, text: "Hoping you would sit down and stay" },
    { time: 141.37, text: "'Cause with the stars, I've been dancing along" },
    { time: 144.69, text: "Like a fool, so you'd look my way" },
    { time: 149.50, text: "You're the moon that glows in the sky" },
    { time: 153.45, text: "Lighting up my world when it's blue" },
    { time: 157.70, text: "And here I sing, though late in the night" },
    { time: 162.07, text: "Hope you know I sing just for you" },
    { time: 165.66, text: "Ohh, you've got me in a daze, yeah" },
    { time: 170.07, text: "No, it's not another phase" },
    { time: 173.57, text: "You gave me one look and now I can't get my mind off of you" },
    { time: 180.13, text: "And it's all because" },
    { time: 182.40, text: "I see the galaxies when I look in your eyes" },
    { time: 185.73, text: "And I, can't speak, no, I, can't speak at all" },
    { time: 190.40, text: "I swear to Zeus, you're Aphrodite in disguise" },
    { time: 194.22, text: "Don't think that you could hide it from me" },
    { time: 197.73, text: "Oh, no, I never thought I'd get this close to someone so divine" },
    { time: 201.74, text: "Oh, I, can't breathe, no, I, can't breathe at all" },
    { time: 207.04, text: "Aphrodite, could you, could you please be mine?" },
    { time: 210.21, text: "Oh..." },
    { time: 212.96, text: "Could you please be mine?" },
    { time: 214.48, text: "Oh, mine" },
    { time: 217.12, text: "" },
    { time: 221.16, text: "Could you please be mine?" },
    { time: 222.69, text: "Oh, mine" },
    { time: 223.17, text: "..." }
  ];

  const syncLyrics = () => {
    if (!audio || audio.paused) return;
    const currentTime = audio.currentTime;
    
    let currentLine = "";
    for (let i = 0; i < LYRICS.length; i++) {
      if (currentTime >= LYRICS[i].time) {
        currentLine = LYRICS[i].text;
      } else {
        break;
      }
    }
    
    if (lyricEl.textContent !== currentLine) {
      lyricEl.style.opacity = 0; 
      setTimeout(() => {
        lyricEl.textContent = currentLine;
        lyricEl.style.opacity = 1; 
      }, 300);
    }
    
    requestAnimationFrame(syncLyrics); 
  };

  const handler = ()=>{
    wrap.classList.add("opened");
    
    if(artWrap) artWrap.classList.add("visible");
    
    setTimeout(()=> {
      if(lyricsWrap) lyricsWrap.classList.add("visible");
    }, 500);

    if(!state.bouquetOpened){
      state.bouquetOpened = true;
      saveState();
      checkSecretUnlocks();
    }
    if(!state.venusSongPlayed){
      state.venusSongPlayed = true;
      saveState();
    }
    
    if(audio){
      setTimeout(()=>{
        const p = audio.play();
        if(p && p.catch) p.catch(()=>{ /* autoplay blocked */ });
        requestAnimationFrame(syncLyrics); 
      }, 600);
    }
    wrap.removeEventListener("click", handler);
  };
  
  wrap.removeEventListener("click", handler);
  wrap.addEventListener("click", handler);
}

function pauseVenusVideo(){
  const audio = document.getElementById("venus-lyric-audio");
  if(audio && !audio.paused){ audio.pause(); }
}

// SINGULARITY
function enterBlackHole(){
  state.blackholeEntered = true;
  saveState();
  checkSecretUnlocks();

  const fadeLayer = document.getElementById("final-fade-in");
  showScreen("final", { skipAudio:true });
  fadeLayer.classList.remove("faded");
 
  void fadeLayer.offsetWidth;
  requestAnimationFrame(()=>{
    fadeLayer.classList.add("faded");
  });

  AudioManager.playTrack("singularity");
  startFinalLetter();
}

let finalLetterStarted = false;
function startFinalLetter(){
  if(finalLetterStarted) return;
  finalLetterStarted = true;

  const container = document.getElementById("final-letter-lines");
  container.innerHTML = "";
  const screen = document.getElementById("screen-final");

  let i = 0;
  function revealNext(){
    if(i >= FINAL_LETTER_LINES.length) return;
    const p = document.createElement("p");
    const isLast = i === FINAL_LETTER_LINES.length - 1;
    if(isLast) p.classList.add("final-line");
    p.textContent = FINAL_LETTER_LINES[i];
    container.appendChild(p);
    requestAnimationFrame(()=> p.classList.add("shown"));

    screen.scrollTo({ top: screen.scrollHeight, behavior:"smooth" });

    i++;
    setTimeout(revealNext, isLast ? 0 : 2000);
  }
  setTimeout(revealNext, 800);
}

// easter egg
(function initBabyEasterEgg(){
  let buffer = "";
  window.addEventListener("keydown", (e)=>{
    if(e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-4).toLowerCase();
    if(buffer === "baby"){
      openBabyModal();
      buffer = "";
    }
  });

  function openBabyModal(){
    const modal = document.getElementById("baby-modal");
    if(modal.classList.contains("open")) return;
    modal.classList.add("open");
  }

  function closeAndCelebrate(){
    document.getElementById("baby-modal").classList.remove("open");
    triggerHeartRain();
    AudioManager.playSfx("mwah");
    if(!state.babyActivated){
      state.babyActivated = true;
      saveState();
      checkSecretUnlocks();
    }
  }

  document.getElementById("baby-yes-1").addEventListener("click", closeAndCelebrate);
  document.getElementById("baby-yes-2").addEventListener("click", closeAndCelebrate);
})();

function triggerHeartRain(){
  const rain = document.getElementById("heart-rain");
  rain.innerHTML = "";
  rain.classList.add("active");
  const hearts = ["💖","💕","💗","✨","💫"];
  for(let i=0;i<32;i++){
    const drop = document.createElement("span");
    drop.className = "heart-drop";
    drop.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    drop.style.left = `${Math.random()*100}%`;
    drop.style.animationDuration = `${2.4 + Math.random()*1.8}s`;
    drop.style.animationDelay = `${Math.random()*0.6}s`;
    drop.style.fontSize = `${1 + Math.random()*1.2}rem`;
    rain.appendChild(drop);
  }
  setTimeout(()=>{ rain.classList.remove("active"); rain.innerHTML = ""; }, 4200);
}

// secret letter unlock toast
function checkSecretUnlocks(){
  let changed = false;

  const starsFoundCount = Object.keys(state.starsFound).filter(id=> state.starsFound[id]).length;
  if(!state.secretUnlocked.stars100 && starsFoundCount >= 100){
    state.secretUnlocked.stars100 = true; changed = true; announceSecret();
  }

  const lettersReadCount = Object.keys(state.lettersRead).filter(id=> state.lettersRead[id]).length;
  if(!state.secretUnlocked.allLetters && lettersReadCount >= REGULAR_LETTERS.length){
    state.secretUnlocked.allLetters = true; changed = true; announceSecret();
  }

  if(!state.secretUnlocked.everything &&
     state.planetsVisited.mercury && state.planetsVisited.neptune && state.planetsVisited.venus &&
     starsFoundCount >= 100 && state.bouquetOpened && state.venusSongPlayed && state.babyActivated){
    state.secretUnlocked.everything = true; changed = true; announceSecret();
  }

  if(changed){
    saveState();
    renderSecretLetters();
  }
  updateConstellation();
}

function checkTimeUnlock(){
  if(state.secretUnlocked.time1111) return;
  const now = new Date();
  const isElevenEleven = now.getHours() % 12 === 11 && now.getMinutes() === 11;
  if(isElevenEleven){
    state.secretUnlocked.time1111 = true;
    saveState();
    announceSecret();
    renderSecretLetters();
  }
}
setInterval(checkTimeUnlock, 15000);
checkTimeUnlock();

let toastTimer = null;
function announceSecret(){
  const toast = document.getElementById("secret-toast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove("show"), 5200);
}

// modal helpers
function openModal(id){
  document.getElementById(id).classList.add("open");
}
function closeModal(id){
  document.getElementById(id).classList.remove("open");
}
document.querySelectorAll("[data-close-modal]").forEach(el=>{
  el.addEventListener("click", ()=>{
    document.querySelectorAll(".modal.open").forEach(m=> m.classList.remove("open"));
  });
});
document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape"){
    document.querySelectorAll(".modal.open").forEach(m=>{
      if(m.id !== "baby-modal") m.classList.remove("open");
    });
  }
});

// mute button
document.getElementById("mute-toggle").addEventListener("click", (e)=>{
  const muted = AudioManager.toggleMuted();
  e.currentTarget.classList.toggle("is-muted", muted);
});

// progress bar
const CONST_NODES = [
  { key:"home", x:100, y:20 },
  { key:"mercury", x:170, y:70 },
  { key:"neptune", x:150, y:160 },
  { key:"venus", x:50, y:160 },
  { key:"blackhole", x:30, y:70 }
];

function initConstellationMap(){
  const linesG = document.getElementById("const-lines");
  const nodesG = document.getElementById("const-nodes");
  linesG.innerHTML = ""; nodesG.innerHTML = "";

  for(let i=0;i<CONST_NODES.length;i++){
    const a = CONST_NODES[i];
    const b = CONST_NODES[(i+1)%CONST_NODES.length];
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
    line.classList.add("const-line");
    line.dataset.pair = `${a.key}-${b.key}`;
    linesG.appendChild(line);
  }
  CONST_NODES.forEach(n=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", n.x); circle.setAttribute("cy", n.y); circle.setAttribute("r", 7);
    circle.classList.add("const-node");
    circle.dataset.key = n.key;
    nodesG.appendChild(circle);
  });
}

function visitedFlags(){
  return {
    home:true, 
    mercury: state.planetsVisited.mercury,
    neptune: state.planetsVisited.neptune,
    venus: state.planetsVisited.venus,
    blackhole: state.blackholeEntered
  };
}

function updateConstellation(){
  const flags = visitedFlags();
  document.querySelectorAll(".const-node").forEach(node=>{
    node.classList.toggle("visited", !!flags[node.dataset.key]);
  });
  document.querySelectorAll(".const-line").forEach(line=>{
    const [a,b] = line.dataset.pair.split("-");
    line.classList.toggle("lit", !!flags[a] && !!flags[b]);
  });
}
initConstellationMap();
updateConstellation();

document.getElementById("home-btn").addEventListener("click", ()=> showScreen("home"));

// planet
renderMercuryShelf();
renderStarfield();

const venusObserver = new MutationObserver(()=>{
  if(document.getElementById("screen-venus").classList.contains("active")) initVenus();
});
venusObserver.observe(document.getElementById("screen-venus"), { attributes:true, attributeFilter:["class"] });

/* logic*/
(function initCustomPlaylist(){
  const mySongs = [
    { title: "Pahingi Ako ng Kiss", artist: "Frank Ely", file: "assets/audio/songs/song1.mp3" },
    { title: "Risk It All", artist: "Bruno Mars", file: "assets/audio/songs/song2.mp3" },
    { title: "honeybee", artist: "Olivia Rodrigo", file: "assets/audio/songs/song3.mp3" },
    { title: "her", artist: "JVKE", file: "assets/audio/songs/song4.mp3" },
    { title: "North", artist: "Clairo", file: "assets/audio/songs/song5.mp3" },
    { title: "Bags", artist: "Clairo", file: "assets/audio/songs/song6.mp3" },
    { title: "Nothing's Gonna Change My Love for You", artist: "George Benson", file: "assets/audio/songs/song7.mp3" },
    { title: "'Til They Take My Heart Away", artist: "Clair Marlo", file: "assets/audio/songs/song8.mp3" },
    { title: "Even the Nights Are Better", artist: "Air Supply", file: "assets/audio/songs/song9.mp3" },
    { title: "Don't Know What to Say - Don't Know What to Do", artist: "Ric Segreto", file: "assets/audio/songs/song10.mp3" },
    { title: "Not Just On Christmas", artist: "Ariana Grande", file: "assets/audio/songs/song11.mp3" },
    { title: "Mahal Kita Kasi", artist: "Chris Tsuper, Nicole Hyala", file: "assets/audio/songs/song12.mp3" },
    { title: "Honeymoon Avenue", artist: "Ariana Grande", file: "assets/audio/songs/song13.mp3" },
    { title: "pov", artist: "Ariana Grande", file: "assets/audio/songs/song14.mp3" },
    { title: "Ruin The Friendship", artist: "Taylor Swift", file: "assets/audio/songs/song15.mp3" },
    { title: "Thinkin Bout You", artist: "Frank Ocean", file: "assets/audio/songs/song16.mp3" },
    { title: "Sweet", artist: "Cigarettes After Sex", file: "assets/audio/songs/song17.mp3" },
    { title: "Kiss It Better", artist: "Rihanna", file: "assets/audio/songs/song18.mp3" },
    { title: "Earrings", artist: "Malcolm Todd", file: "assets/audio/songs/song19.mp3" },
    { title: "Aking Bahaghari", artist: "Jeiven", file: "assets/audio/songs/song20.mp3" },
    { title: "Ibang Planeta", artist: "Zild", file: "assets/audio/songs/song21.mp3" },
    { title: "Kyusi", artist: "Zild", file: "assets/audio/songs/song22.mp3" },
    { title: "They Don't Know About Us", artist: "One Direction", file: "assets/audio/songs/song23.mp3" },
    { title: "Just the Way You Are", artist: "Bruno Mars", file: "assets/audio/songs/song24.mp3" },
    { title: "Be My Baby", artist: "The Ronettes", file: "assets/audio/songs/song25.mp3" },
    { title: "Glue Song", artist: "beabadoobee", file: "assets/audio/songs/song26.mp3" },
    { title: "Always", artist: "Daniel Caesar", file: "assets/audio/songs/song27.mp3" },
    { title: "Kiss Me", artist: "Sixpence None The Richer", file: "assets/audio/songs/song28.mp3" },
    { title: "Come Inside Of My Heart", artist: "IV OF SPADES", file: "assets/audio/songs/song29.mp3" },
    { title: "My Love Mine All Mine", artist: "Mitski", file: "assets/audio/songs/song30.mp3" },
    { title: "Linger - Remastered 2026", artist: "The Cranberries", file: "assets/audio/songs/song31.mp3" },
    { title: "Valentine", artist: "Laufey", file: "assets/audio/songs/song32.mp3" },
    { title: "Superpowers", artist: "Daniel Caesar", file: "assets/audio/songs/song33.mp3" },
    { title: "No Other Heart", artist: "Mac DeMarco", file: "assets/audio/songs/song34.mp3" },
    { title: "Melting", artist: "Kali Uchis", file: "assets/audio/songs/song35.mp3" },
    { title: "the perfect pair", artist: "beabadoobee", file: "assets/audio/songs/song36.mp3" },
    { title: "Lovers Rock", artist: "TV Girl", file: "assets/audio/songs/song37.mp3" },
    { title: "Juna", artist: "Clairo", file: "assets/audio/songs/song38.mp3" },
    { title: "Everyone Adores You (at least I do)", artist: "Matt Maltese", file: "assets/audio/songs/song39.mp3" },
    { title: "My Kind of Woman", artist: "Mac DeMarco", file: "assets/audio/songs/song40.mp3" },
    { title: "Can't Take My Eyes off You", artist: "Frankie Valli", file: "assets/audio/songs/song41.mp3" },
    { title: "You Belong With Me (Taylor’s Version)", artist: "Taylor Swift", file: "assets/audio/songs/song42.mp3" },
    { title: "Something About You", artist: "Eyedress, Dent May", file: "assets/audio/songs/song43.mp3" },
    { title: "Apocalypse", artist: "Cigarettes After Sex", file: "assets/audio/songs/song44.mp3" },
    { title: "Heart To Heart", artist: "Mac DeMarco", file: "assets/audio/songs/song45.mp3" },
    { title: "Slow Dance", artist: "Clairo", file: "assets/audio/songs/song46.mp3" },
    { title: "Nothing's Gonna Hurt You Baby", artist: "Cigarettes After Sex", file: "assets/audio/songs/song47.mp3" },
    { title: "20191009 I Like Her", artist: "Mac DeMarco", file: "assets/audio/songs/song48.mp3" },
    { title: "Baby I'm Yours", artist: "Arctic Monkeys", file: "assets/audio/songs/song49.mp3" },
    { title: "Sure Thing", artist: "Miguel", file: "assets/audio/songs/song50.mp3" },
    { title: "Iris", artist: "The Goo Goo Dolls", file: "assets/audio/songs/song51.mp3" },
    { title: "I Wanna Be Yours", artist: "Arctic Monkeys", file: "assets/audio/songs/song52.mp3" },
    { title: "Sesame Syrup", artist: "Cigarettes After Sex", file: "assets/audio/songs/song53.mp3" },
    { title: "Yellow", artist: "Coldplay", file: "assets/audio/songs/song54.mp3" },
    { title: "Until I Found You (with Em Beihold) - Em Beihold Version", artist: "Stephen Sanchez, Em Beihold", file: "assets/audio/songs/song55.mp3" },
    { title: "Cupid's Chokehold / Breakfast in America", artist: "Gym Class Heroes", file: "assets/audio/songs/song56.mp3" },
    { title: "You're All I Want", artist: "Cigarettes After Sex", file: "assets/audio/songs/song57.mp3" },
    { title: "Nothing", artist: "Bruno Major", file: "assets/audio/songs/song58.mp3" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", file: "assets/audio/songs/song59.mp3" },
    { title: "Hey Lover!", artist: "Wabie", file: "assets/audio/songs/song60.mp3" },
    { title: "This Side of Paradise", artist: "Coyote Theory", file: "assets/audio/songs/song61.mp3" },
    { title: "Pretty Boy", artist: "The Neighbourhood", file: "assets/audio/songs/song62.mp3" },
    { title: "Stargazing", artist: "The Neighbourhood", file: "assets/audio/songs/song63.mp3" },
    { title: "Can't Help Falling in Love", artist: "Christian Leave", file: "assets/audio/songs/song64.mp3" },
    { title: "Stuck with U (with Justin Bieber)", artist: "Ariana Grande, Justin Bieber", file: "assets/audio/songs/song65.mp3" },
    { title: "Butterflies", artist: "Abe Parker", file: "assets/audio/songs/song66.mp3" },
    { title: "4EVER", artist: "Clairo", file: "assets/audio/songs/song67.mp3" },
    { title: "i <3 u", artist: "boy pablo", file: "assets/audio/songs/song68.mp3" },
    { title: "u + me = <3", artist: "Olivia Rodrigo", file: "assets/audio/songs/song69.mp3" },
    { title: "purple", artist: "Olivia Rodrigo", file: "assets/audio/songs/song70.mp3" },
    { title: "Am I Bothering You?", artist: "Reality Club", file: "assets/audio/songs/song71.mp3" },
    { title: "Alexandra", artist: "Reality Club", file: "assets/audio/songs/song72.mp3" },
    { title: "Lover Girl", artist: "Laufey", file: "assets/audio/songs/song73.mp3" },
    { title: "Magnolia", artist: "Laufey", file: "assets/audio/songs/song74.mp3" },
    { title: "While You Were Sleeping", artist: "Laufey", file: "assets/audio/songs/song75.mp3" },
    { title: "Florence", artist: "Malcolm Todd", file: "assets/audio/songs/song76.mp3" },
    { title: "stupid song", artist: "Olivia Rodrigo", file: "assets/audio/songs/song77.mp3" },
    { title: "Attention", artist: "Malcolm Todd", file: "assets/audio/songs/song78.mp3" },
    { title: "4Me 4Me", artist: "Malcolm Todd", file: "assets/audio/songs/song79.mp3" },
    { title: "Around", artist: "NIKI", file: "assets/audio/songs/song80.mp3" },
    { title: "I Choose You", artist: "keshi", file: "assets/audio/songs/song81.mp3" },
    { title: "Anyone Else But You", artist: "The Moldy Peaches", file: "assets/audio/songs/song82.mp3" },
    { title: "Coffee Breath", artist: "Flicka Roe", file: "assets/audio/songs/song83.mp3" },
    { title: "Made to Fall in Love", artist: "Daniel Caesar", file: "assets/audio/songs/song84.mp3" },
    { title: "New House", artist: "Rex Orange County", file: "assets/audio/songs/song85.mp3" },
    { title: "In Luv With U", artist: "Finn", file: "assets/audio/songs/song86.mp3" },
    { title: "honey", artist: "boy pablo", file: "assets/audio/songs/song87.mp3" },
    { title: "Loving Is Easy (feat. Benny Sings)", artist: "Rex Orange County, Benny Sings", file: "assets/audio/songs/song88.mp3" },
    { title: "Cherry Wine", artist: "grentperez", file: "assets/audio/songs/song89.mp3" },
    { title: "I'm In Love With You", artist: "The 1975", file: "assets/audio/songs/song90.mp3" },
    { title: "It's Not Living (If It's Not With You)", artist: "The 1975", file: "assets/audio/songs/song91.mp3" },
    { title: "Neu Roses (Transgressor's Song)", artist: "Daniel Caesar", file: "assets/audio/songs/song92.mp3" },
    { title: "Packing It Up", artist: "Gracie Abrams", file: "assets/audio/songs/song93.mp3" },
    { title: "Sunsetz", artist: "Cigarettes After Sex", file: "assets/audio/songs/song94.mp3" },
    { title: "Heavenly", artist: "Cigarettes After Sex", file: "assets/audio/songs/song95.mp3" },
    { title: "Don't Let Me Go", artist: "Cigarettes After Sex", file: "assets/audio/songs/song96.mp3" },
    { title: "Starry Eyes", artist: "Cigarettes After Sex", file: "assets/audio/songs/song97.mp3" },
    { title: "John Wayne", artist: "Cigarettes After Sex", file: "assets/audio/songs/song98.mp3" },
    { title: "Darling", artist: "LEEHI", file: "assets/audio/songs/song99.mp3" },
    { title: "Safety Zone", artist: "LEEHI", file: "assets/audio/songs/song100.mp3" }
  ];

  const audio = document.getElementById("sp-audio-player");
  const trackList = document.getElementById("sp-track-list");
  const titleEl = document.getElementById("sp-title");
  const artistEl = document.getElementById("sp-artist");
  const btnPlayPause = document.getElementById("sp-play-pause");
  const btnPrev = document.getElementById("sp-prev");
  const btnNext = document.getElementById("sp-next");

  if(!audio || !trackList) return;

  let currentIndex = 0;

  mySongs.forEach((song, index) => {
    const item = document.createElement("div");
    item.className = "sp-track-item";
    item.innerHTML = `
      <div class="sp-track-num">${index + 1}</div>
      <div>
        <p class="sp-track-title">${song.title}</p>
        <p class="sp-track-artist">${song.artist}</p>
      </div>
    `;
    item.addEventListener("click", () => playTrack(index));
    trackList.appendChild(item);
  });

  function playTrack(index) {
    if(index < 0) index = mySongs.length - 1;
    if(index >= mySongs.length) index = 0;
    currentIndex = index;

    const song = mySongs[currentIndex];
    audio.src = song.file;
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;

    document.querySelectorAll(".sp-track-item").forEach((el, i) => {
      el.classList.toggle("playing", i === currentIndex);
    });

    audio.play();
    btnPlayPause.textContent = "⏸️";
  }

  btnPlayPause.addEventListener("click", () => {
    if(audio.paused) {
      if(!audio.src) playTrack(0);
      btnPlayPause.textContent = "⏸️";
    } else {
      audio.pause();
      btnPlayPause.textContent = "▶️";
    }
  });


  btnPrev.addEventListener("click", () => playTrack(currentIndex - 1));
  btnNext.addEventListener("click", () => playTrack(currentIndex + 1));

  audio.addEventListener("ended", () => playTrack(currentIndex + 1));
})();

function playTrack(key){
    if(key === current) return;
    const next = key ? (TRACKS[key] || null) : null;
    const prev = current ? TRACKS[current] : null;
    current = key;

    if(prev){
      fade(prev, prev.volume || TARGET_VOLUME, 0, ()=>{
        prev.pause(); 
      });
    }
    if(next){
      safePlay(next); 
      fade(next, 0, TARGET_VOLUME, null);
    }
  }

/* ==========================================================================
   STICKY NOTE DIARY FUNCTIONS
   ========================================================================== */
window.addDiaryNote = function(){
  const textarea = document.getElementById("diary-textarea");
  const text = textarea.value.trim();
  if(!text) return; 

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if(!state.diaryEntries) state.diaryEntries = [];
  state.diaryEntries.push({ date: dateStr, text: text });
  saveState();

  textarea.value = "";
  renderDiaryBoard();
};

window.renderDiaryBoard = function(){
  const board = document.getElementById("diary-board");
  if(!board) return;
  board.innerHTML = "";

  const entries = state.diaryEntries || [];
  
  [...entries].reverse().forEach((entry, i) => {
    const note = document.createElement("div");
    note.className = "sticky-note";
    
    const rot = (Math.random() * 4 - 2).toFixed(1);
    note.style.transform = `rotate(${rot}deg)`;
    
    note.innerHTML = `
      <p class="note-date">${entry.date}</p>
      <p class="note-text">${entry.text}</p>
      <p class="note-sig">- Baby</p>
    `;
    board.appendChild(note);
  });
};
