import type {
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { describe, expect, it, vi } from 'vitest';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('pings the database with a short timeout', async () => {
    const result: HealthCheckResult = {
      status: 'ok',
      info: { database: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' } },
    };
    const pingCheck = vi.fn().mockResolvedValue({ database: { status: 'up' } });
    const health = {
      check: vi.fn(async (indicators: (() => Promise<unknown>)[]) => {
        await Promise.all(indicators.map((indicator) => indicator()));
        return result;
      }),
    };
    const controller = new HealthController(
      health as unknown as HealthCheckService,
      { pingCheck } as unknown as TypeOrmHealthIndicator,
    );

    await expect(controller.check()).resolves.toBe(result);
    expect(pingCheck).toHaveBeenCalledWith('database', { timeout: 1500 });
  });
});
