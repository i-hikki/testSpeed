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

const MAX_REDIRECTS = 3;
const TIMEOUT_GRACE_MS = 15000;

function dlStream(url, dur, onBytes, headers = {}, redirects = 0) {
  return new Promise((resolve) => {
    const { state, fin } = createSettler(resolve);

    try {
      state.req = getClient(url).get(
        url,
        { headers: { ...BASE_HEADERS, ...headers } },
        (res) => {
          const isRedirect =
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location &&
            redirects < MAX_REDIRECTS;

          if (isRedirect) {
            res.resume();

            return dlStream(
              new URL(res.headers.location, url).toString(),
              dur,
              onBytes,
              headers,
              redirects + 1
            ).then(resolve);
          }

          if (res.statusCode >= 400) {
            res.resume();
            return fin({ error: 'HTTP ' + res.statusCode });
          }

          const start = performance.now();

          state.timer = setTimeout(() => fin({ ok: true }), dur);

          res.on('data', (chunk) => {
            onBytes(chunk.length);

            if (performance.now() - start >= dur) {
              fin({ ok: true });
            }
          });

          res.on('end', () => fin({ ok: true }));
          res.on('error', () => fin({ error: 'stream error' }));
        }
      );

      state.req.on('error', (e) => fin({ error: errMsg(e) }));
      state.req.setTimeout(dur + TIMEOUT_GRACE_MS, () => fin({ error: 'timeout' }));
    } catch (e) {
      fin({ error: errMsg(e) });
    }
  });
}

async function dlTest(target, dur, streams, onProg) {
  const meter = createMeter(onProg);
  const sep = target.url.includes('?') ? '&' : '?';

  const results = await Promise.all(
    Array.from({ length: streams }, () =>
      dlStream(
        `${target.url}${sep}r=${Math.random()}`,
        dur,
        meter.add,
        target.headers || {}
      )
    )
  );

  const secs = meter.elapsedSecs();

  if (results.every((r) => r.error)) {
    return { error: results[0].error };
  }

  return { bytes: meter.bytes, secs, mbps: toMbps(meter.bytes, secs) };
}

module.exports = { dlTest };
