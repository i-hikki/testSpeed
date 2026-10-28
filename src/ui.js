'use strict';

const {
  clr,
  fmtB,
  bar,
  toMbps,
  speedLine
} = require('./format');

async function runRow(name, durationMs, runTest) {
  const label = `  ${name.padEnd(16)} `;

  process.stdout.write(label);

  const result = await runTest(({ bytes, elapsedMs }) => {
    const mbps = toMbps(bytes, elapsedMs / 1000);

    process.stdout.write(
      `\r${label}${clr('cyn', bar(Math.min(elapsedMs / durationMs, 1)))} ` +
      `${speedLine(mbps)}  ${fmtB(bytes).padStart(9)}`
    );
  });

  if (result.error) {
    process.stdout.write(
      `\r${label}${clr('mag', 'SKIP: ' + result.error)}${' '.repeat(25)}\n`
    );

    return result;
  }

  process.stdout.write(
    `\r${label}${speedLine(result.mbps)}  ` +
    `${clr('d', fmtB(result.bytes) + ' in ' + result.secs.toFixed(1) + 's')}   \n`
  );

  return result;
}

module.exports = { runRow };
