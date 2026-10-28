'use strict';

const COLORS = {
  r: '\x1b[0m',
  b: '\x1b[1m',
  d: '\x1b[2m',
  grn: '\x1b[32m',
  yel: '\x1b[33m',
  cyn: '\x1b[36m',
  mag: '\x1b[35m'
};

const clr = (key, text) => `${COLORS[key] || ''}${text}${COLORS.r}`;

const fmtB = (b) => {
  if (b < 1024) return b + ' B';
  if (b < 1024 ** 2) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 ** 3) return (b / 1024 ** 2).toFixed(1) + ' MB';

  return (b / 1024 ** 3).toFixed(2) + ' GB';
};

const bar = (p, w = 20) => {
  const f = Math.max(0, Math.min(w, Math.round(p * w)));

  return '█'.repeat(f) + '░'.repeat(w - f);
};

const toMbps = (bytes, secs) => (bytes * 8) / secs / 1e6;

const pickColor = (m) => (m >= 100 ? 'grn' : m >= 20 ? 'cyn' : m >= 5 ? 'yel' : 'mag');

const speedLine = (m) => clr(pickColor(m), m.toFixed(2).padStart(8) + ' Mbps');

module.exports = {
  clr,
  fmtB,
  bar,
  toMbps,
  speedLine
};
