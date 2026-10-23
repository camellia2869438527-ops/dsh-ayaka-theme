// CSS-module roles verified against the Desktop shell. Match complete class
// tokens rather than a build-specific hash, so an app update does not break
// the skin. No DOM replacement and no event replacement.
function role(name) {
  return `:is([class$="_${name}"],[class*="_${name} "])`;
}

// Sticker index map (assets/stickers/{i}.webp):
// 0 开心：好耶  1 乖巧：收到  2 疑惑：咦？  3 拒绝：不要  4 加油：加油
// 5 感谢：谢谢  6 委屈：呜呜  7 害羞：害羞  8 晚安：晚安  9 生气：哼  10 震惊：啊？
//
// Stickers are full chibi figures; they stay legible only at the larger,
// hover-only sizes. The tiny inline crops on the new-session and send buttons
// were removed (they were unreadable). A sticker always renders `contain`, so
// the whole figure is visible rather than a zoomed fragment of a face.
export function artCss(stickerUrls) {
  const sidebar = role('sidebarCol');
  const frame = `${role('frame')}:has(> ${sidebar})`;
  const canvas = `${role('centerCol')},${role('rightbarCol')}`;
  const hello = role('fishHitbox');
  const sticker = index => `background-image:url("${stickerUrls[index]}");background-size:contain;background-repeat:no-repeat;background-position:center;pointer-events:none`;

  return `
/* --- dynamic video ground --- */
#ayaka-video{position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:-2;pointer-events:none;background:#0B1524;transition:opacity .35s ease}
body:not([data-ayaka-art]) #ayaka-video{opacity:0}
#ayaka-scrim{position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(9,18,31,.84),rgba(9,18,31,.62) 42%,rgba(9,18,31,.34)),linear-gradient(180deg,rgba(9,18,31,.58),rgba(9,18,31,.14) 34%,rgba(9,18,31,.72));transition:opacity .35s ease}
body:not([data-ayaka-art]) #ayaka-scrim{opacity:0}
/* The video is dark art, so a LIGHT appearance must put a light veil over it
   or dark text becomes unreadable. The scheme attribute drives the veil. */
body[data-ayaka-art="light"] #ayaka-scrim{background:linear-gradient(90deg,rgba(244,248,252,.9),rgba(244,248,252,.72) 42%,rgba(244,248,252,.5)),linear-gradient(180deg,rgba(244,248,252,.72),rgba(244,248,252,.2) 34%,rgba(244,248,252,.82))}

/* Shell surfaces lift to reveal the video; the side columns keep a frost veil. */
body[data-ayaka-art] ${frame}{background-color:transparent}
body[data-ayaka-art] :is(${canvas}){background:transparent}
body[data-ayaka-art] ${sidebar}{background:transparent;position:relative;isolation:isolate}
body[data-ayaka-art] ${sidebar}::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:rgba(14,26,44,.58);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
body[data-ayaka-art="light"] ${sidebar}::before{background:rgba(234,241,248,.78)}
body[data-ayaka-art] ${role('rightbarCol')}{background:rgba(14,26,44,.52);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
body[data-ayaka-art="light"] ${role('rightbarCol')}{background:rgba(234,241,248,.72)}
body[data-ayaka-art] ${role('card')}:has(${role('input')}){background:rgba(13,23,38,.94);background-image:none;border:1px solid var(--dsw-alias-border-l2)}
body[data-ayaka-art="light"] ${role('card')}:has(${role('input')}){background:rgba(255,255,255,.96)}
@media(prefers-reduced-transparency:reduce){body[data-ayaka-art] ${sidebar}::before,body[data-ayaka-art] ${role('rightbarCol')}{background:var(--dsw-alias-bg-module-platform);backdrop-filter:none}}

/* --- stickers on controls (hover-only + the welcome area, where the whole
   figure renders large enough to read) --- */
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]{position:relative;width:32px;height:32px}
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]::before{content:"";position:absolute;left:-16px;bottom:calc(100% + 8px);width:72px;height:72px;${sticker(2)};opacity:0;visibility:hidden}
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]:not([aria-expanded="true"]):is(:hover,:focus-visible)::before{opacity:1;visibility:visible}
body[data-ayaka-stickers] ${role('card')}:has(${role('menu')} [role="listbox"]) button${role('add')}::before{opacity:0;visibility:hidden}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"]){position:relative;width:28px;height:28px}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"])::before{content:"";position:absolute;left:-18px;bottom:calc(100% + 8px);width:72px;height:72px;opacity:0;visibility:hidden}
body[data-ayaka-stickers] button[aria-label="好的回答"]::before{${sticker(4)}}
body[data-ayaka-stickers] button[aria-label="有问题的回答"]::before{${sticker(3)}}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"]):is(:hover,:focus-visible)::before{opacity:1;visibility:visible}
body[data-ayaka-stickers] ${hello}{width:84px;height:84px;position:relative}
body[data-ayaka-stickers] ${hello} svg{display:none}
body[data-ayaka-stickers] ${hello}::before{content:"";position:absolute;inset:0;${sticker(1)}}
@media(max-width:600px){body[data-ayaka-stickers] ${hello}{width:64px;height:64px}}
`;
}

export function installVideo(videoUrl, posterUrl) {
  const existing = document.getElementById('ayaka-video');
  if (existing) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const scrim = document.createElement('div');
  scrim.id = 'ayaka-scrim';
  scrim.setAttribute('aria-hidden', 'true');
  const video = document.createElement('video');
  video.id = 'ayaka-video';
  video.setAttribute('aria-hidden', 'true');
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.poster = posterUrl;
  video.src = videoUrl;
  const sync = () => { if (reduced.matches) video.pause(); else video.play().catch(() => {}); };
  reduced.addEventListener('change', sync);
  document.body.prepend(scrim, video);
  sync();
  return () => {
    reduced.removeEventListener('change', sync);
    video.remove();
    scrim.remove();
  };
}
