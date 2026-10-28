'use strict';

const getArg = (args, name, fallback) => {
  const i = args.indexOf(name);

  if (i >= 0 && args[i + 1]) {
    return args[i + 1];
  }

  const eq = args.find((a) => a.startsWith(name + '='));

  return eq ? eq.slice(name.length + 1) : fallback;
};

function parseArgs(argv) {
  const durationMs = parseInt(getArg(argv, '--duration', '10000'), 10);
  const streams = parseInt(getArg(argv, '--streams', '4'), 10);
  const claim = parseInt(getArg(argv, '--claim', '0'), 10);

  const valid =
    Number.isFinite(durationMs) && durationMs >= 1000 &&
    Number.isFinite(streams) && streams >= 1 &&
    Number.isFinite(claim) && claim >= 0;

  if (!valid) {
    throw new Error('Argumen tidak valid.');
  }

  return { durationMs, streams, claim };
}

module.exports = { parseArgs };
