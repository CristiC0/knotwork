import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HealthStatus } from './HealthStatus.js';

function renderWithQueryClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <HealthStatus />
    </QueryClientProvider>,
  );
}

function mockFetchResponse(status: number, body: unknown) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('HealthStatus', () => {
  it('shows API and database as up when the check passes', async () => {
    mockFetchResponse(200, {
      status: 'ok',
      info: { database: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' } },
    });

    renderWithQueryClient();

    expect(await screen.findByText('Up', { selector: '[data-testid="api-status"]' })).toBeVisible();
    expect(screen.getByTestId('database-status')).toHaveTextContent('Up');
  });

  it('shows the database as down when the API answers 503', async () => {
    mockFetchResponse(503, {
      status: 'error',
      info: {},
      error: { database: { status: 'down' } },
      details: { database: { status: 'down' } },
    });

    renderWithQueryClient();

    expect(
      await screen.findByText('Down', { selector: '[data-testid="database-status"]' }),
    ).toBeVisible();
    expect(screen.getByTestId('api-status')).toHaveTextContent('Up');
  });

  it('shows both as down when the API is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    renderWithQueryClient();

    expect(
      await screen.findByText('Down', { selector: '[data-testid="api-status"]' }),
    ).toBeVisible();
    expect(screen.getByTestId('database-status')).toHaveTextContent('Down');
  });
});
