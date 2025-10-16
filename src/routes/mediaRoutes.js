import { Router } from 'express';
import {
  overview,
  playlists,
  trending,
  charts,
  nowPlaying,
  invalidateCache
} from '../controllers/mediaController.js';

const router = Router();

router.get('/overview', overview);
router.get('/playlists', playlists);
router.get('/trending', trending);
router.get('/charts', charts);
router.get('/now-playing', nowPlaying);
router.post('/cache/refresh', invalidateCache);

export default router;
