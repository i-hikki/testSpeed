'use strict';

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

const getClient = (url) => (url.startsWith('https') ? https : http);

const errMsg = (e) => e.code || e.message;

function createSettler(resolve) {
  const state = { done: false, timer: null, req: null };

  const fin = (result) => {
    if (state.done) return;

    state.done = true;
    clearTimeout(state.timer);

    try {
      state.req?.destroy();
    } catch {}

    resolve(result);
  };

  return { state, fin };
}

function createMeter(onProg, intervalMs = 100) {
  const start = performance.now();
  let bytes = 0;
  let last = 0;

  const add = (n) => {
    bytes += n;

    const now = Date.now();

    if (onProg && now - last > intervalMs) {
      last = now;
      onProg({ bytes, elapsedMs: performance.now() - start });
    }
  };

  return {
    add,
    get bytes() {
      return bytes;
    },
    elapsedSecs: () => (performance.now() - start) / 1000
  };
}

module.exports = {
  getClient,
  errMsg,
  createSettler,
  createMeter
};
