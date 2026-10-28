'use strict';

const { clr, speedLine } = require('./format');

const CLAIM_TIERS = [
  { min: 70, pctColor: 'grn', verdict: ['grn', 'Sesuai klaim.'] },
  { min: 40, pctColor: 'cyn', verdict: ['yel', 'Di bawah klaim. Periksa jam sibuk dan kontensi jaringan.'] },
  { min: 20, pctColor: 'yel', verdict: ['mag', 'Jauh di bawah klaim. Periksa paket dan kondisi jaringan.'] },
  { min: 0, pctColor: 'mag', verdict: ['mag', 'Jauh di bawah klaim. Periksa paket dan kondisi jaringan.'] }
];

function printHeader({ durationMs, streams }) {
  console.log(clr('b', '\n════ LOCAL SPEEDTEST ════'));
  console.log(clr('d', `Waktu: ${new Date().toLocaleString('id-ID')}`));
  console.log(clr('d', `Durasi: ${durationMs / 1000}s | Streams: ${streams}\n`));
}

function printVerdict(min, max) {
  console.log(clr('b', '• Verdict'));

  if (min > 0 && max / min > 4) {
    console.log(clr('yel', `  > Selisih perServer besar (${(max / min).toFixed(1)}x).`));
    console.log(clr('d', '  > Mungkin routing ISP atau perbedaan kapasitas server. Cek ulang pada jam berbeda.'));
    return;
  }

  const variation = min > 0 ? (max / min).toFixed(1) : 'N/A';

  console.log(clr('grn', `  > Hasil perServer relatif stabil (variasi ${variation}x).`));
}

function printClaim(avg, claim) {
  const pct = (avg / claim) * 100;
  const tier = CLAIM_TIERS.find((t) => pct >= t.min);

  console.log();
  console.log(
    `  Klaim ${claim} Mbps | ${clr(tier.pctColor, pct.toFixed(0) + '%')} ` +
    `${clr('d', `(${avg.toFixed(2)} Mbps)`)}`
  );
  console.log(clr(tier.verdict[0], `  > ${tier.verdict[1]}`));
}

function printReport({ dlVals, upMbps, claim }) {
  if (!dlVals.length) {
    console.log(clr('mag', 'Semua pengujian gagal.'));
    return;
  }

  const avg = dlVals.reduce((a, b) => a + b, 0) / dlVals.length;
  const min = Math.min(...dlVals);
  const max = Math.max(...dlVals);

  console.log(clr('b', '• Hasil'));
  console.log(
    `  Download  ${speedLine(avg)}   ` +
    `${clr('d', `(min ${min.toFixed(2)} / max ${max.toFixed(2)})`)}`
  );

  if (upMbps !== null) {
    console.log(`  Upload    ${speedLine(upMbps)}`);
  }

  console.log();

  printVerdict(min, max);

  if (claim > 0) {
    printClaim(avg, claim);
  }

  console.log();
}

module.exports = {
  printHeader,
  printReport
};
