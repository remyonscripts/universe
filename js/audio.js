/* ==========================================================================
   AUDIO.JS — Global Audio Manager
   Ensures only one background track plays at a time, with a fade-out of the
   current track and a fade-in of the next. Sound effects play independently
   on top, and everything respects the global mute toggle.
   ========================================================================== */

const AudioManager = (() => {
  const TRACKS = {
    lock: document.getElementById("audio-lock"),
    homepage: document.getElementById("audio-homepage"),
    mercury: document.getElementById("audio-mercury"),
    neptune: document.getElementById("audio-neptune"),
    venus: document.getElementById("audio-venus"),
    singularity: document.getElementById("audio-singularity")
  };

  const SFX = {
    wrong: document.getElementById("sfx-wrong"),
    unlock: document.getElementById("sfx-unlock"),
    mwah: document.getElementById("sfx-mwah")
  };

  const TARGET_VOLUME = 0.55;
  const FADE_MS = 900;

  let current = null;      // key of currently-playing track
  let muted = false;
  const fadeTimers = new Map(); // one independent timer per <audio> element

  function safePlay(audio){
    if(!audio) return;
    const p = audio.play();
    if(p && p.catch){ p.catch(()=>{ /* autoplay blocked or file missing — fail silently */ }); }
  }

  function clearFade(audio){
    const timer = fadeTimers.get(audio);
    if(timer){ clearInterval(timer); fadeTimers.delete(audio); }
  }

  function fade(audio, from, to, done){
    if(!audio){ if(done) done(); return; }
    clearFade(audio); // only cancels THIS audio's own fade, never another track's
    let vol = from;
    audio.volume = muted ? 0 : from;
    const steps = 18;
    const stepTime = FADE_MS / steps;
    const delta = (to - from) / steps;
    let count = 0;
    const timer = setInterval(()=>{
      count++;
      vol += delta;
      audio.volume = muted ? 0 : Math.max(0, Math.min(1, vol));
      if(count >= steps){
        clearFade(audio);
        if(done) done();
      }
    }, stepTime);
    fadeTimers.set(audio, timer);
  }

  /**
   * Switch background music to `key` (or null to just fade out to silence).
   * Fades the current track out, pauses/resets it, then fades the new track
   * in. Because each audio element now owns its own fade timer, the two
   * fades run independently and never cancel each other — no more overlap.
   */
  function playTrack(key){
    if(key === current) return;
    const next = key ? (TRACKS[key] || null) : null;
    const prev = current ? TRACKS[current] : null;
    current = key;

    if(prev){
      fade(prev, prev.volume || TARGET_VOLUME, 0, ()=>{
        prev.pause();
        prev.currentTime = 0;
      });
    }
    if(next){
      next.currentTime = 0;
      safePlay(next);
      fade(next, 0, TARGET_VOLUME, null);
    }
  }

  function stopAll(){
    Object.values(TRACKS).forEach(a=>{
      if(!a) return;
      clearFade(a);
      a.pause();
      a.currentTime = 0;
      a.volume = TARGET_VOLUME;
    });
    current = null;
  }

  function playSfx(key){
    const audio = SFX[key];
    if(!audio || muted) return;
    audio.currentTime = 0;
    safePlay(audio);
  }

  function setMuted(val){
    muted = val;
    Object.values(TRACKS).forEach(a=>{ if(a) a.muted = muted; });
    Object.values(SFX).forEach(a=>{ if(a) a.muted = muted; });
  }

  function toggleMuted(){
    setMuted(!muted);
    return muted;
  }

  return { playTrack, stopAll, playSfx, setMuted, toggleMuted, get muted(){ return muted; } };
})();
