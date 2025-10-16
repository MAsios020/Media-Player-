import {
  getOverview,
  getPlaylists,
  getTrending,
  getCharts,
  getNowPlaying,
  refreshCache
} from '../services/mediaService.js';

export async function overview(req, res, next) {
  try {
    const data = await getOverview();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function playlists(req, res, next) {
  try {
    const data = await getPlaylists();
    res.json({ playlists: data });
  } catch (error) {
    next(error);
  }
}

export async function trending(req, res, next) {
  try {
    const data = await getTrending();
    res.json({ trending: data });
  } catch (error) {
    next(error);
  }
}

export async function charts(req, res, next) {
  try {
    const data = await getCharts();
    res.json({ charts: data });
  } catch (error) {
    next(error);
  }
}

export async function nowPlaying(req, res, next) {
  try {
    const data = await getNowPlaying();
    res.json({ nowPlaying: data });
  } catch (error) {
    next(error);
  }
}

export async function invalidateCache(req, res, next) {
  try {
    const data = await refreshCache();
    res.json({ message: 'cache refreshed', timestamp: Date.now(), data });
  } catch (error) {
    next(error);
  }
}
