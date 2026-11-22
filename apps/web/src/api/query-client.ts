import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data counts as fresh for 30s, so revisiting a page doesn't refetch immediately.
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}
