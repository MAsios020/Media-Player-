import request from 'supertest';
import app from '../src/app.js';

describe('Media Player API', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns overview payload', async () => {
    const response = await request(app).get('/api/media/overview');
    expect(response.statusCode).toBe(200);
    expect(response.body.hero).toBeDefined();
    expect(Array.isArray(response.body.trending)).toBe(true);
  });

  it('returns playlists', async () => {
    const response = await request(app).get('/api/media/playlists');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.playlists)).toBe(true);
    expect(response.body.playlists.length).toBeGreaterThan(0);
  });

  it('handles not found routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Not Found');
  });
});
