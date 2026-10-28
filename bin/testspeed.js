#!/usr/bin/env node
'use strict';

const { run } = require('../src');
const { clr } = require('../src/format');

run(process.argv.slice(2)).catch((e) => {
  console.error(clr('mag', 'Fatal: ' + (e?.stack || e)));
  process.exit(1);
});
