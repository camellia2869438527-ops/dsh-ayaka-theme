// Desktop pet: one illustration + procedural motion + local voice lines.
// No network, no model calls, no tokens. Voice files are served by the host route.

export function petCss() {
  return `
#ayaka-pet{position:fixed;right:24px;bottom:96px;width:180px;z-index:50;cursor:grab;touch-action:none;user-select:none;filter:drop-shadow(0 14px 28px rgba(0,0,0,.38));transition:opacity .25s ease}
#ayaka-pet:active{cursor:grabbing}
#ayaka-pet[hidden]{display:none}
.ayaka-pet-body{transform-origin:50% 100%;animation:ayaka-breathe 5s ease-in-out infinite}
#ayaka-pet img{width:100%;display:block;pointer-events:none;-webkit-user-drag:none}
#ayaka-pet.ayaka-pet-talking .ayaka-pet-body{animation:ayaka-talk .6s ease-in-out 3}
#ayaka-pet.ayaka-pet-hop .ayaka-pet-body{animation:ayaka-hop .55s ease}
@keyframes ayaka-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015,.99)}}
@keyframes ayaka-talk{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ayaka-hop{0%{transform:translateY(0)}30%{transform:translateY(-14px) scale(1.03)}60%{transform:translateY(0)}80%{transform:translateY(-5px)}100%{transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){.ayaka-pet-body{animation:none}#ayaka-pet.ayaka-pet-talking .ayaka-pet-body,#ayaka-pet.ayaka-pet-hop .ayaka-pet-body{animation:none}}
@media (max-width: 900px){#ayaka-pet{width:140px;right:14px;bottom:84px}}
`;
}

export function installPet(controller, assets) {
  if (document.getElementById('ayaka-pet')) return () => {};
  const host = document.createElement('div');
  host.id = 'ayaka-pet';
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', '神里绫华桌宠');
  const body = document.createElement('div');
  body.className = 'ayaka-pet-body';
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  img.src = assets.pet;
  body.appendChild(img);
  host.appendChild(body);
  document.body.appendChild(host);

  const audio = new Audio();
  audio.preload = 'auto';
  let pending = null;
  const snapshot = () => controller.getSnapshot();

  const play = (key) => {
    if (!snapshot().pet) return;
    const url = assets.voices[key];
    if (!url) return;
    audio.src = url;
    audio.volume = 0.85;
    const done = () => host.classList.remove('ayaka-pet-talking');
    audio.onended = done;
    audio.play().then(() => {
      host.classList.add('ayaka-pet-talking');
      setTimeout(done, 2400);
    }).catch(() => { pending = key; });
  };

  const unlock = () => {
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    if (pending) { const k = pending; pending = null; play(k); }
  };
  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);

  // Time of day + a per-session simulated weather (the voice doc's weather
  // lines fire without any network access or API key).
  const hour = new Date().getHours();
  const timeKey = hour < 5 || hour >= 23 ? 'night' : hour < 11 ? 'morning' : hour < 17 ? 'noon' : 'evening';
  const weather = ['rain', 'thunder', 'snow', 'sunny', 'wind'][Math.floor(Math.random() * 5)];

  const t1 = setTimeout(() => play('open'), 1200);
  const t2 = setTimeout(() => play(weather), 7000);
  const t3 = setTimeout(() => play(timeKey), 14000);
  const idle = setInterval(() => play('idle' + (1 + Math.floor(Math.random() * 4))), 150000);

  // Drag + click
  let dragging = false, moved = 0, sx = 0, sy = 0, bx = 0, by = 0;
  const onDown = (e) => {
    dragging = true; moved = 0; sx = e.clientX; sy = e.clientY;
    const r = host.getBoundingClientRect();
    bx = r.left; by = r.top;
    try { host.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onMove = (e) => {
    if (!dragging) return;
    moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy));
    host.style.left = (bx + e.clientX - sx) + 'px';
    host.style.top = (by + e.clientY - sy) + 'px';
    host.style.right = 'auto';
    host.style.bottom = 'auto';
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    try { host.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (moved < 6) {
      host.classList.remove('ayaka-pet-hop');
      void host.offsetWidth;
      host.classList.add('ayaka-pet-hop');
      setTimeout(() => host.classList.remove('ayaka-pet-hop'), 600);
      play(Math.random() < 0.3 ? 'happy' : 'idle' + (1 + Math.floor(Math.random() * 4)));
    }
  };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);

  const sync = () => { host.hidden = !snapshot().pet; };
  const unsubscribe = controller.subscribe(sync);
  sync();

  return () => {
    clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(idle);
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
    unsubscribe();
    host.remove();
    audio.pause();
    audio.src = '';
  };
}
