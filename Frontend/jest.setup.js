// Jest setup file for jsdom environment
// This file runs before each test file

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup DOM globals that might be missing
if (typeof window !== 'undefined') {
  // Additional window setup if needed
  window.scrollTo = jest.fn();
  window.alert = jest.fn();
  window.confirm = jest.fn();
}

// Mock any global CSS or assets
jest.mock('./styles/css/styles.css', () => ({}), { virtual: true });
jest.mock('./assets/logo.svg', () => 'logo.svg', { virtual: true });
jest.mock('./assets/finish-lyric.svg', () => 'finish-lyric.svg', { virtual: true });
jest.mock('./assets/guess-song.svg', () => 'guess-song.svg', { virtual: true });
jest.mock('./assets/jeopardy.svg', () => 'jeopardy.svg', { virtual: true });
