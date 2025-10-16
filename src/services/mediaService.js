import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_FILE = path.resolve('data', 'media-data.json');
let cachedData = null;
let lastLoaded = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function loadData(force = false) {
  const now = Date.now();
  if (!force && cachedData && now - lastLoaded < CACHE_TTL) {
    return cachedData;
  }

  const file = await fs.readFile(DATA_FILE, 'utf-8');
  cachedData = JSON.parse(file);
  lastLoaded = now;
  return cachedData;
}

export async function getOverview() {
  const data = await loadData();
  return {
    hero: data.hero,
    explore: data.explore,
    trending: data.trending,
    playlists: data.playlists,
    charts: data.charts,
    nowPlaying: data.nowPlaying
  };
}

export async function getPlaylists() {
  const data = await loadData();
  return data.playlists;
}

export async function getTrending() {
  const data = await loadData();
  return data.trending;
}

export async function getCharts() {
  const data = await loadData();
  return data.charts;
}

export async function getNowPlaying() {
  const data = await loadData();
  return data.nowPlaying;
}

export async function refreshCache() {
  await loadData(true);
  return cachedData;
}
