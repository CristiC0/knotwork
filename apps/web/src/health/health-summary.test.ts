import { describe, expect, it } from 'vitest';

import { summarizeHealth } from './health-summary.js';

const healthy = {
  status: 'ok',
  info: { database: { status: 'up' } },
  error: {},
  details: { database: { status: 'up' } },
};

const databaseDown = {
  status: 'error',
  info: {},
  error: { database: { status: 'down' } },
  details: { database: { status: 'down' } },
};

describe('summarizeHealth', () => {
  it('reports both as checking while the first request is pending', () => {
    expect(
      summarizeHealth({ isPending: true, isError: false, data: undefined, error: null }),
    ).toEqual({
      api: 'checking',
      database: 'checking',
    });
  });

  it('reports both as up for a healthy response', () => {
    expect(
      summarizeHealth({ isPending: false, isError: false, data: healthy, error: null }),
    ).toEqual({
      api: 'up',
      database: 'up',
    });
  });

  // Regression: after a successful load, a failed refetch keeps the old `data`.
  it('prefers a newer 503 error over stale healthy data', () => {
    expect(
      summarizeHealth({ isPending: false, isError: true, data: healthy, error: databaseDown }),
    ).toEqual({
      api: 'up',
      database: 'down',
    });
  });

  it('reports both as down when the request failed without a response', () => {
    expect(
      summarizeHealth({
        isPending: false,
        isError: true,
        data: healthy,
        error: new TypeError('Failed to fetch'),
      }),
    ).toEqual({ api: 'down', database: 'down' });
  });

  // Regression: a failed refetch whose error body is undefined must not fall
  // back to the stale healthy `data`.
  it('reports both as down when a refetch fails with an empty error', () => {
    expect(
      summarizeHealth({ isPending: false, isError: true, data: healthy, error: undefined }),
    ).toEqual({ api: 'down', database: 'down' });
  });
});
