'use strict';

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const BASE_HEADERS = {
  'User-Agent': UA,
  'Accept': '*/*',
  'Accept-Encoding': 'identity',
  'Connection': 'keep-alive'
};

const CF_HEADERS = {
  'Origin': 'https://speed.cloudflare.com',
  'Referer': 'https://speed.cloudflare.com/'
};

const DOWNLOAD_TARGETS = [
  {
    name: 'Cloudflare',
    url: 'https://speed.cloudflare.com/__down?measId=1&bytes=10000000000',
    headers: CF_HEADERS
  },
  {
    name: 'OVH Singapore',
    url: 'https://sgp.proof.ovh.net/files/10Gb.dat'
  }
];

const UPLOAD_TARGET = {
  name: 'Cloudflare',
  url: 'https://speed.cloudflare.com/__up',
  headers: CF_HEADERS
};

module.exports = {
  BASE_HEADERS,
  DOWNLOAD_TARGETS,
  UPLOAD_TARGET
};
