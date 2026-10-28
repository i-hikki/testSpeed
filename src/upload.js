'use strict';

const { performance } = require('perf_hooks');
const { BASE_HEADERS } = require('./config');
const { toMbps } = require('./format');
const {
  getClient,
  errMsg,
  createSettler,
  createMeter
} = require('./net');

const CHUNK_SIZE = 256 * 1024;
const TIMEOUT_GRACE_MS = 30000;

function ulStream(url, dur, onBytes, headers = {}) {
  return new Promise((resolve) => {
    const chunk = Buffer.alloc(CHUNK_SIZE, 0x61);
    const parsed = new URL(url);
    const start = performance.now();
    const { state, fin } = createSettler(resolve);

    let ended = false;
    let sentBytes = 0;

    const opts = {
      method: 'POST',
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: {
        ...BASE_HEADERS,
        ...headers,
        'Content-Type': 'application/octet-stream'
      }
    };

    const finishUpload = () => {
      if (state.done || ended) return;

      ended = true;
      clearTimeout(state.timer);

      state.req.end();
    };

    const writeNext = () => {
      while (!state.done && !ended) {
        if (performance.now() - start >= dur) {
          return finishUpload();
        }

        const ok = state.req.write(chunk);

        sentBytes += chunk.length;
        onBytes(chunk.length);

        if (!ok) {
          state.req.once('drain', writeNext);
          return;
        }
      }
    };

    try {
      state.req = getClient(url).request(opts, (res) => {
        res.on('data', () => {});

        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return fin({ error: 'HTTP ' + res.statusCode });
          }

          fin({ ok: true, bytes: sentBytes });
        });

        res.on('error', () => fin({ error: 'response error' }));
      });

      state.req.on('error', (e) => fin({ error: errMsg(e) }));
      state.req.setTimeout(dur + TIMEOUT_GRACE_MS, () => fin({ error: 'timeout' }));

      state.timer = setTimeout(finishUpload, dur);

      writeNext();
    } catch (e) {
      fin({ error: errMsg(e) });
    }
  });
}

async function ulTest(target, dur, streams, onProg) {
  const meter = createMeter(onProg);

  const results = await Promise.all(
    Array.from({ length: streams }, () =>
      ulStream(target.url, dur, meter.add, target.headers || {})
    )
  );

  const secs = meter.elapsedSecs();

  if (results.every((r) => !r.ok)) {
    return { error: results.find((r) => r.error)?.error || 'Upload failed' };
  }

  const confirmed = results.reduce((sum, r) => sum + (r.ok ? r.bytes : 0), 0);

  return { bytes: confirmed, secs, mbps: toMbps(confirmed, secs) };
}

module.exports = { ulTest };
