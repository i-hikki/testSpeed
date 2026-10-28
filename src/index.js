'use strict';

const { parseArgs } = require('./args');
const { DOWNLOAD_TARGETS, UPLOAD_TARGET } = require('./config');
const { dlTest } = require('./download');
const { ulTest } = require('./upload');
const { runRow } = require('./ui');
const { printHeader, printReport } = require('./report');
const { clr } = require('./format');

async function run(argv) {
  const { durationMs, streams, claim } = parseArgs(argv);

  printHeader({ durationMs, streams });

  console.log(clr('b', '• Download'));

  const dlVals = [];

  for (const target of DOWNLOAD_TARGETS) {
    const result = await runRow(target.name, durationMs, (onProg) =>
      dlTest(target, durationMs, streams, onProg)
    );

    if (!result.error) dlVals.push(result.mbps);
  }

  console.log();
  console.log(clr('b', '• Upload'));

  const up = await runRow(UPLOAD_TARGET.name, durationMs, (onProg) =>
    ulTest(UPLOAD_TARGET, durationMs, Math.max(2, Math.floor(streams / 2)), onProg)
  );

  console.log();

  printReport({ dlVals, upMbps: up.error ? null : up.mbps, claim });
}

module.exports = { run };
