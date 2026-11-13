import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/App.css', import.meta.url), 'utf8');
const themes = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8');
function tokens(source, selector) {
  const block = source.slice(source.indexOf(`${selector} {`)).split('}')[0];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)]
    .map(([, name, color]) => [name, color]));
}
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}
const light = { ...tokens(css, ':root'), ...tokens(themes, '.app-layout') };
const dark = { ...light, ...tokens(themes, '.app-layout.dark-mode') };
const high = tokens(themes, '.app-layout.high-contrast');
for (const [name, palette, target] of [
  ['Light', light, 4.5], ['Dark', dark, 4.5],
  ['Light high contrast', { ...light, ...high }, 7],
  ['Dark high contrast', { ...dark, ...high, ...tokens(themes, '.app-layout.dark-mode.high-contrast') }, 7],
]) {
  let checked = 0;
  const check = (foreground, background, minimum) => {
    const ratio = contrast(palette[foreground], palette[background]);
    assert.ok(ratio >= minimum, `${name}: ${foreground} on ${background} = ${ratio.toFixed(2)}; expected ${minimum}`);
    checked++;
  };
  for (const surface of ['canvas', 'surface', 'secondary-surface', 'secondary-tint', 'secondary-hover', 'mail-unread-surface', 'mail-read-surface']) {
    for (const foreground of ['navy', 'muted', 'text-secondary', 'accent']) check(foreground, surface, target);
    check('border', surface, 3);
  }
  for (const status of ['danger', 'warning', 'success']) check(`${status}-text`, `${status}-surface`, target);
  for (const surface of ['mail-unread-surface', 'mail-read-surface', 'secondary-hover']) check('danger-text', surface, target);
  check('on-accent', 'secondary-active', target);
  check('on-accent', 'accent-hover', target);
  check('toast-text', 'toast-background', target);
  console.log(`${name}: ${checked} text/control contrast checks passed.`);
}
