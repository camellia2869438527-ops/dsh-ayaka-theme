export const PALETTES = Object.freeze({
  light: Object.freeze({ base:'#F4F8FC', surface:'#FFFFFF', sidebar:'#EAF1F8', raised:'#EEF4FA', elevated:'#FFFFFF', text:'#1C2B3C', secondary:'#3E5166', tertiary:'#5B6E83', muted:'#6A7C90', accent:'#4A8FC4', accentHover:'#3B7FB2', accentSoft:'#DDEBF6', onAccent:'#FFFFFF', border:'#C8D8E7', hover:'#E5EEF6', code:'#ECF2F8', gold:'#C6A24E', ice:'#BFE0F2', lilac:'#D8D6EC' }),
  dark: Object.freeze({ base:'#0B1524', surface:'#101C2E', sidebar:'#0E1A2C', raised:'#142238', elevated:'#1B2C45', text:'#EFF5FB', secondary:'#C2D4E4', tertiary:'#9DB4C9', muted:'#8AA3B9', accent:'#9ED3EE', accentHover:'#BDE4F5', accentSoft:'#1E3A54', onAccent:'#0A1622', border:'#2E4A66', hover:'#1D334D', code:'#0D1826', gold:'#D6BC7C', ice:'#A8D8F0', lilac:'#B9B4D8' })
});

function tokens(p) {
  const t = {};
  const assign = (value, ...names) => names.forEach(name => { t['--dsw-alias-' + name] = value; });
  assign(p.base, 'bg-base');
  assign(p.surface, 'bg-layer-1', 'button-floating-fill');
  assign(p.raised, 'bg-layer-2', 'bg-document-preview', 'button-elevated-fill', 'button-info-fill', 'markdown-code-block-banner');
  assign(p.elevated, 'bg-layer-3', 'bg-overlay');
  assign(p.sidebar, 'bg-module-platform');
  assign(p.text, 'label-primary', 'label-primary-bluish', 'label-document-preview', 'menu-icon');
  assign(p.secondary, 'label-secondary', 'label-caption');
  assign(p.tertiary, 'label-tertiary');
  assign(p.muted, 'label-dimmed', 'label-primary-dimmed', 'markdown-placeholder');
  assign(p.accent, 'brand-primary', 'brand-primary-invert', 'brand-primary-new-colorprimary-new-color', 'brand-text', 'button-primary-fill', 'button-contrast-fill', 'link', 'state-business-primary');
  assign(p.accentHover, 'button-primary-hover');
  assign(p.onAccent, 'label-primary-inverted', 'label-primary-foreground');
  assign(p.border, 'border-l1', 'border-l2', 'border-l2-darkmode-thin', 'border-l3', 'border-l4', 'button-ghost-active-border');
  assign(p.hover, 'interactive-bg-hover', 'interactive-bg-hover-solid', 'button-floating-hover', 'button-info-hover', 'button-tool-bar-hover', 'button-ghost-active-hover');
  assign(p.accentSoft, 'interactive-bg-active', 'interactive-bg-hover-accent', 'bg-multi-select', 'button-ghost-active-fill', 'button-primary-dimmed', 'markdown-citation', 'markdown-tag', 'markdown-code-segment-selected');
  assign(p.code, 'markdown-code-block', 'markdown-inline-code', 'markdown-code-segment-unselected');
  assign(p.raised, 'bg-skeleton', 'button-tool-bar-fill');
  assign(p.border, 'scrollbar-bg-l1', 'scrollbar-bg-l2');
  assign(p.tertiary, 'scrollbar-hover-l1', 'scrollbar-hover-l2');
  // Error, warning, success and diff tokens retain the platform's meanings.
  t['--ayaka-gold'] = p.gold;
  t['--ayaka-ice'] = p.ice;
  t['--ayaka-on-accent'] = p.onAccent;
  t['--ayaka-selection'] = p.accentSoft;
  t['--dsw-specific-sidebar-fill'] = p.sidebar;
  t['--dsw-specific-input-major'] = p.surface;
  t['--dsw-specific-bubble'] = p.raised;
  t['--dsw-specific-menu'] = p.elevated;
  t['--dsw-menu-backdrop-filter'] = 'none';
  return Object.freeze(t);
}

export const TOKENS = Object.freeze({ light: tokens(PALETTES.light), dark: tokens(PALETTES.dark) });
export const OVERRIDES = Object.freeze(Object.fromEntries(Object.keys(TOKENS.light).map(name => [name, Object.freeze({ light:TOKENS.light[name], dark:TOKENS.dark[name] })])));
// Content cards retain opaque colors. Only the page canvas reveals the video.
export const ART_OVERRIDES = Object.freeze({ ...OVERRIDES,
  '--dsw-alias-bg-base': Object.freeze({light:'transparent',dark:'transparent'}),
  '--dsw-specific-sidebar-fill': Object.freeze({light:'transparent',dark:'transparent'}),
  '--dsw-specific-bubble': Object.freeze({light:'transparent',dark:'transparent'})
});
