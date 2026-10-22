import { PALETTES, OVERRIDES, ART_OVERRIDES } from './palette.js';
import { createController, STORAGE_KEY } from './controller.js';
import { artCss, installVideo } from './art.js';

export const inject = ['theme', 'slots', 'locale'];

export const dictionaries = {
  zh: {
    title:'神里绫华主题', description:'霜蓝与雪白，点缀深海军蓝和一点淡金。',
    default:'默认配色', light:'浅色', dark:'深色', system:'跟随系统',
    activeLight:'当前为浅色', activeDark:'当前为深色', inactive:'已恢复默认配色', saved:'选择已保存',
    unavailable:'当前选择仅在本次打开期间生效，无法保存到本机。',
    newer:'已有较新版本的设置，本版不会覆盖；当前切换仅临时生效。',
    invalid:'保存的设置无法识别，已恢复默认；重新选择即可保存。',
    palette:'主题配色', colorBlue:'霜蓝', colorWhite:'雪白', colorNavy:'深蓝', colorGold:'淡金', colorIce:'冰蓝',
    wallpaper:'动态壁纸', stickers:'按钮表情',
    artNote:'动态壁纸铺满整个窗口；侧栏与右栏为霜色玻璃。表情用于新会话、欢迎区、文件入口、评价和发送按钮；功能文字保留。',
    wallpaperNote:'关闭壁纸后仅保留配色。',
    stickerNote:'表情画廊：',
    s0:'好耶', s1:'收到', s2:'咦？', s3:'不要', s4:'加油', s5:'谢谢', s6:'呜呜', s7:'害羞', s8:'晚安', s9:'哼', s10:'啊？'
  },
  en: {
    title:'Kamisato Ayaka theme', description:'Frost blue and snow white, with deep navy and a touch of pale gold.',
    default:'Default colors', light:'Light', dark:'Dark', system:'Follow system',
    activeLight:'Light appearance', activeDark:'Dark appearance', inactive:'Default colors restored', saved:'Selection saved',
    unavailable:'This selection lasts for this window only. Local saving is unavailable.',
    newer:'Newer settings were found and will be preserved. Changes are temporary.',
    invalid:'Saved settings were not recognized. Choose an appearance to save again.',
    palette:'Theme palette', colorBlue:'Frost blue', colorWhite:'Snow white', colorNavy:'Navy', colorGold:'Pale gold', colorIce:'Ice',
    wallpaper:'Motion wallpaper', stickers:'Button stickers',
    artNote:'The motion wallpaper fills the whole window; the sidebar and right bar are frosted glass. Stickers decorate the new-session, welcome, file, feedback and send controls; functional text is kept.',
    wallpaperNote:'Turning the wallpaper off keeps colors only.',
    stickerNote:'Sticker gallery:',
    s0:'Yay', s1:'Got it', s2:'Eh?', s3:'No', s4:'Go', s5:'Thanks', s6:'Sob', s7:'Shy', s8:'Good night', s9:'Hmph', s10:'Huh?!'
  }
};

export function makeCard(React, assets) {
  const h = React.createElement;
  const STICKER_NAMES = ['s0','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'];
  return function AyakaCard({ controller, t }) {
    const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const colors = state.scheme === 'dark' ? PALETTES.dark : PALETTES.light;
    const swatches = [['accent','colorBlue'],['base','colorWhite'],['text','colorNavy'],['gold','colorGold'],['ice','colorIce']];
    const sticker = (index, className='') => h('span', { className:'ayaka-sticker ' + className, 'aria-hidden':true, style:{ backgroundImage:`url("${assets.stickers[index]}")` } });
    return h('section', { className:'ayaka-theme-card', 'aria-label':t('title') },
      state.enabled && state.wallpaper ? h('div', { className:'ayaka-wallpaper-preview', 'aria-hidden':true }, h('video', { src:assets.video, poster:assets.poster, muted:true, loop:true, autoPlay:true, playsInline:true })) : null,
      h('div', { className:'ayaka-theme-heading' },
        state.enabled && state.stickers ? sticker(1) : h('span', { className:'ayaka-theme-mark', 'aria-hidden':true }, '❄'),
        h('h3', null, t('title'))),
      h('p', { className:'ayaka-theme-description' }, t('description')),
      h('div', { className:'ayaka-theme-options', role:'group', 'aria-label':t('title') },
        ['default','light','dark','system'].map(mode => h('button', {
          key:mode, type:'button', 'aria-pressed':mode === 'default' ? !state.enabled : state.enabled && state.preference === mode,
          onClick:() => controller.choose(mode)
        }, t(mode)))),
      h('div', { className:'ayaka-theme-swatches', 'aria-label':t('palette') }, swatches.map(([key,label]) => h('span', {
        key, className:'ayaka-theme-swatch', style:{ background:colors[key] }, title:t(label), 'aria-label':t(label), role:'img'
      }))),
      h('div', { className:'ayaka-decoration-options' }, ['wallpaper','stickers'].map(name => h('label', { key:name },
        h('input', { type:'checkbox', checked:state[name], disabled:!state.enabled, onChange:event=>controller.setDecoration(name, event.target.checked) }), t(name)))),
      h('p', { className:'ayaka-theme-description' }, t('wallpaperNote')),
      h('p', { className:'ayaka-theme-description' }, t('artNote')),
      state.enabled && state.stickers ? h('div', { className:'ayaka-sticker-gallery' },
        STICKER_NAMES.map((name, index) => h('div', { key:name, title:t(name) }, sticker(index), h('span', null, t(name))))) : null,
      h('p', { className:'ayaka-theme-status', role:'status', 'aria-live':'polite' },
        t(state.enabled ? (state.scheme === 'dark' ? 'activeDark' : 'activeLight') : 'inactive'), ' · ', t(state.storageState))
    );
  };
}

export function applyClient(ctx, React, css, assets) {
  let controller;
  let storage;
  ctx.effect(() => {
    try { storage = window.localStorage; } catch { /* Browsers may block local storage. The controller reports session-only saving. */ }
    controller = createController(ctx.theme, storage, OVERRIDES, ART_OVERRIDES);
    return () => controller.dispose();
  });
  ctx.on('theme/change', () => controller.syncTheme());
  ctx.effect(() => {
    const onStorage = event => { if (storage && event.storageArea === storage && (event.key === STORAGE_KEY || event.key === null)) controller.syncStorage(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  });
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.plugin = 'dsh-ayaka-theme';
    style.textContent = css + '\n' + artCss(assets.stickers);
    document.head.appendChild(style);
    return () => style.remove();
  });
  ctx.effect(() => {
    const body = document.body;
    const previous = body.getAttribute('data-ayaka-art');
    const previousStickers = body.getAttribute('data-ayaka-stickers');
    const disposeVideo = installVideo(assets.video, assets.poster);
    const sync = () => {
      const state = controller.getSnapshot();
      if (state.enabled && state.wallpaper) body.setAttribute('data-ayaka-art', state.scheme);
      else body.removeAttribute('data-ayaka-art');
      body.toggleAttribute('data-ayaka-stickers', state.enabled && state.stickers);
    };
    sync();
    const unsubscribe = controller.subscribe(sync);
    return () => {
      unsubscribe(); disposeVideo();
      if (previous === null) body.removeAttribute('data-ayaka-art'); else body.setAttribute('data-ayaka-art', previous);
      if (previousStickers === null) body.removeAttribute('data-ayaka-stickers'); else body.setAttribute('data-ayaka-stickers', previousStickers);
    };
  });
  ctx.effect(() => ctx.locale.register('settings.ayaka', dictionaries));
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name:'settings.general.item', id:'ayaka-theme', order:12, locale:'settings.ayaka', inject:() => ({ controller })
  }, makeCard(React, assets)));
}
