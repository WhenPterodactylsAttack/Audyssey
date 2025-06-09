// Mock dotenv before any other imports
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Set environment variables before importing app
process.env.SPOTIFY_CLIENT_ID = 'test_client_id';
process.env.SPOTIFY_CLIENT_SECRET = 'test_client_secret';
process.env.REDIRECT_URI = 'http://localhost:5000/callback';

const request = require('supertest');
const express = require('express');
const app = require('../index');

// Mock the request module
jest.mock('request', () => {
  return jest.fn((options, callback) => {
    if (options.url.includes('/api/token')) {
      callback(null, { statusCode: 200 }, { access_token: 'test_token', refresh_token: 'test_refresh_token' });
    } else if (options.url.includes('/v1/me')) {
      callback(null, { statusCode: 200 }, { id: 'test_user' });
    }
  });
});

describe('Spotify API Integration Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use port 0 for testing
  });

  afterAll((done) => {
    server.close(done);
  });

  // Test login endpoint
  describe('GET /login', () => {
    test('should redirect to Spotify authorization page', async () => {
      const response = await request(server)
        .get('/login')
        .expect(302); // Expecting redirect

      expect(response.header.location).toContain('accounts.spotify.com/authorize');
      expect(response.header.location).toContain('client_id=test_client_id');
    });
  });

  // Test callback endpoint
  describe('GET /callback', () => {
    test('should handle invalid state parameter', async () => {
      const response = await request(server)
        .get('/callback?state=invalid_state')
        .expect(302); // Expecting redirect

      expect(response.header.location).toContain('error=state_mismatch');
    });
  });

  // Test static file serving
  describe('Static File Serving', () => {
    test('should serve guess game intro page', async () => {
      const response = await request(server)
        .get('/guess-game-intro')
        .expect(200);

      expect(response.type).toContain('text/html');
    });

    test('should serve finish lyrics intro page', async () => {
      const response = await request(server)
        .get('/finish-lyrics-intro')
        .expect(200);

      expect(response.type).toContain('text/html');
    });

    test('should serve jeopardy intro page', async () => {
      const response = await request(server)
        .get('/jeopardy-intro')
        .expect(200);

      expect(response.type).toContain('text/html');
    });
  });
}); 