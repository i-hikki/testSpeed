<div align="center">

# speedTest

CLI speedtest ringan berbasis Node.js. Zero dependency — cukup Node.js 16+.

Mengukur kecepatan **download** (Cloudflare & OVH Singapore) dan **upload** (Cloudflare),
lalu memberi verdict stabilitas antar server dan perbandingan dengan kecepatan paket yang diklaim ISP.

![Node.js 16+](https://img.shields.io/badge/Node.js-16%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)
[![](https://img.shields.io/discord/1224048331685101588?logo=discord&logoColor=white&label=Discord&color=5865F2&style=flat-square)](https://discord.gg/nYNDTSVZZG)

</div>

## Usage

```bash
node bin/testspeed.js
# atau
npm start
```

## Options

```bash
node bin/testspeed.js --duration 15000 --streams 8 --claim 100
```

| Opsi | Default | Keterangan |
|------|---------|------------|
| `--duration` | `10000` | Durasi tiap tes dalam ms (minimal 1000) |
| `--streams` | `4` | Jumlah koneksi paralel (upload memakai setengahnya, minimal 2) |
| `--claim` | `0` | Kecepatan paket ISP (Mbps) untuk dibandingkan. `0` = nonaktif |

> Tes ini menghabiskan kuota: kira² sebesar kecepatan × durasi, per server. Hati² di koneksi terbatas.