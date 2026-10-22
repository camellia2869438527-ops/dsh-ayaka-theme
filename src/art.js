// CSS-module roles verified against the Desktop shell. Match complete class
// tokens rather than a build-specific hash, so an app update does not break
// the skin. No DOM replacement and no event replacement.
function role(name) {
  return `:is([class$="_${name}"],[class*="_${name} "])`;
}

// Sticker index map (assets/stickers/{i}.webp):
// 0 开心：好耶 (new session)   1 乖巧：收到 (welcome)
// 2 疑惑：咦？ (file)          3 拒绝：不要 (dislike)
// 4 加油：加油 (like)          5 感谢：谢谢 (send)
// 6 委屈：呜呜  7 害羞：害羞  8 晚安：晚安  9 生气：哼  10 震惊：啊？
export function artCss(stickerUrls) {
  const sidebar = role('sidebarCol');
  const frame = `${role('frame')}:has(> ${sidebar})`;
  const canvas = `${role('centerCol')},${role('rightbarCol')}`;
  const newIcon = `button${role('newSession')} ${role('newSessionContent')}`;
  const send = `button${role('primary')}:is([aria-label^="发送"],[aria-label^="Send"])`;
  const hello = role('fishHitbox');
  const sticker = index => `background-image:url("${stickerUrls[index]}");background-size:contain;background-repeat:no-repeat;background-position:center;pointer-events:none`;

  return `
/* --- dynamic video ground --- */
#ayaka-video{position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;z-index:-2;pointer-events:none;background:#0B1524;transition:opacity .35s ease}
body:not([data-ayaka-art]) #ayaka-video{opacity:0}
#ayaka-scrim{position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(9,18,31,.82),rgba(9,18,31,.6) 42%,rgba(9,18,31,.32)),linear-gradient(180deg,rgba(9,18,31,.55),rgba(9,18,31,.12) 34%,rgba(9,18,31,.7))}
body:not([data-ayaka-art]) #ayaka-scrim{opacity:0}

/* Shell surfaces lift to reveal the video; the sidebar keeps a frost veil. */
body[data-ayaka-art] ${frame}{background-color:transparent}
body[data-ayaka-art] :is(${canvas}){background:transparent}
body[data-ayaka-art] ${sidebar}{background:transparent;position:relative;isolation:isolate}
body[data-ayaka-art] ${sidebar}::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:rgba(14,26,44,.55);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
body[data-ayaka-art] ${role('rightbarCol')}{background:rgba(14,26,44,.5);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
body[data-ayaka-art] ${role('card')}:has(${role('input')}){background:rgba(13,23,38,.92);background-image:none;border:1px solid var(--dsw-alias-border-l2)}
@media(prefers-reduced-transparency:reduce){body[data-ayaka-art] ${sidebar}::before,body[data-ayaka-art] ${role('rightbarCol')}{background:var(--dsw-alias-bg-module-platform);backdrop-filter:none}}

/* --- stickers on controls --- */
body[data-ayaka-stickers] ${newIcon}{gap:8px;justify-content:flex-start;width:100%}
body[data-ayaka-stickers] ${newIcon}::before{content:"";width:36px;height:36px;flex:none;${sticker(0)};background-size:150%;background-position:50% 35%;border-radius:50%;background-color:var(--dsw-specific-menu);box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}
body[data-ayaka-stickers] ${newIcon}>svg{display:none}
body[data-ayaka-stickers] ${send}{position:relative;width:88px;height:46px;border-radius:12px}
body[data-ayaka-stickers] ${send}>svg{visibility:hidden}
body[data-ayaka-stickers] ${send}::before{content:"";position:absolute;left:3px;top:3px;width:40px;height:40px;${sticker(5)};background-size:145%;background-position:55% 75%;border-radius:50%;background-color:var(--dsw-specific-menu)}
body[data-ayaka-stickers] ${send}::after{content:"发送";position:absolute;right:8px;top:50%;transform:translateY(-50%);font:500 13px/20px sans-serif;color:var(--dsw-alias-label-primary);pointer-events:none}
body[data-ayaka-stickers] ${send}:disabled{opacity:.72}
body[data-ayaka-stickers] button${role('newSession')}{height:48px}
body[data-ayaka-stickers] ${role('collapsed')} button${role('newSession')}{width:42px;height:42px}
body[data-ayaka-stickers] ${role('collapsed')} ${newIcon}::before{width:36px;height:36px}
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]{position:relative;width:32px;height:32px}
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]::before{content:"";position:absolute;left:-16px;bottom:calc(100% + 8px);width:64px;height:64px;${sticker(2)};opacity:0;visibility:hidden}
body[data-ayaka-stickers] button${role('add')}[aria-label="添加文件或调用指令"]:not([aria-expanded="true"]):is(:hover,:focus-visible)::before{opacity:1;visibility:visible}
body[data-ayaka-stickers] ${role('card')}:has(${role('menu')} [role="listbox"]) button${role('add')}::before{opacity:0;visibility:hidden}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"]){position:relative;width:28px;height:28px}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"])::before{content:"";position:absolute;left:-18px;bottom:calc(100% + 8px);width:64px;height:64px;opacity:0;visibility:hidden}
body[data-ayaka-stickers] button[aria-label="好的回答"]::before{${sticker(4)}}
body[data-ayaka-stickers] button[aria-label="有问题的回答"]::before{${sticker(3)}}
body[data-ayaka-stickers] button:is([aria-label="好的回答"],[aria-label="有问题的回答"]):is(:hover,:focus-visible)::before{opacity:1;visibility:visible}
body[data-ayaka-stickers] ${hello}{width:84px;height:84px;position:relative}
body[data-ayaka-stickers] ${hello} svg{display:none}
body[data-ayaka-stickers] ${hello}::before{content:"";position:absolute;inset:0;${sticker(1)}}
@media(max-width:600px){body[data-ayaka-stickers] ${hello}{width:64px;height:64px}body[data-ayaka-stickers] ${send}{width:84px}}
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
